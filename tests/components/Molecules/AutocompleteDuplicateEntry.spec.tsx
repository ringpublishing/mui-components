import React, { useState } from 'react';
import { describe, it, expect, vi } from 'vitest';
import { act, fireEvent, render } from '@testing-library/react';
import { Autocomplete, DefaultAutocompleteProps } from '../../../src/index.js';

/**
 * `duplicateEntryMessage` / `onDuplicateEntry` — the feedback for a `freeSolo` entry MUI rejects
 * for being already selected. MUI reports that rejection through no callback of its own, so these
 * tests drive the keyboard and assert what the field ends up showing.
 */
describe('Autocomplete - duplicate entry feedback', () => {
    const Harness = (props: Partial<DefaultAutocompleteProps<string>>): React.JSX.Element => {
        const [value, setValue] = useState<string[]>(['Onet']);

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

        return { input: container.querySelector('input') as HTMLInputElement, container };
    };

    const chipLabels = (container: HTMLElement): string[] =>
        Array.from(container.querySelectorAll('.MuiChip-label')).map((chip) => chip.textContent ?? '');

    const helper = (container: HTMLElement): string | null =>
        container.querySelector('.MuiFormHelperText-root')?.textContent ?? null;

    const isErrored = (container: HTMLElement): boolean =>
        Boolean(container.querySelector('.MuiFormLabel-root.Mui-error'));

    /** The message is raised from a microtask after the keydown, so flush one. */
    const flushMicrotasks = (): Promise<void> => act(() => Promise.resolve());

    const confirm = async (input: HTMLInputElement, entry: string): Promise<void> => {
        fireEvent.change(input, { target: { value: entry } });
        fireEvent.keyDown(input, { key: 'Enter' });
        await flushMicrotasks();
    };

    it('reports an entry that is already selected', async () => {
        const { input, container } = setup();

        await confirm(input, 'Onet');

        expect(chipLabels(container)).toEqual(['Onet']);
        expect(helper(container)).toBe('"Onet" is already on the list');
        expect(isErrored(container)).toBe(true);
    });

    it('accepts a new entry without reporting anything', async () => {
        const { input, container } = setup();

        await confirm(input, 'Fakt');

        expect(chipLabels(container)).toEqual(['Onet', 'Fakt']);
        expect(helper(container)).toBeNull();
        expect(isErrored(container)).toBe(false);
    });

    it('takes a plain node as the message', async () => {
        const { input, container } = setup({ duplicateEntryMessage: 'Already added' });

        await confirm(input, 'Onet');

        expect(helper(container)).toBe('Already added');
    });

    it('clears the message once the entry is edited', async () => {
        const { input, container } = setup();

        await confirm(input, 'Onet');
        expect(helper(container)).toBe('"Onet" is already on the list');

        fireEvent.change(input, { target: { value: 'Onet2' } });

        expect(helper(container)).toBeNull();
        expect(isErrored(container)).toBe(false);
    });

    it('calls onDuplicateEntry with the rejected text', async () => {
        const onDuplicateEntry = vi.fn();
        const { input } = setup({ onDuplicateEntry });

        await confirm(input, 'Onet');

        expect(onDuplicateEntry).toHaveBeenCalledTimes(1);
        expect(onDuplicateEntry.mock.calls[0][1]).toBe('Onet');
    });

    it('does not call onDuplicateEntry when the entry is accepted', async () => {
        const onDuplicateEntry = vi.fn();
        const { input } = setup({ onDuplicateEntry });

        await confirm(input, 'Fakt');

        expect(onDuplicateEntry).not.toHaveBeenCalled();
    });

    it('stays out of the way when the consumer did not opt in', async () => {
        const { input, container } = setup({ duplicateEntryMessage: undefined, onDuplicateEntry: undefined });

        await confirm(input, 'Onet');

        expect(chipLabels(container)).toEqual(['Onet']);
        expect(helper(container)).toBeNull();
        expect(isErrored(container)).toBe(false);
    });

    it('hands the helper line back to slotProps.textField afterwards', async () => {
        const { input, container } = setup({ slotProps: { textField: { helperText: 'Press Enter to add' } } });

        expect(helper(container)).toBe('Press Enter to add');

        await confirm(input, 'Onet');
        expect(helper(container)).toBe('"Onet" is already on the list');

        fireEvent.change(input, { target: { value: 'Onet2' } });
        expect(helper(container)).toBe('Press Enter to add');
    });

    it('still calls a consumer onKeyDown from slotProps.textField', async () => {
        const onKeyDown = vi.fn();
        const { input, container } = setup({ slotProps: { textField: { onKeyDown } } });

        await confirm(input, 'Onet');

        expect(onKeyDown).toHaveBeenCalled();
        expect(helper(container)).toBe('"Onet" is already on the list');
    });

    it('reports nothing for Enter on an empty input', async () => {
        const onDuplicateEntry = vi.fn();
        const { input, container } = setup({ onDuplicateEntry });

        fireEvent.keyDown(input, { key: 'Enter' });
        await flushMicrotasks();

        expect(onDuplicateEntry).not.toHaveBeenCalled();
        expect(helper(container)).toBeNull();
    });

    it.each(['Fakt', 'Onet'])('ignores an Enter that commits an IME composition (%s), as MUI does', async (entry) => {
        const onDuplicateEntry = vi.fn();
        const { input, container } = setup({ onDuplicateEntry });

        fireEvent.change(input, { target: { value: entry } });
        fireEvent.keyDown(input, { key: 'Enter', keyCode: 229, isComposing: true });
        await flushMicrotasks();

        expect(chipLabels(container)).toEqual(['Onet']);
        expect(onDuplicateEntry).not.toHaveBeenCalled();
        expect(helper(container)).toBeNull();
        expect(isErrored(container)).toBe(false);
    });

    it.each(['onKeyDown', 'slotProps.textField.onKeyDown'])(
        'reports nothing when %s sets defaultMuiPrevented',
        async (where) => {
            const onDuplicateEntry = vi.fn();

            const preventMui = (event: React.KeyboardEvent & { defaultMuiPrevented?: boolean }): void => {
                event.defaultMuiPrevented = true;
            };

            const { input, container } = setup(
                where === 'onKeyDown'
                    ? { onDuplicateEntry, onKeyDown: preventMui }
                    : { onDuplicateEntry, slotProps: { textField: { onKeyDown: preventMui } } },
            );

            await confirm(input, 'Fakt');
            await confirm(input, 'Onet');

            expect(chipLabels(container)).toEqual(['Onet']);
            expect(onDuplicateEntry).not.toHaveBeenCalled();
            expect(helper(container)).toBeNull();
        },
    );

    it('reports nothing when Enter lands on a disabled highlighted option', async () => {
        const onDuplicateEntry = vi.fn();
        const { input, container } = setup({
            onDuplicateEntry,
            options: ['Fakt'],
            getOptionDisabled: (option): boolean => option === 'Fakt',
            disabledItemsFocusable: true,
        });

        fireEvent.change(input, { target: { value: 'Fak' } });
        fireEvent.keyDown(input, { key: 'ArrowDown' });
        fireEvent.keyDown(input, { key: 'Enter' });
        await flushMicrotasks();

        expect(chipLabels(container)).toEqual(['Onet']);
        expect(onDuplicateEntry).not.toHaveBeenCalled();
        expect(helper(container)).toBeNull();
    });

    it('follows the value MUI keeps when the field is uncontrolled', async () => {
        const onDuplicateEntry = vi.fn();
        const { container } = render(
            <Autocomplete<string>
                options={[]}
                multiple={true}
                freeSolo={true}
                labels={{ title: 'Tags' }}
                defaultValue={['Onet']}
                onDuplicateEntry={onDuplicateEntry}
            />,
        );
        const input = container.querySelector('input') as HTMLInputElement;

        await confirm(input, 'Fakt');
        expect(chipLabels(container)).toEqual(['Onet', 'Fakt']);
        expect(onDuplicateEntry).not.toHaveBeenCalled();

        await confirm(input, 'Fakt');
        await confirm(input, 'Onet');
        expect(onDuplicateEntry.mock.calls.map((call) => call[1])).toEqual(['Fakt', 'Onet']);
    });
});
