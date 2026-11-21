import React from 'react';
import { ThemeProvider } from '@mui/material';
import { fireEvent, render as testingLibraryRender, RenderResult } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { Autocomplete } from '../../../src/components/Molecules/Autocomplete/Autocomplete.js';
import { getCreatedTheme } from '../../../src/index.js';

function render(ui: React.ReactElement): RenderResult {
    return testingLibraryRender(<ThemeProvider theme={getCreatedTheme('light')}>{ui}</ThemeProvider>);
}

interface Publication {
    id: number;
    label: string;
}

const options: Publication[] = [
    { id: 1, label: 'Onet' },
    { id: 2, label: 'Fakt' },
    { id: 3, label: 'TVN' },
];
const manyOptions: Publication[] = Array.from({ length: 9 }, (unused, index) => ({
    id: index,
    label: `Title ${index}`,
}));
const labels = { title: 'Publications', searchPlaceholder: 'Search publications' };

const readSearchValue = (getByRole: RenderResult['getByRole']): string =>
    (getByRole('textbox') as HTMLInputElement).value;

const readInputChanges = (onInputChange: ReturnType<typeof vi.fn>): unknown[][] =>
    onInputChange.mock.calls.map((call) => call.slice(1));

describe('Autocomplete filter variant: search field', () => {
    it('should render the search field with its test id and the placeholder from labels', () => {
        const { getByText, getByTestId, getByRole } = render(
            <Autocomplete variant="filter" labels={labels} options={options} />,
        );

        fireEvent.click(getByText('Publications'));

        const searchInput = getByTestId('ring-autocomplete-search-input') as HTMLInputElement;

        expect(searchInput).toBe(getByRole('textbox'));
        expect(searchInput.placeholder).toBe('Search publications');
    });

    it('should hide the search icon from assistive technology', () => {
        const { getByText, getByRole } = render(<Autocomplete variant="filter" labels={labels} options={options} />);

        fireEvent.click(getByText('Publications'));

        const icon = getByRole('textbox').parentElement?.querySelector('svg');

        expect(icon?.getAttribute('aria-hidden')).toBe('true');
    });

    it('should render the search field without a placeholder when labels give none', () => {
        const { getByText, getByRole } = render(
            <Autocomplete variant="filter" labels={{ title: 'Publications' }} options={options} />,
        );

        fireEvent.click(getByText('Publications'));

        expect((getByRole('textbox') as HTMLInputElement).placeholder).toBe('');
    });

    it('should hand searchTextFieldProps to the search field', () => {
        const { getByText, getByTestId } = render(
            <Autocomplete
                variant="filter"
                labels={labels}
                options={options}
                searchTextFieldProps={{
                    helperText: 'Type a title',
                    slotProps: { htmlInput: { maxLength: 12 } },
                }}
            />,
        );

        fireEvent.click(getByText('Publications'));

        getByText('Type a title');
        expect((getByTestId('ring-autocomplete-search-input') as HTMLInputElement).maxLength).toBe(12);
    });

    it('should call a custom filterOptions with the search text as inputValue', () => {
        const filterOptions = vi.fn((optionsToFilter: Publication[], state: { inputValue: string }): Publication[] =>
            optionsToFilter.filter((option) => option.label.startsWith(state.inputValue)),
        );
        const { getAllByRole, getByRole, getByText } = render(
            <Autocomplete<Publication>
                variant="filter"
                labels={labels}
                options={options}
                filterOptions={filterOptions}
            />,
        );

        fireEvent.click(getByText('Publications'));
        fireEvent.change(getByRole('textbox'), { target: { value: 'T' } });

        expect(filterOptions.mock.lastCall?.[1].inputValue).toBe('T');
        // The built-in filter would also keep "Onet" and "Fakt", which contain the letter.
        expect(getAllByRole('option').map((option) => option.textContent)).toEqual(['TVN']);
    });

    it('should report typed search text with the input reason', () => {
        const onInputChange = vi.fn();
        const { getByRole, getByText } = render(
            <Autocomplete variant="filter" labels={labels} options={options} onInputChange={onInputChange} />,
        );

        fireEvent.click(getByText('Publications'));
        fireEvent.change(getByRole('textbox'), { target: { value: 'Fa' } });

        expect(readInputChanges(onInputChange)).toEqual([['Fa', 'input']]);
        expect(readSearchValue(getByRole)).toBe('Fa');
    });

    it('should keep the search text after an option is picked', () => {
        const { getAllByRole, getByRole, getByText } = render(
            <Autocomplete variant="filter" labels={labels} options={options} />,
        );

        fireEvent.click(getByText('Publications'));
        // Typed into the combobox itself, so that it has text of its own to reset when the option is picked.
        fireEvent.change(getByRole('combobox', { name: 'Publications' }), { target: { value: 'a' } });
        fireEvent.click(getByRole('option', { name: 'Fakt' }));
        fireEvent.click(getByText('Publications'));

        expect(readSearchValue(getByRole)).toBe('a');
        expect(getAllByRole('option').map((option) => option.textContent)).toEqual(['Fakt']);
    });

    it('should not report an input change when an option is picked', () => {
        const onInputChange = vi.fn();
        const { getByRole, getByText } = render(
            <Autocomplete variant="filter" labels={labels} options={options} onInputChange={onInputChange} />,
        );

        fireEvent.click(getByText('Publications'));
        // Typed into the combobox itself, so that it has text of its own to reset when the option is picked.
        fireEvent.change(getByRole('combobox', { name: 'Publications' }), { target: { value: 'a' } });
        fireEvent.click(getByRole('option', { name: 'Fakt' }));

        expect(readInputChanges(onInputChange)).toEqual([['a', 'input']]);
    });

    it('should empty the search text and report the clear reason when Clear is pressed', () => {
        const onInputChange = vi.fn();
        const { getAllByRole, getByRole, getByTestId, getByText } = render(
            <Autocomplete
                variant="filter"
                labels={labels}
                defaultValue={options[1]}
                options={options}
                onInputChange={onInputChange}
            />,
        );

        fireEvent.click(getByText('Publications'));
        fireEvent.change(getByRole('textbox'), { target: { value: 'a' } });
        fireEvent.click(getByText('Publications'));
        fireEvent.click(getByTestId('ring-autocomplete-clear'));

        expect(readInputChanges(onInputChange)).toEqual([
            ['a', 'input'],
            ['', 'clear'],
        ]);

        fireEvent.click(getByText('Publications'));

        expect(readSearchValue(getByRole)).toBe('');
        expect(getAllByRole('option')).toHaveLength(3);
    });
});

describe('Autocomplete filter variant: keys forwarded from the search field', () => {
    it('should move to the last option on ArrowUp and pick it on Enter', () => {
        const onChange = vi.fn();
        const { getByRole, getByText } = render(
            <Autocomplete variant="filter" labels={labels} options={manyOptions} onChange={onChange} />,
        );

        fireEvent.click(getByText('Publications'));
        fireEvent.keyDown(getByRole('textbox'), { key: 'ArrowUp' });
        fireEvent.keyDown(getByRole('textbox'), { key: 'Enter' });

        expect(onChange).toHaveBeenCalledTimes(1);
        expect(onChange.mock.calls[0][1]).toEqual(manyOptions[8]);
    });

    it('should move five options forward on PageDown', () => {
        const onChange = vi.fn();
        const { getByRole, getByText } = render(
            <Autocomplete variant="filter" labels={labels} options={manyOptions} onChange={onChange} />,
        );

        fireEvent.click(getByText('Publications'));
        fireEvent.keyDown(getByRole('textbox'), { key: 'PageDown' });
        fireEvent.keyDown(getByRole('textbox'), { key: 'Enter' });

        expect(onChange).toHaveBeenCalledTimes(1);
        expect(onChange.mock.calls[0][1]).toEqual(manyOptions[4]);
    });

    it('should move five options back on PageUp', () => {
        const onChange = vi.fn();
        const { getByRole, getByText } = render(
            <Autocomplete variant="filter" labels={labels} options={manyOptions} onChange={onChange} />,
        );

        fireEvent.click(getByText('Publications'));
        fireEvent.keyDown(getByRole('textbox'), { key: 'ArrowUp' });
        fireEvent.keyDown(getByRole('textbox'), { key: 'PageUp' });
        fireEvent.keyDown(getByRole('textbox'), { key: 'Enter' });

        expect(onChange).toHaveBeenCalledTimes(1);
        expect(onChange.mock.calls[0][1]).toEqual(manyOptions[3]);
    });

    it('should close the list on Escape and report the escape reason', () => {
        const onChange = vi.fn();
        const onClose = vi.fn();
        const { getByRole, getByText, queryByRole } = render(
            <Autocomplete
                variant="filter"
                labels={labels}
                options={manyOptions}
                onChange={onChange}
                onClose={onClose}
            />,
        );

        fireEvent.click(getByText('Publications'));
        fireEvent.keyDown(getByRole('textbox'), { key: 'ArrowDown' });
        fireEvent.keyDown(getByRole('textbox'), { key: 'Escape' });

        expect(queryByRole('listbox')).toBeNull();
        expect(onClose).toHaveBeenCalledTimes(1);
        expect(onClose.mock.calls[0][1]).toBe('escape');
        expect(onChange).not.toHaveBeenCalled();
    });
});
