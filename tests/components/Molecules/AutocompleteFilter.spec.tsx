import React, { createRef, useState } from 'react';
import { ThemeProvider } from '@mui/material';
import { fireEvent, render as testingLibraryRender, RenderResult, waitFor } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { Autocomplete } from '../../../src/components/Molecules/Autocomplete/Autocomplete.js';
import { getCreatedTheme } from '../../../src/index.js';

function render(ui: React.ReactElement): RenderResult {
    return testingLibraryRender(<ThemeProvider theme={getCreatedTheme('light')}>{ui}</ThemeProvider>);
}

describe('Autocomplete filter variant', () => {
    const options = [
        { id: 1, label: 'Onet' },
        { id: 2, label: 'Fakt' },
    ];
    const labels = { title: 'Publications', searchPlaceholder: 'Search publications' };
    const getOptionLabel = (option: unknown): string => (option as { label: string }).label;

    const isOptionEqualToValue = (option: unknown, value: unknown): boolean => {
        return (option as { id: number }).id === (value as { id: number }).id;
    };

    it('should filter options and show the selected count without rendering chips', async () => {
        const { getByRole, getByText, queryByText } = render(
            <Autocomplete
                variant="filter"
                labels={labels}
                defaultValue={options[0]}
                options={options}
                getOptionLabel={getOptionLabel}
                isOptionEqualToValue={isOptionEqualToValue}
            />,
        );

        fireEvent.mouseDown(getByRole('combobox', { name: 'Publications' }));
        fireEvent.change(getByRole('textbox'), { target: { value: 'Fakt' } });

        await waitFor(() => expect(queryByText('Onet')).toBeNull());
        fireEvent.click(getByText('Fakt'));

        expect(getByText('1')).toBeDefined();
        expect(queryByText('Fakt', { selector: '.MuiChip-label' })).toBeNull();
    });

    it('should open when the filter trigger label is clicked', () => {
        const { getByRole, getByText } = render(
            <Autocomplete variant="filter" labels={labels} options={options} getOptionLabel={getOptionLabel} />,
        );

        fireEvent.click(getByText('Publications'));

        expect(getByRole('listbox')).toBeDefined();
    });

    it('should close when the open filter trigger label is clicked', () => {
        const { getByRole, getByText, queryByRole } = render(
            <Autocomplete variant="filter" labels={labels} options={options} getOptionLabel={getOptionLabel} />,
        );

        fireEvent.click(getByText('Publications'));
        expect(getByRole('listbox')).toBeDefined();

        fireEvent.click(getByText('Publications'));
        expect(queryByRole('listbox')).toBeNull();
    });

    it('should keep the options panel open when the paper slot has a ref', () => {
        const paperRef = createRef<HTMLDivElement>();
        const { getByRole } = render(
            <Autocomplete
                variant="filter"
                labels={labels}
                defaultValue={options[0]}
                options={options}
                getOptionLabel={getOptionLabel}
                slotProps={{ paper: { ref: paperRef } }}
            />,
        );

        fireEvent.mouseDown(getByRole('combobox', { name: 'Publications' }));
        fireEvent.mouseDown(getByRole('textbox'));

        expect(paperRef.current).not.toBeNull();
        expect(getByRole('listbox')).toBeDefined();
    });

    it('should filter primitive options without a custom label resolver', async () => {
        const { getByRole, queryByText } = render(<Autocomplete variant="filter" labels={labels} options={[1, 2]} />);

        fireEvent.mouseDown(getByRole('combobox', { name: 'Publications' }));
        fireEvent.change(getByRole('textbox'), { target: { value: '2' } });

        await waitFor(() => expect(queryByText('1')).toBeNull());
        expect(queryByText('2')).toBeDefined();
    });

    it('should keep the options panel open after selecting in multiple mode', () => {
        const { getByRole, getByText } = render(
            <Autocomplete
                variant="filter"
                labels={labels}
                multiple={true}
                options={options}
                getOptionLabel={getOptionLabel}
                isOptionEqualToValue={isOptionEqualToValue}
            />,
        );

        fireEvent.mouseDown(getByRole('combobox', { name: 'Publications' }));
        fireEvent.click(getByText('Onet'));

        expect(getByRole('listbox')).toBeDefined();
    });

    it('should close after selecting in multiple mode when disableCloseOnSelect is false', () => {
        const { getByRole, getByText, queryByRole } = render(
            <Autocomplete
                variant="filter"
                labels={labels}
                multiple={true}
                options={options}
                getOptionLabel={getOptionLabel}
                isOptionEqualToValue={isOptionEqualToValue}
                disableCloseOnSelect={false}
            />,
        );

        fireEvent.mouseDown(getByRole('combobox', { name: 'Publications' }));
        fireEvent.click(getByText('Onet'));

        expect(queryByRole('listbox')).toBeNull();
    });

    it('should preserve the selected count space while the trigger is hovered', () => {
        const { getByRole, getByText } = render(
            <Autocomplete
                variant="filter"
                labels={labels}
                multiple={true}
                defaultValue={[options[0]]}
                options={options}
                getOptionLabel={getOptionLabel}
                isOptionEqualToValue={isOptionEqualToValue}
            />,
        );
        const trigger = getByRole('combobox', { name: 'Publications' });
        const countChip = getByText('1').closest('.MuiChip-root');

        if (!countChip) {
            throw new Error('Selected count chip was not rendered.');
        }

        expect(getComputedStyle(countChip).visibility).toBe('visible');

        fireEvent.mouseEnter(trigger);

        expect(getComputedStyle(countChip).visibility).toBe('hidden');

        fireEvent.mouseLeave(trigger);

        expect(getComputedStyle(countChip).visibility).toBe('visible');
    });

    it('should reserve space for the selected count before an option is selected', () => {
        const { container } = render(
            <Autocomplete
                variant="filter"
                labels={labels}
                multiple={true}
                options={options}
                getOptionLabel={getOptionLabel}
                isOptionEqualToValue={isOptionEqualToValue}
            />,
        );

        const reservedSpace = container.querySelector('[aria-hidden="true"]');

        expect(reservedSpace).not.toBeNull();
        expect(getComputedStyle(reservedSpace as Element).width).toBe('24px');
    });

    it('should align the selected count with the label and popup indicator with the trigger end', () => {
        const { container } = render(
            <Autocomplete
                variant="filter"
                labels={labels}
                defaultValue={options[0]}
                options={options}
                getOptionLabel={getOptionLabel}
                sx={{ minWidth: 200 }}
            />,
        );
        const selectedCount = container.querySelector('.MuiChip-root');
        const endAdornment = container.querySelector('.MuiAutocomplete-endAdornment');

        expect(selectedCount).not.toBeNull();
        expect(endAdornment).not.toBeNull();
        expect(getComputedStyle(selectedCount as Element).marginLeft).toBe('0px');
        expect(getComputedStyle(endAdornment as Element).marginLeft).toBe('-24px');
    });

    it('should support controlled popup search values', async () => {
        function ControlledAutocomplete(): React.JSX.Element {
            const [inputValue, setInputValue] = useState('Fakt');

            return (
                <Autocomplete
                    variant="filter"
                    labels={labels}
                    options={options}
                    inputValue={inputValue}
                    getOptionLabel={getOptionLabel}
                    onInputChange={(event, nextInputValue): void => {
                        void event;
                        setInputValue(nextInputValue);
                    }}
                />
            );
        }

        const { getByRole } = render(<ControlledAutocomplete />);
        fireEvent.mouseDown(getByRole('combobox', { name: 'Publications' }));

        expect((getByRole('textbox') as HTMLInputElement).value).toBe('Fakt');
        fireEvent.change(getByRole('textbox'), { target: { value: 'Onet' } });
        await waitFor(() => expect((getByRole('textbox') as HTMLInputElement).value).toBe('Onet'));
    });

    it('should forward keyboard navigation and focus the popup search field', async () => {
        const { getByRole, getByText } = render(
            <Autocomplete variant="filter" labels={labels} options={options} getOptionLabel={getOptionLabel} />,
        );

        fireEvent.mouseDown(getByRole('combobox', { name: 'Publications' }));
        await waitFor(() => expect(document.activeElement).toBe(getByRole('textbox')));
        fireEvent.keyDown(getByRole('textbox'), { key: 'ArrowDown' });
        fireEvent.keyDown(getByRole('textbox'), { key: 'Enter' });

        expect(getByText('1')).toBeDefined();
    });

    it('should preserve native Home and End behavior in the popup search field', () => {
        const { getByRole } = render(
            <Autocomplete variant="filter" labels={labels} options={options} getOptionLabel={getOptionLabel} />,
        );

        fireEvent.mouseDown(getByRole('combobox', { name: 'Publications' }));
        const searchInput = getByRole('textbox');
        const homeEvent = fireEvent.keyDown(searchInput, { key: 'Home' });
        const endEvent = fireEvent.keyDown(searchInput, { key: 'End' });

        expect(homeEvent).toBe(true);
        expect(endEvent).toBe(true);
    });

    it('should forward Page Up and Page Down to the autocomplete list', () => {
        const { getByRole } = render(
            <Autocomplete variant="filter" labels={labels} options={options} getOptionLabel={getOptionLabel} />,
        );

        fireEvent.mouseDown(getByRole('combobox', { name: 'Publications' }));
        const searchInput = getByRole('textbox');
        const pageUpEvent = fireEvent.keyDown(searchInput, { key: 'PageUp' });
        const pageDownEvent = fireEvent.keyDown(searchInput, { key: 'PageDown' });

        expect(pageUpEvent).toBe(false);
        expect(pageDownEvent).toBe(false);
    });

    it('should not forward search text field props to the autocomplete root', () => {
        const { container } = render(
            <Autocomplete
                variant="filter"
                labels={labels}
                options={options}
                getOptionLabel={getOptionLabel}
                searchTextFieldProps={{ placeholder: 'Find a publication' }}
            />,
        );
        const autocomplete = container.querySelector('.ring-autocomplete');

        expect(autocomplete?.hasAttribute('searchtextfieldprops')).toBe(false);
    });

    it('should support recently used items', () => {
        const storageKey = 'filter-autocomplete-recently-used';
        localStorage.setItem(storageKey, '[]');
        const { getByRole, getByText } = render(
            <Autocomplete
                variant="filter"
                labels={{ ...labels, recentlyUsed: 'Recently used', recentlyUsedResults: 'Results' }}
                options={options}
                getOptionLabel={getOptionLabel}
                showRecentlyUsed={true}
                recentlyLocalStorageKey={storageKey}
            />,
        );

        fireEvent.mouseDown(getByRole('combobox', { name: 'Publications' }));
        fireEvent.click(getByText('Onet'));

        expect(JSON.parse(localStorage.getItem(storageKey) || '[]')).toEqual([{ id: 1, label: 'Onet' }]);
        localStorage.removeItem(storageKey);
    });
});
