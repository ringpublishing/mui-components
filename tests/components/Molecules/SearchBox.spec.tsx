import { vi, describe, it, expect } from 'vitest';
import { act } from 'react';
import { fireEvent, render, waitFor } from '@testing-library/react';
import { SearchBox } from '../../../src/components/Molecules/SearchBox/SearchBox.js';

describe('SearchBox', () => {
    it('should render correctly', () => {
        expect(render(<SearchBox defaultValue="" searchFunc={vi.fn()} />).container).toMatchSnapshot();
    });

    it('should render correctly in controlled mode', () => {
        expect(render(<SearchBox value="" onChange={vi.fn()} />).container).toMatchSnapshot();
    });

    it('should call searchFunc when input value changes', async () => {
        const searchFunc = vi.fn();
        const { getByRole } = render(<SearchBox defaultValue="" searchFunc={searchFunc} debounceTime={0} />);

        act(() => {
            fireEvent.change(getByRole('textbox'), { target: { value: 'test' } });
        });

        await waitFor(() => expect(searchFunc).toHaveBeenCalledWith('test'));
    });

    it('should call onChange when input value changes in controlled mode', async () => {
        const onChange = vi.fn();
        const { getByRole } = render(<SearchBox value="" onChange={onChange} />);

        act(() => {
            fireEvent.change(getByRole('textbox'), { target: { value: 'test' } });
        });

        await waitFor(() => expect(onChange).toHaveBeenCalledWith('test'));
    });

    it('should clear input when clear button is clicked', async () => {
        const { getByRole, getByTestId } = render(
            <SearchBox defaultValue="" searchFunc={vi.fn()} debounceTime={0} withClearButton={true} />,
        );

        act(() => {
            fireEvent.change(getByRole('textbox'), { target: { value: 'test' } });
            fireEvent.click(getByTestId('ring-searchbox-clear'));
        });

        await waitFor(() => expect((getByRole('textbox') as HTMLInputElement).value).toBe(''));
    });

    it('should not show icon when withClearButton is false', () => {
        const { queryByTestId } = render(<SearchBox defaultValue="" searchFunc={vi.fn()} withClearButton={false} />);
        const icon = queryByTestId('ring-searchbox-clear');
        expect(icon).toBeNull();
    });

    it('should focus the input and highlight the icon when the icon is clicked', async () => {
        const { getByTestId, getByRole } = render(<SearchBox defaultValue="" searchFunc={vi.fn()} />);
        const icon = getByTestId('ring-searchbox-search');
        const input = getByRole('textbox');

        const initialCssClass = icon.classList['2'];

        act(() => {
            fireEvent.click(icon);
        });

        await waitFor(() => {
            expect(document.activeElement).toBe(input);
            expect(icon.classList['2']).not.toEqual(initialCssClass);
        });
    });

    it('should unhighlight the icon when the input is blurred and the input value is empty', async () => {
        const { getByTestId, getByRole } = render(<SearchBox defaultValue="" searchFunc={vi.fn()} />);
        const icon = getByTestId('ring-searchbox-search');
        const input = getByRole('textbox');

        const initialCssClass = icon.classList['2'];

        act(() => {
            fireEvent.click(icon);
        });

        await waitFor(() => {
            expect(icon.classList['2']).not.toEqual(initialCssClass);
        });

        act(() => {
            fireEvent.blur(input);
        });

        await waitFor(() => {
            expect(icon.classList['2']).toEqual(initialCssClass);
        });
    });

    it('should show placeholder', () => {
        const labels = {
            placeholder: 'Test Placeholder',
        };

        const { getByRole } = render(
            <SearchBox defaultValue="" searchFunc={vi.fn()} labels={labels} withClearButton={true} />,
        );

        const input = getByRole('textbox') as HTMLInputElement;

        expect(input.placeholder).toBe(labels.placeholder);
    });

    it('should not call searchFunc on focus or blur on the input', async () => {
        const searchFunc = vi.fn();

        const { getByRole } = render(<SearchBox defaultValue="" searchFunc={searchFunc} debounceTime={0} />);
        const input = getByRole('textbox');

        await waitFor(() => {
            expect(searchFunc).toHaveBeenCalledTimes(1);
        });

        act(() => {
            fireEvent.focus(input);
        });

        await waitFor(() => {
            expect(searchFunc).toHaveBeenCalledTimes(1);
        });

        act(() => {
            fireEvent.blur(input);
        });

        await waitFor(() => {
            expect(searchFunc).toHaveBeenCalledTimes(1);
        });
    });
});
