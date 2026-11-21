import React, { useState } from 'react';
import { describe, it, expect, vi } from 'vitest';
import { act, fireEvent, render, screen, within } from '@testing-library/react';
import { Autocomplete, DefaultAutocompleteProps } from '../../../src/components/Molecules/Autocomplete/Autocomplete.js';

describe('Autocomplete - duplicate entry feedback paths', () => {
    const Harness = (props: Partial<DefaultAutocompleteProps<string>>): React.JSX.Element => {
        const [value, setValue] = useState<string[]>(['Onet', 'Fakt']);

        return (
            <Autocomplete<string>
                options={[]}
                multiple={true}
                freeSolo={true}
                labels={{ title: 'Tags' }}
                value={value}
                onChange={(event, next): void => setValue(next as string[])}
                duplicateEntryMessage={(entry): string => `"${entry}" is already on the list`}
                {...props}
            />
        );
    };

    const setup = (
        props: Partial<DefaultAutocompleteProps<string>> = {},
    ): { input: HTMLInputElement; container: HTMLElement } => {
        const { container } = render(<Harness {...props} />);

        return { input: within(container).getByRole('combobox') as HTMLInputElement, container };
    };

    const chipLabels = (container: HTMLElement): string[] =>
        Array.from(container.querySelectorAll('.MuiChip-label')).map((chip) => chip.textContent ?? '');

    const helper = (container: HTMLElement): string | null =>
        container.querySelector('.MuiFormHelperText-root')?.textContent ?? null;

    const isErrored = (input: HTMLInputElement): boolean => input.getAttribute('aria-invalid') === 'true';

    /** The message is raised from a microtask after the keydown, so flush one. */
    const flushMicrotasks = (): Promise<void> => act(() => Promise.resolve());

    const confirm = async (input: HTMLInputElement, entry: string, init: object = {}): Promise<void> => {
        fireEvent.change(input, { target: { value: entry } });
        fireEvent.keyDown(input, { key: 'Enter', ...init });
        await flushMicrotasks();
    };

    it('clears the message when the value changes while the rejected text stays in the input', async () => {
        const { input, container } = setup();

        await confirm(input, 'Onet');

        expect(helper(container)).toBe('"Onet" is already on the list');
        expect(isErrored(input)).toBe(true);

        fireEvent.click(container.querySelectorAll('.MuiChip-deleteIcon')[1]);

        expect(chipLabels(container)).toEqual(['Onet']);
        expect(input.value).toBe('Onet');
        expect(helper(container)).toBeNull();
        expect(isErrored(input)).toBe(false);
    });

    it('returns to the error state of slotProps.textField once the message is gone', async () => {
        const { input, container } = setup({ slotProps: { textField: { error: true, helperText: 'Hint' } } });

        expect(isErrored(input)).toBe(true);

        await confirm(input, 'Onet');

        expect(helper(container)).toBe('"Onet" is already on the list');

        fireEvent.change(input, { target: { value: 'One' } });

        expect(helper(container)).toBe('Hint');
        expect(isErrored(input)).toBe(true);
    });

    it('ignores the props in a multiple field without freeSolo', async () => {
        const onDuplicateEntry = vi.fn();
        const { input, container } = setup({ freeSolo: false, onDuplicateEntry });

        // Unfocused, MUI resets the typed text of a field without freeSolo before Enter can read it.
        fireEvent.focus(input);
        await confirm(input, 'Onet');

        expect(input.value).toBe('Onet');
        expect(chipLabels(container)).toEqual(['Onet', 'Fakt']);
        expect(onDuplicateEntry).not.toHaveBeenCalled();
        expect(helper(container)).toBeNull();
        expect(isErrored(input)).toBe(false);
    });

    it('reports nothing for an Enter flagged as composing', async () => {
        const onDuplicateEntry = vi.fn();
        const { input, container } = setup({ onDuplicateEntry });

        await confirm(input, 'Onet', { isComposing: true });

        expect(onDuplicateEntry).not.toHaveBeenCalled();
        expect(helper(container)).toBeNull();
    });

    it('reports nothing for an Enter with the IME key code', async () => {
        const onDuplicateEntry = vi.fn();
        const { input, container } = setup({ onDuplicateEntry });

        await confirm(input, 'Onet', { keyCode: 229 });

        expect(onDuplicateEntry).not.toHaveBeenCalled();
        expect(helper(container)).toBeNull();
    });

    it('reports nothing when the consumer already prevented the default of the Enter', async () => {
        const onDuplicateEntry = vi.fn();
        const { input, container } = setup({
            onDuplicateEntry,
            slotProps: { textField: { onKeyDown: (event): void => event.preventDefault() } },
        });

        await confirm(input, 'Onet');

        expect(chipLabels(container)).toEqual(['Onet', 'Fakt']);
        expect(onDuplicateEntry).not.toHaveBeenCalled();
        expect(helper(container)).toBeNull();
    });

    it('reports nothing when Enter picks a highlighted option while the typed text is already selected', async () => {
        const onDuplicateEntry = vi.fn();
        const { input, container } = setup({ onDuplicateEntry, options: ['Onet Sport'] });

        fireEvent.change(input, { target: { value: 'Onet' } });
        fireEvent.keyDown(input, { key: 'ArrowDown' });

        expect(input.getAttribute('aria-activedescendant')).toBe(screen.getByRole('option', { name: 'Onet Sport' }).id);

        fireEvent.keyDown(input, { key: 'Enter' });
        await flushMicrotasks();

        expect(chipLabels(container)).toEqual(['Onet', 'Fakt', 'Onet Sport']);
        expect(onDuplicateEntry).not.toHaveBeenCalled();
        expect(helper(container)).toBeNull();
        expect(isErrored(input)).toBe(false);
    });

    it('reports nothing when Enter unselects the highlighted option the typed text names', async () => {
        const onDuplicateEntry = vi.fn();
        const { input, container } = setup({ onDuplicateEntry, options: ['Onet', 'Fakt'] });

        fireEvent.change(input, { target: { value: 'Onet' } });
        fireEvent.keyDown(input, { key: 'ArrowDown' });
        fireEvent.keyDown(input, { key: 'Enter' });
        await flushMicrotasks();

        expect(chipLabels(container)).toEqual(['Fakt']);
        expect(onDuplicateEntry).not.toHaveBeenCalled();
        expect(helper(container)).toBeNull();
    });
});
