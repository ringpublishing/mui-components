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

    it('should render a medium field by default and a small one with size small', () => {
        const { getByTestId, rerender } = render(<SearchBox defaultValue="" searchFunc={vi.fn()} />);

        expect(getByTestId('ring-searchbox').classList.contains('MuiInputBase-sizeSmall')).toBe(false);

        rerender(<SearchBox defaultValue="" searchFunc={vi.fn()} size="small" />);

        expect(getByTestId('ring-searchbox').classList.contains('MuiInputBase-sizeSmall')).toBe(true);
    });

    it('should be a block-level flex box rather than a full-width field', () => {
        const { getByTestId } = render(<SearchBox defaultValue="" searchFunc={vi.fn()} />);
        const root = getByTestId('ring-searchbox');

        expect(root.classList.contains('MuiInputBase-fullWidth')).toBe(false);
        expect(getComputedStyle(root).display).toBe('flex');
    });

    it('should clear with a button named by labels.clear and return focus to the input', async () => {
        const { getByRole, queryByRole } = render(
            <SearchBox
                defaultValue="test"
                searchFunc={vi.fn()}
                debounceTime={0}
                withClearButton={true}
                labels={{ clear: 'Clear search' }}
            />,
        );

        act(() => {
            fireEvent.click(getByRole('button', { name: 'Clear search' }));
        });

        await waitFor(() => {
            expect((getByRole('textbox') as HTMLInputElement).value).toBe('');
            expect(document.activeElement).toBe(getByRole('textbox'));
            expect(queryByRole('button', { name: 'Clear search' })).toBeNull();
        });
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
