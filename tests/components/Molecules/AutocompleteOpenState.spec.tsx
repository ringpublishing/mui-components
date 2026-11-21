import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { act, fireEvent, render } from '@testing-library/react';
import { Autocomplete, DefaultAutocompleteProps } from '../../../src/index.js';

interface Option {
    label: string;
    id: number;
}

type Props = Partial<DefaultAutocompleteProps<Option>>;

/**
 * Who owns the open state of the list: the component when `open` is not passed, the consumer when it is.
 * Either way every request to open or close goes out through `onOpen` / `onClose`.
 */
describe('Autocomplete - open state of the list', () => {
    const options: Option[] = [
        { label: 'Onet', id: 1 },
        { label: 'Fakt', id: 2 },
    ];

    const setup = (
        props: Props = {},
    ): {
        input: HTMLInputElement;
        outside: HTMLElement;
        onOpen: ReturnType<typeof vi.fn>;
        onClose: ReturnType<typeof vi.fn>;
        closeReasons: () => string[];
        isListOpen: () => boolean;
        option: (name: string) => HTMLElement;
        button: (name: string) => HTMLElement;
        press: () => void;
        rerenderWith: (next: Props) => void;
    } => {
        const onOpen = vi.fn();
        const onClose = vi.fn();

        const tree = (current: Props): React.JSX.Element => (
            <>
                <Autocomplete<Option>
                    options={options}
                    labels={{ title: 'Publication' }}
                    onOpen={onOpen}
                    onClose={onClose}
                    {...current}
                />
                <button type="button">Outside</button>
            </>
        );

        const utils = render(tree(props));
        const input = utils.getByRole('combobox') as HTMLInputElement;

        return {
            input,
            outside: utils.getByRole('button', { name: 'Outside' }),
            onOpen,
            onClose,
            closeReasons: (): string[] => onClose.mock.calls.map(([, reason]) => reason as string),
            isListOpen: (): boolean => utils.queryByRole('listbox') !== null,
            option: (name): HTMLElement => utils.getByRole('option', { name }),
            button: (name): HTMLElement => utils.getByRole('button', { name }),
            press: (): void => {
                act(() => input.focus());
                fireEvent.mouseDown(input);
            },
            rerenderWith: (next): void => utils.rerender(tree(next)),
        };
    };

    describe('owned by the component', () => {
        it('opens on a press in the field and reports it through onOpen', () => {
            const { input, onOpen, isListOpen, press } = setup();

            expect(isListOpen()).toBe(false);

            press();

            expect(isListOpen()).toBe(true);
            expect(input.getAttribute('aria-expanded')).toBe('true');
            expect(onOpen).toHaveBeenCalledTimes(1);
            expect((onOpen.mock.calls[0][0] as React.SyntheticEvent).type).toBe('mousedown');
        });

        it('closes on Escape, keeping the value and the focus', () => {
            const { input, onClose, closeReasons, isListOpen, press } = setup({ defaultValue: options[1] });

            press();
            fireEvent.keyDown(input, { key: 'Escape' });

            expect(isListOpen()).toBe(false);
            expect(input.value).toBe('Fakt');
            expect(document.activeElement).toBe(input);
            expect(closeReasons()).toEqual(['escape']);
            expect((onClose.mock.calls[0][0] as React.SyntheticEvent).type).toBe('keydown');
        });

        it('closes when an option is picked', () => {
            const { input, closeReasons, isListOpen, option, press } = setup();

            press();
            fireEvent.click(option('Fakt'));

            expect(isListOpen()).toBe(false);
            expect(input.value).toBe('Fakt');
            expect(closeReasons()).toEqual(['selectOption']);
        });

        it('closes when focus leaves the field', () => {
            const { outside, closeReasons, isListOpen, press } = setup();

            press();
            act(() => outside.focus());

            expect(isListOpen()).toBe(false);
            expect(closeReasons()).toEqual(['blur']);
        });

        it('closes on the Close button', () => {
            const { button, closeReasons, isListOpen, press } = setup();

            press();
            fireEvent.click(button('Close'));

            expect(isListOpen()).toBe(false);
            expect(closeReasons()).toEqual(['toggleInput']);
        });

        it('closes when a selected option is picked again in multiple mode', () => {
            const { closeReasons, isListOpen, option, press } = setup({
                multiple: true,
                defaultValue: [options[0]],
            } as Props);

            press();
            fireEvent.click(option('Onet'));

            expect(isListOpen()).toBe(false);
            expect(closeReasons()).toEqual(['removeOption']);
        });
    });

    describe('owned by the consumer', () => {
        it('shows the list for open={true} without any interaction', () => {
            const { input, onOpen, isListOpen } = setup({ open: true });

            expect(isListOpen()).toBe(true);
            expect(input.getAttribute('aria-expanded')).toBe('true');
            expect(onOpen).not.toHaveBeenCalled();
        });

        it('hides a list the user opened once open={false} is passed', () => {
            const { isListOpen, press, rerenderWith } = setup();

            press();
            rerenderWith({ open: false });

            expect(isListOpen()).toBe(false);
        });

        it('only reports a request to open while open={false}', () => {
            const { onOpen, isListOpen, press, rerenderWith } = setup({ open: false });

            press();

            expect(onOpen).toHaveBeenCalledTimes(1);
            expect(isListOpen()).toBe(false);

            // Handing the state back shows that the request did not change it behind the consumer's back.
            rerenderWith({});

            expect(isListOpen()).toBe(false);
        });

        it('only reports requests to close while open={true}', () => {
            const { input, outside, closeReasons, isListOpen, option, press, rerenderWith } = setup();

            press();
            rerenderWith({ open: true });

            fireEvent.keyDown(input, { key: 'Escape' });
            fireEvent.click(option('Fakt'));
            act(() => outside.focus());

            expect(closeReasons()).toEqual(['escape', 'selectOption', 'blur']);
            expect(isListOpen()).toBe(true);

            rerenderWith({});

            expect(isListOpen()).toBe(true);
        });
    });

    describe('loading text', () => {
        const loadingText = (props: Props): string | null => {
            render(<Autocomplete<Option> options={[]} labels={{ title: 'Publication' }} open={true} {...props} />);

            return document.querySelector('.MuiAutocomplete-loading')?.textContent ?? null;
        };

        it('is empty by default', () => {
            expect(loadingText({ loading: true })).toBe('');
        });

        it('is the loadingText the consumer passes', () => {
            expect(loadingText({ loading: true, loadingText: 'Fetching publications' })).toBe('Fetching publications');
        });
    });
});
