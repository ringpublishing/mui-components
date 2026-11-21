import React from 'react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { fireEvent, render, within } from '@testing-library/react';
import {
    Autocomplete,
    AutocompleteChipRenderContext,
    ChipsInputAutocompleteProps,
    DefaultAutocompleteProps,
} from '../../../src/components/Molecules/Autocomplete/Autocomplete.js';

describe('Autocomplete - chipsInput value and input ownership', () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    const setup = (
        props: Partial<ChipsInputAutocompleteProps<string>> = {},
    ): { input: HTMLInputElement; container: HTMLElement } => {
        const { container } = render(
            <Autocomplete<string> variant="chipsInput" labels={{ title: 'Tags' }} {...props} />,
        );

        return { input: within(container).getByRole('combobox') as HTMLInputElement, container };
    };

    const chipLabels = (container: HTMLElement): string[] =>
        Array.from(container.querySelectorAll('.MuiChip-label')).map((chip) => chip.textContent ?? '');

    const errorChipLabels = (container: HTMLElement): string[] =>
        Array.from(container.querySelectorAll('.MuiChip-colorError')).map((chip) => chip.textContent ?? '');

    const enter = (input: HTMLInputElement, text: string): void => {
        fireEvent.change(input, { target: { value: text } });
        fireEvent.keyDown(input, { key: 'Enter' });
    };

    /** Returns `false` when the component cancelled the paste. */
    const paste = (input: HTMLInputElement, text: string): boolean =>
        fireEvent.paste(input, { clipboardData: { getData: (): string => text } });

    const deleteChip = (container: HTMLElement, index: number): void => {
        fireEvent.click(container.querySelectorAll('.MuiChip-deleteIcon')[index]);
    };

    describe('value', () => {
        it('starts from defaultValue and adds typed entries to it', () => {
            const { input, container } = setup({ defaultValue: ['a'] });

            expect(chipLabels(container)).toEqual(['a']);

            enter(input, 'b');

            expect(chipLabels(container)).toEqual(['a', 'b']);
        });

        it('keeps rendering the value prop when the consumer does not store a change', () => {
            const onChange = vi.fn();
            const { input, container } = setup({ value: ['a'], onChange, createChipsOnPaste: true });

            enter(input, 'b');

            expect(onChange).toHaveBeenCalledTimes(1);
            expect(onChange.mock.calls[0][1]).toEqual(['a', 'b']);
            expect(chipLabels(container)).toEqual(['a']);

            paste(input, 'c');

            expect(onChange).toHaveBeenCalledTimes(2);
            expect(onChange.mock.calls[1][1]).toEqual(['a', 'c']);
            expect(chipLabels(container)).toEqual(['a']);
        });

        it('removes only the deleted entry and keeps the validation of the rest', () => {
            const { container } = setup({
                defaultValue: ['ok', 'not ok', 'fine', 'also bad'],
                validateEntry: (entry): boolean => !entry.includes(' '),
            });

            expect(errorChipLabels(container)).toEqual(['not ok', 'also bad']);

            deleteChip(container, 0);

            expect(chipLabels(container)).toEqual(['not ok', 'fine', 'also bad']);
            expect(errorChipLabels(container)).toEqual(['not ok', 'also bad']);
        });
    });

    describe('onChange arguments', () => {
        it('reports a typed entry as createOption with the entry in details', () => {
            const onChange = vi.fn();
            const { input } = setup({ defaultValue: ['a'], onChange });

            enter(input, 'b');

            expect(onChange).toHaveBeenCalledTimes(1);

            const [event, value, reason, details] = onChange.mock.calls[0];

            expect(event.type).toBe('keydown');
            expect(value).toEqual(['a', 'b']);
            expect(reason).toBe('createOption');
            expect(details).toEqual({ option: 'b' });
        });

        it('reports a deleted chip as removeOption with the entry in details', () => {
            const onChange = vi.fn();
            const { container } = setup({ defaultValue: ['a', 'b', 'c'], onChange });

            deleteChip(container, 1);

            expect(onChange).toHaveBeenCalledTimes(1);

            const [, value, reason, details] = onChange.mock.calls[0];

            expect(value).toEqual(['a', 'c']);
            expect(reason).toBe('removeOption');
            expect(details).toEqual({ option: 'b' });
        });

        it('names the last accepted entry of a paste in details, not the last pasted one', () => {
            const onChange = vi.fn();
            const { input } = setup({ defaultValue: ['y'], onChange, createChipsOnPaste: true });

            paste(input, 'x,z,y');

            expect(onChange).toHaveBeenCalledTimes(1);

            const [event, value, reason, details] = onChange.mock.calls[0];

            expect(event.type).toBe('paste');
            expect(value).toEqual(['y', 'x', 'z']);
            expect(reason).toBe('createOption');
            expect(details).toEqual({ option: 'z' });
        });
    });

    describe('input text', () => {
        it('reports typed text to onInputChange', () => {
            const onInputChange = vi.fn();
            const { input } = setup({ onInputChange });

            fireEvent.change(input, { target: { value: 'ab' } });

            expect(onInputChange).toHaveBeenCalledTimes(1);

            const [event, value, reason] = onInputChange.mock.calls[0];

            expect(event.type).toBe('change');
            expect(value).toBe('ab');
            expect(reason).toBe('input');
        });

        it('reports the cleared input after a paste turned into chips', () => {
            const onInputChange = vi.fn();
            const { input } = setup({ onInputChange, createChipsOnPaste: true });

            fireEvent.change(input, { target: { value: 'typed' } });
            onInputChange.mockClear();
            paste(input, 'a,b');

            expect(onInputChange).toHaveBeenCalledTimes(1);

            const [event, value, reason] = onInputChange.mock.calls[0];

            expect(event.type).toBe('paste');
            expect(value).toBe('');
            expect(reason).toBe('clear');
            expect(input.value).toBe('');
        });

        it('shows the inputValue prop and leaves it to the consumer to update', () => {
            const onInputChange = vi.fn();
            const { input } = setup({ inputValue: 'fixed', onInputChange });

            expect(input.value).toBe('fixed');

            fireEvent.change(input, { target: { value: 'fixed!' } });

            expect(onInputChange).toHaveBeenCalledTimes(1);
            expect(onInputChange.mock.calls[0][1]).toBe('fixed!');
            expect(input.value).toBe('fixed');
        });
    });

    describe('paste', () => {
        it('cancels a paste of duplicates only, clears the input and reports no change', () => {
            const onChange = vi.fn();
            const { input, container } = setup({ defaultValue: ['a', 'b'], onChange, createChipsOnPaste: true });

            fireEvent.change(input, { target: { value: 'typed' } });

            expect(paste(input, 'a, b,a')).toBe(false);
            expect(onChange).not.toHaveBeenCalled();
            expect(input.value).toBe('');
            expect(chipLabels(container)).toEqual(['a', 'b']);
        });

        it('shows no duplicate message after a paste that holds new entries only', () => {
            const { input, container } = setup({
                defaultValue: ['a'],
                createChipsOnPaste: true,
                duplicateEntryMessage: (entry): string => `"${entry}" is already on the list`,
            });

            paste(input, 'b,c');

            expect(chipLabels(container)).toEqual(['a', 'b', 'c']);
            expect(container.querySelector('.MuiFormHelperText-root')).toBeNull();
            expect(input.getAttribute('aria-invalid')).toBe('false');
        });

        it('leaves a paste alone in a disabled field', () => {
            const onChange = vi.fn();
            const { input, container } = setup({ onChange, createChipsOnPaste: true, disabled: true });

            expect(paste(input, 'a,b')).toBe(true);
            expect(onChange).not.toHaveBeenCalled();
            expect(chipLabels(container)).toEqual([]);
        });
    });

    describe('props of this variant on other variants', () => {
        // The types forbid these combinations; plain JavaScript consumers can still pass them.
        const chipsInputOnly = (props: Partial<ChipsInputAutocompleteProps<string>>): object => props;

        const renderDefault = (
            props: Partial<DefaultAutocompleteProps<string>>,
            extra: object,
        ): { input: HTMLInputElement; container: HTMLElement } => {
            const { container } = render(
                <Autocomplete<string>
                    options={[]}
                    multiple={true}
                    freeSolo={true}
                    labels={{ title: 'Tags' }}
                    {...props}
                    {...extra}
                />,
            );

            return { input: within(container).getByRole('combobox') as HTMLInputElement, container };
        };

        it('does not turn a paste into chips in the default variant', () => {
            const onChange = vi.fn();
            const { input, container } = renderDefault({ onChange }, chipsInputOnly({ createChipsOnPaste: true }));

            expect(paste(input, 'a,b')).toBe(true);
            expect(onChange).not.toHaveBeenCalled();
            expect(chipLabels(container)).toEqual([]);
        });

        it('does not validate entries in the default variant', () => {
            const contexts: AutocompleteChipRenderContext<string>[] = [];
            const validateEntry = vi.fn((): boolean => false);
            const { container } = renderDefault({ defaultValue: ['a'] }, chipsInputOnly({ validateEntry }));

            expect(chipLabels(container)).toEqual(['a']);
            expect(container.querySelector('.MuiChip-colorError')).toBeNull();
            expect(validateEntry).not.toHaveBeenCalled();

            renderDefault(
                {
                    defaultValue: ['a'],
                    renderChip: (context): React.ReactNode => {
                        contexts.push(context);

                        return null;
                    },
                },
                chipsInputOnly({ validateEntry }),
            );

            expect(contexts.length).toBeGreaterThan(0);
            expect(contexts.every(({ invalid }) => invalid === false)).toBe(true);
        });

        it('ignores sortableChips in the chipsInput variant, with a console warning', () => {
            const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
            const sortable: object = { sortableChips: true };
            const { container } = render(
                <Autocomplete<string>
                    variant="chipsInput"
                    labels={{ title: 'Tags' }}
                    defaultValue={['a', 'b']}
                    {...sortable}
                />,
            );

            expect(chipLabels(container)).toEqual(['a', 'b']);
            expect(container.querySelector('[id^="DndLiveRegion"]')).toBeNull();
            expect(warn).toHaveBeenCalledTimes(1);
            expect(warn.mock.calls[0][0]).toContain('sortableChips is ignored');
        });
    });
});
