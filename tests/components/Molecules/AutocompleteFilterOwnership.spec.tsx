import React from 'react';
import { ThemeProvider } from '@mui/material';
import { act, fireEvent, render as testingLibraryRender, RenderResult, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { Autocomplete } from '../../../src/components/Molecules/Autocomplete/Autocomplete.js';
import { getCreatedTheme } from '../../../src/index.js';

function withTheme(ui: React.ReactElement): React.ReactElement {
    return <ThemeProvider theme={getCreatedTheme('light')}>{ui}</ThemeProvider>;
}

function render(ui: React.ReactElement): RenderResult {
    return testingLibraryRender(withTheme(ui));
}

interface Publication {
    id: number;
    label: string;
}

const onet: Publication = { id: 1, label: 'Onet' };
const fakt: Publication = { id: 2, label: 'Fakt' };
const tvn: Publication = { id: 3, label: 'TVN' };
const options = [onet, fakt, tvn];
const labels = { title: 'Publications', searchPlaceholder: 'Search publications' };

const isOptionEqualToValue = (option: Publication, value: Publication): boolean => option.id === value.id;

const readOptions = (getAllByRole: RenderResult['getAllByRole']): string[] =>
    getAllByRole('option').map((option) => `${option.textContent}:${option.getAttribute('aria-selected')}`);

describe('Autocomplete filter variant: trigger', () => {
    it('should draw a title that is given as a node', () => {
        const { getByText } = render(
            <Autocomplete variant="filter" labels={{ title: <em>Publications</em> }} options={options} />,
        );

        expect(getByText('Publications').tagName).toBe('EM');
    });

    it('should remove every value with the Clear button and leave the list closed', () => {
        const onChange = vi.fn();
        const { getByTestId, getByText, queryByRole, queryByText } = render(
            <Autocomplete
                variant="filter"
                labels={labels}
                multiple={true}
                defaultValue={[onet, fakt]}
                options={options}
                onChange={onChange}
            />,
        );

        expect(getByText(/^\d+$/).textContent).toBe('2');

        fireEvent.click(getByTestId('ring-autocomplete-clear'));

        expect(queryByText(/^\d+$/)).toBeNull();
        expect(onChange).toHaveBeenCalledTimes(1);
        expect(onChange.mock.calls[0].slice(1, 3)).toEqual([[], 'clear']);
        expect(queryByRole('listbox')).toBeNull();
    });

    it('should toggle the list once per click on the popup indicator', () => {
        const onOpen = vi.fn();
        const onClose = vi.fn();
        const { getByRole, queryByRole } = render(
            <Autocomplete variant="filter" labels={labels} options={options} onOpen={onOpen} onClose={onClose} />,
        );

        fireEvent.click(getByRole('button', { name: 'Open' }));

        getByRole('listbox');
        expect(onOpen).toHaveBeenCalledTimes(1);
        expect(onClose).not.toHaveBeenCalled();

        fireEvent.click(getByRole('button', { name: 'Close' }));

        expect(queryByRole('listbox')).toBeNull();
        expect(onOpen).toHaveBeenCalledTimes(1);
        expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('should stay open after a full click on the combobox input', () => {
        const onClose = vi.fn();
        const { getByRole } = render(
            <Autocomplete variant="filter" labels={labels} options={options} onClose={onClose} />,
        );
        const input = getByRole('combobox', { name: 'Publications' });

        fireEvent.mouseDown(input);
        fireEvent.mouseUp(input);
        fireEvent.click(input);

        getByRole('listbox');
        expect(onClose).not.toHaveBeenCalled();
    });

    it('should report opening through the trigger', () => {
        const onOpen = vi.fn();
        const { getByRole, getByText } = render(
            <Autocomplete variant="filter" labels={labels} options={options} onOpen={onOpen} />,
        );
        const input = getByRole('combobox', { name: 'Publications' });

        expect(input.getAttribute('aria-expanded')).toBe('false');

        fireEvent.click(getByText('Publications'));

        expect(onOpen).toHaveBeenCalledTimes(1);
        expect(input.getAttribute('aria-expanded')).toBe('true');
    });

    it('should report closing through the trigger with the toggleInput reason', () => {
        const onOpen = vi.fn();
        const onClose = vi.fn();
        const { getByRole, getByText } = render(
            <Autocomplete variant="filter" labels={labels} options={options} onOpen={onOpen} onClose={onClose} />,
        );

        fireEvent.click(getByText('Publications'));
        fireEvent.click(getByText('Publications'));

        expect(onOpen).toHaveBeenCalledTimes(1);
        expect(onClose).toHaveBeenCalledTimes(1);
        expect(onClose.mock.calls[0][1]).toBe('toggleInput');
        expect(getByRole('combobox', { name: 'Publications' }).getAttribute('aria-expanded')).toBe('false');
    });

    it('should ignore trigger clicks when disabled', () => {
        const onOpen = vi.fn();
        const { getByText, queryByRole } = render(
            <Autocomplete variant="filter" labels={labels} options={options} disabled={true} onOpen={onOpen} />,
        );

        fireEvent.click(getByText('Publications'));

        expect(queryByRole('listbox')).toBeNull();
        expect(onOpen).not.toHaveBeenCalled();
    });

    it.each([
        { disabled: false, cursor: 'pointer' },
        { disabled: true, cursor: 'default' },
    ])('should use the $cursor cursor on the trigger when disabled is $disabled', ({ disabled, cursor }) => {
        const { getByText } = render(
            <Autocomplete variant="filter" labels={labels} options={options} disabled={disabled} />,
        );
        const trigger = getByText('Publications').closest('.MuiInputBase-root');

        expect(getComputedStyle(trigger as Element).cursor).toBe(cursor);
    });

    it('should show a progress indicator before the popup indicator while loading', () => {
        const { getByRole } = render(
            <Autocomplete variant="filter" labels={labels} options={options} loading={true} />,
        );
        const progress = getByRole('progressbar');
        const popupIndicator = getByRole('button', { name: 'Open' });

        expect(progress.compareDocumentPosition(popupIndicator) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    });

    it('should not show a progress indicator when not loading', () => {
        const { queryByTestId, queryByRole } = render(
            <Autocomplete variant="filter" labels={labels} options={options} />,
        );

        expect(queryByTestId('ring-autocomplete-circular-progress')).toBeNull();
        expect(queryByRole('progressbar')).toBeNull();
    });
});

describe('Autocomplete filter variant: open state', () => {
    it('should show the list for as long as the consumer keeps open true', () => {
        const onClose = vi.fn();
        const { getByRole, getByText, queryByRole, rerender } = render(
            <Autocomplete variant="filter" labels={labels} options={options} open={true} onClose={onClose} />,
        );

        getByRole('listbox');

        fireEvent.click(getByText('Publications'));

        expect(onClose).toHaveBeenCalledTimes(1);
        expect(onClose.mock.calls[0][1]).toBe('toggleInput');
        getByRole('listbox');

        fireEvent.keyDown(getByRole('textbox'), { key: 'Escape' });

        expect(onClose).toHaveBeenCalledTimes(2);
        expect(onClose.mock.calls[1][1]).toBe('escape');
        getByRole('listbox');

        rerender(
            withTheme(
                <Autocomplete variant="filter" labels={labels} options={options} open={false} onClose={onClose} />,
            ),
        );

        expect(queryByRole('listbox')).toBeNull();
    });

    it('should keep the list closed while the consumer keeps open false', () => {
        const onOpen = vi.fn();
        const { getByText, queryByRole } = render(
            <Autocomplete variant="filter" labels={labels} options={options} open={false} onOpen={onOpen} />,
        );

        fireEvent.click(getByText('Publications'));

        expect(onOpen).toHaveBeenCalledTimes(1);
        expect(queryByRole('listbox')).toBeNull();
    });

    it('should not report a close when focus moves from the combobox into the search field', async () => {
        const onClose = vi.fn();
        const { getByRole } = render(
            <Autocomplete variant="filter" labels={labels} options={options} onClose={onClose} />,
        );
        const input = getByRole('combobox', { name: 'Publications' });

        act(() => input.focus());
        fireEvent.mouseDown(input);
        await waitFor(() => expect(document.activeElement).toBe(getByRole('textbox')));

        getByRole('listbox');
        expect(onClose).not.toHaveBeenCalled();
    });

    it('should close on a press outside and report the blur reason', () => {
        const onClose = vi.fn();
        const { getByText, queryByRole } = render(
            <Autocomplete variant="filter" labels={labels} options={options} onClose={onClose} />,
        );

        fireEvent.click(getByText('Publications'));
        fireEvent.mouseDown(document.body);

        expect(queryByRole('listbox')).toBeNull();
        expect(onClose).toHaveBeenCalledTimes(1);
        expect(onClose.mock.calls[0][1]).toBe('blur');
    });

    it('should report a press outside without closing a list the consumer keeps open', () => {
        const onClose = vi.fn();
        const { getByRole } = render(
            <Autocomplete variant="filter" labels={labels} options={options} open={true} onClose={onClose} />,
        );

        fireEvent.mouseDown(document.body);

        expect(onClose).toHaveBeenCalledTimes(1);
        expect(onClose.mock.calls[0][1]).toBe('blur');
        getByRole('listbox');
    });

    it('should not report a close for a press outside while the list is closed', () => {
        const onClose = vi.fn();

        render(<Autocomplete variant="filter" labels={labels} options={options} onClose={onClose} />);
        fireEvent.mouseDown(document.body);

        expect(onClose).not.toHaveBeenCalled();
    });

    it('should stay open on a press inside the trigger', () => {
        const onClose = vi.fn();
        const { getByRole, getByText } = render(
            <Autocomplete variant="filter" labels={labels} options={options} onClose={onClose} />,
        );

        fireEvent.click(getByText('Publications'));
        fireEvent.mouseDown(getByText('Publications'));

        getByRole('listbox');
        expect(onClose).not.toHaveBeenCalled();
    });

    it('should close after an option is picked in single mode', () => {
        const onClose = vi.fn();
        const { getByRole, getByText, queryByRole } = render(
            <Autocomplete variant="filter" labels={labels} options={options} onClose={onClose} />,
        );

        fireEvent.click(getByText('Publications'));
        fireEvent.click(getByRole('option', { name: 'Fakt' }));

        expect(queryByRole('listbox')).toBeNull();
        expect(onClose).toHaveBeenCalledTimes(1);
        expect(onClose.mock.calls[0][1]).toBe('selectOption');
    });
});

describe('Autocomplete filter variant: value', () => {
    it('should mark the default value as selected in the list', () => {
        const { getAllByRole, getByText } = render(
            <Autocomplete<Publication>
                variant="filter"
                labels={labels}
                multiple={true}
                defaultValue={[{ ...fakt }]}
                options={options}
                isOptionEqualToValue={isOptionEqualToValue}
            />,
        );

        fireEvent.click(getByText('Publications'));

        expect(readOptions(getAllByRole)).toEqual(['Onet:false', 'Fakt:true', 'TVN:false']);
    });

    it('should take the count and the selection from a controlled value only', () => {
        const onChange = vi.fn();
        const renderWithValue = (value: Publication[]): React.ReactElement =>
            withTheme(
                <Autocomplete<Publication>
                    variant="filter"
                    labels={labels}
                    multiple={true}
                    value={value}
                    options={options}
                    isOptionEqualToValue={isOptionEqualToValue}
                    onChange={onChange}
                />,
            );
        const { getAllByRole, getByRole, getByText, queryByText, rerender } = testingLibraryRender(
            renderWithValue([{ ...onet }]),
        );

        expect(getByText(/^\d+$/).textContent).toBe('1');

        fireEvent.click(getByText('Publications'));
        fireEvent.click(getByRole('option', { name: 'Fakt' }));

        // The consumer did not accept the change, so nothing moves.
        expect(onChange).toHaveBeenCalledTimes(1);
        expect(onChange.mock.calls[0].slice(1, 3)).toEqual([[onet, fakt], 'selectOption']);
        expect(getByText(/^\d+$/).textContent).toBe('1');
        expect(readOptions(getAllByRole)).toEqual(['Onet:true', 'Fakt:false', 'TVN:false']);

        rerender(renderWithValue([{ ...fakt }, { ...tvn }]));

        expect(getByText(/^\d+$/).textContent).toBe('2');
        expect(readOptions(getAllByRole)).toEqual(['Onet:false', 'Fakt:true', 'TVN:true']);

        rerender(renderWithValue([]));

        expect(queryByText(/^\d+$/)).toBeNull();
        expect(readOptions(getAllByRole)).toEqual(['Onet:false', 'Fakt:false', 'TVN:false']);
    });

    it('should report picked and removed options through onChange', () => {
        const onChange = vi.fn();
        const { getByRole, getByText } = render(
            <Autocomplete<Publication>
                variant="filter"
                labels={labels}
                multiple={true}
                options={options}
                isOptionEqualToValue={isOptionEqualToValue}
                onChange={onChange}
            />,
        );

        fireEvent.click(getByText('Publications'));
        fireEvent.click(getByRole('option', { name: 'Fakt' }));

        expect(onChange).toHaveBeenCalledTimes(1);
        expect(onChange.mock.calls[0].slice(1)).toEqual([[fakt], 'selectOption', { option: fakt }]);

        fireEvent.click(getByRole('option', { name: 'Fakt' }));

        expect(onChange).toHaveBeenCalledTimes(2);
        expect(onChange.mock.calls[1].slice(1)).toEqual([[], 'removeOption', { option: fakt }]);
    });
});
