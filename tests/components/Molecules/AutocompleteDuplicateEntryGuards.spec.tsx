import React, { useState } from 'react';
import { describe, it, expect, vi } from 'vitest';
import { act, fireEvent, render, within } from '@testing-library/react';
import { Autocomplete, DefaultAutocompleteProps } from '../../../src/index.js';

type Props = Partial<DefaultAutocompleteProps<string>>;

/** When the feedback for an already selected `freeSolo` entry is raised, and when it is withheld or withdrawn. */
describe('Autocomplete - duplicate entry feedback guards', () => {
    const Harness = (props: Props): React.JSX.Element => {
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
        props: Props = {},
    ): {
        input: HTMLInputElement;
        container: HTMLElement;
        onDuplicateEntry: ReturnType<typeof vi.fn>;
        chipLabels: () => string[];
        helper: () => string | null;
        type: (entry: string) => void;
        pressEnter: (init?: KeyboardEventInit) => Promise<void>;
    } => {
        const onDuplicateEntry = vi.fn();
        const { container } = render(<Harness onDuplicateEntry={onDuplicateEntry} {...props} />);
        const input = within(container).getByRole('combobox') as HTMLInputElement;

        return {
            input,
            container,
            onDuplicateEntry,
            chipLabels: (): string[] =>
                Array.from(container.querySelectorAll('.MuiChip-label')).map((chip) => chip.textContent ?? ''),
            helper: (): string | null => container.querySelector('.MuiFormHelperText-root')?.textContent ?? null,
            type: (entry): void => {
                // Without freeSolo, MUI resets the typed text of a field that is not focused.
                act(() => input.focus());
                fireEvent.change(input, { target: { value: entry } });
            },
            // The feedback is raised from a microtask after the keydown, so one is flushed.
            pressEnter: async (init = {}): Promise<void> => {
                fireEvent.keyDown(input, { key: 'Enter', ...init });
                await act(() => Promise.resolve());
            },
        };
    };

    it('raises nothing for a list of options that takes no free text', async () => {
        // No option matches the text, so Enter has nothing highlighted to act on.
        const { type, pressEnter, onDuplicateEntry, helper, chipLabels } = setup({
            freeSolo: false,
            options: ['Newsweek'],
        });

        type('Onet');
        await pressEnter();

        expect(chipLabels()).toEqual(['Onet', 'Fakt']);
        expect(onDuplicateEntry).not.toHaveBeenCalled();
        expect(helper()).toBeNull();
    });

    it('raises nothing for an Enter that is part of an IME composition', async () => {
        const { type, pressEnter, onDuplicateEntry, helper } = setup();

        type('Onet');
        await pressEnter({ isComposing: true });

        expect(onDuplicateEntry).not.toHaveBeenCalled();
        expect(helper()).toBeNull();
    });

    it('raises nothing for the key code an IME reports while composing', async () => {
        const { type, pressEnter, onDuplicateEntry, helper } = setup();

        type('Onet');
        await pressEnter({ keyCode: 229 });

        expect(onDuplicateEntry).not.toHaveBeenCalled();
        expect(helper()).toBeNull();
    });

    it('raises nothing when slotProps.textField.onKeyDown prevents the default', async () => {
        const { type, pressEnter, onDuplicateEntry, helper } = setup({
            slotProps: { textField: { onKeyDown: (event): void => event.preventDefault() } },
        });

        type('Onet');
        await pressEnter();

        expect(onDuplicateEntry).not.toHaveBeenCalled();
        expect(helper()).toBeNull();
    });

    it('raises nothing when the Enter removes the highlighted, already selected option instead', async () => {
        const { input, type, pressEnter, onDuplicateEntry, helper, chipLabels } = setup({ options: ['Onet', 'Fakt'] });

        type('Onet');
        fireEvent.keyDown(input, { key: 'ArrowDown' });
        await pressEnter();

        expect(chipLabels()).toEqual(['Fakt']);
        expect(onDuplicateEntry).not.toHaveBeenCalled();
        expect(helper()).toBeNull();
    });

    it('withdraws the message when the value changes, and gives the helper line and error state back', async () => {
        const { input, container, type, pressEnter, helper, chipLabels } = setup({
            slotProps: { textField: { helperText: 'Up to five tags' } },
        });

        expect(helper()).toBe('Up to five tags');
        expect(input.getAttribute('aria-invalid')).toBe('false');

        type('Onet');
        await pressEnter();

        expect(helper()).toBe('"Onet" is already on the list');
        expect(input.getAttribute('aria-invalid')).toBe('true');

        fireEvent.click(container.querySelectorAll('.MuiChip-deleteIcon')[1]);

        expect(chipLabels()).toEqual(['Onet']);
        expect(input.value).toBe('Onet');
        expect(helper()).toBe('Up to five tags');
        expect(input.getAttribute('aria-invalid')).toBe('false');
    });

    it('shows the error state of slotProps.textField while there is no message', () => {
        const { input, helper } = setup({ slotProps: { textField: { error: true, helperText: 'Pick a tag' } } });

        expect(input.getAttribute('aria-invalid')).toBe('true');
        expect(helper()).toBe('Pick a tag');
    });
});
