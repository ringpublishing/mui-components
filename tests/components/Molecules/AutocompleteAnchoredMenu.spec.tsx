import React from 'react';
import { afterEach, describe, it, expect, vi } from 'vitest';
import { act, fireEvent, render } from '@testing-library/react';
import { Settings2 } from 'lucide-react';
import { Autocomplete, AutocompleteMenuListAction, DefaultAutocompleteProps } from '../../../src/index.js';

interface Option {
    label: string;
    id: number;
}

type CloseCall = [event: Event | React.SyntheticEvent, reason: string];

/**
 * A menu-list action with an `anchorRef` anchors a menu of the consumer. The list has to stay open while that
 * menu holds focus, and close once focus or a press lands outside the field, the list and the menu.
 * These tests run on real timers: the window in which a click may hold the list ends with a zero-delay timeout.
 */
describe('Autocomplete - list held open by an anchored menu', () => {
    const options: Option[] = [
        { label: 'Onet', id: 1 },
        { label: 'Fakt', id: 2 },
    ];
    const recentlyUsedKey = 'anchoredMenuRecentlyUsed';

    /** Lets the zero-delay timeout scheduled by a click on an anchored action run. */
    const endOfTask = (): Promise<void> => act(() => new Promise<void>((resolve) => setTimeout(resolve, 0)));

    const setup = (
        props: Partial<DefaultAutocompleteProps<Option>> = {},
        action: Partial<AutocompleteMenuListAction> = {},
        menuClassName = 'MuiPopper-root',
    ): {
        input: HTMLElement;
        action: HTMLElement;
        menuItem: HTMLElement;
        otherMenuItem: HTMLElement;
        outside: HTMLElement;
        onClose: ReturnType<typeof vi.fn>;
        closeCalls: () => CloseCall[];
        isListOpen: () => boolean;
        option: (name: string) => HTMLElement;
        optionLabels: () => (string | null)[];
        open: () => void;
        hold: () => void;
        rerenderWith: (next: Partial<DefaultAutocompleteProps<Option>>) => void;
        container: HTMLElement;
        unmount: () => void;
    } => {
        const onClose = vi.fn();
        const anchorRef = React.createRef<HTMLButtonElement>();

        const tree = (current: Partial<DefaultAutocompleteProps<Option>>): React.JSX.Element => (
            <>
                <Autocomplete<Option>
                    options={options}
                    labels={{ title: 'Publication' }}
                    menuListActions={{
                        label: 'Results',
                        actions: [{ anchorRef, icon: <Settings2 />, label: 'Configure', ...action }],
                    }}
                    onClose={onClose}
                    {...current}
                />
                {/* Stands in for the menu the consumer anchors to the action. */}
                <div className={menuClassName}>
                    <button type="button">Menu item</button>
                    <button type="button">Other menu item</button>
                </div>
                <button type="button">Outside</button>
            </>
        );

        const utils = render(tree(props));
        const input = utils.getByRole('combobox');
        const button = (name: string): HTMLElement => utils.getByRole('button', { name });

        const open = (): void => {
            act(() => input.focus());
            fireEvent.mouseDown(input);
        };

        if (props.open === undefined) {
            open();
        }

        return {
            input,
            action: button('Configure'),
            menuItem: button('Menu item'),
            otherMenuItem: button('Other menu item'),
            outside: button('Outside'),
            onClose,
            closeCalls: (): CloseCall[] => onClose.mock.calls as CloseCall[],
            isListOpen: (): boolean => utils.queryByRole('listbox') !== null,
            option: (name): HTMLElement => utils.getByRole('option', { name }),
            optionLabels: (): (string | null)[] => utils.getAllByRole('option').map((option) => option.textContent),
            open,
            hold: (): void => {
                fireEvent.click(button('Configure'));
                act(() => button('Menu item').focus());
            },
            rerenderWith: (next): void => utils.rerender(tree(next)),
            container: utils.container,
            unmount: utils.unmount,
        };
    };

    afterEach(() => {
        vi.restoreAllMocks();
        localStorage.removeItem(recentlyUsedKey);
    });

    describe('arming', () => {
        it('closes the list on blur after a click on an action without an anchorRef', () => {
            const { action, outside, closeCalls, isListOpen } = setup({}, { anchorRef: undefined });

            fireEvent.click(action);
            act(() => outside.focus());

            expect(isListOpen()).toBe(false);
            expect(closeCalls().map(([, reason]) => reason)).toEqual(['blur']);
        });

        it('stops holding the list once the click ends without a menu taking focus', async () => {
            const { action, outside, closeCalls, isListOpen } = setup();

            fireEvent.click(action);
            await endOfTask();

            expect(isListOpen()).toBe(true);

            act(() => outside.focus());

            expect(isListOpen()).toBe(false);
            expect(closeCalls().map(([, reason]) => reason)).toEqual(['blur']);
        });

        it('closes the list when focus leaves the document right after the click', () => {
            const { action, input, closeCalls, isListOpen } = setup();

            fireEvent.click(action);
            // No `relatedTarget`: focus went to nothing in this document.
            fireEvent.blur(input);

            expect(isListOpen()).toBe(false);
            expect(closeCalls().map(([, reason]) => reason)).toEqual(['blur']);
        });

        it('lets Escape close the list right after the click, and the next blur close it as usual', () => {
            const { action, input, outside, closeCalls, isListOpen, open } = setup();

            fireEvent.click(action);
            fireEvent.keyDown(input, { key: 'Escape' });

            expect(isListOpen()).toBe(false);

            open();
            act(() => outside.focus());

            expect(isListOpen()).toBe(false);
            expect(closeCalls().map(([, reason]) => reason)).toEqual(['escape', 'blur']);
        });
    });

    describe('while the menu holds focus', () => {
        it.each(['MuiPopper-root', 'MuiModal-root'])(
            'treats the whole %s around the focused element as the menu',
            (menuClassName) => {
                const { otherMenuItem, onClose, isListOpen, hold } = setup({}, {}, menuClassName);

                hold();
                fireEvent.mouseDown(otherMenuItem);
                act(() => otherMenuItem.focus());

                expect(isListOpen()).toBe(true);
                expect(onClose).not.toHaveBeenCalled();
            },
        );

        it('treats only the focused element as the menu when it sits in no popper or modal', () => {
            const { menuItem, otherMenuItem, closeCalls, isListOpen, hold } = setup({}, {}, 'custom-menu');

            hold();
            fireEvent.mouseDown(menuItem);

            expect(isListOpen()).toBe(true);

            fireEvent.mouseDown(otherMenuItem);

            expect(isListOpen()).toBe(false);
            expect(closeCalls().map(([, reason]) => reason)).toEqual(['blur']);
        });

        it('keeps the list open when an option is pressed, and closes it once the option is picked', () => {
            const { input, closeCalls, isListOpen, hold, option } = setup();

            hold();
            fireEvent.mouseDown(option('Onet'));

            expect(isListOpen()).toBe(true);
            expect(closeCalls()).toEqual([]);

            fireEvent.click(option('Onet'));

            expect(isListOpen()).toBe(false);
            expect((input as HTMLInputElement).value).toBe('Onet');
            expect(closeCalls().map(([, reason]) => reason)).toEqual(['selectOption']);
        });

        it('keeps the list open when the field itself is pressed outside its input', () => {
            const { container, onClose, isListOpen, hold } = setup();

            hold();
            fireEvent.mouseDown(container.querySelector('label') as HTMLElement);

            expect(isListOpen()).toBe(true);
            expect(onClose).not.toHaveBeenCalled();
        });

        it('hands the list back to the field when focus returns to the input', () => {
            const { input, outside, closeCalls, isListOpen, hold } = setup();

            hold();
            act(() => input.focus());

            expect(isListOpen()).toBe(true);

            // The field watches its own blur again, so a press that moves no focus changes nothing.
            fireEvent.mouseDown(outside);

            expect(isListOpen()).toBe(true);
            expect(closeCalls()).toEqual([]);

            act(() => outside.focus());

            expect(isListOpen()).toBe(false);
            expect(closeCalls().map(([, reason]) => reason)).toEqual(['blur']);
        });

        it('does not hold a list that was closed with Escape and opened again', () => {
            const { input, outside, closeCalls, isListOpen, hold } = setup();

            hold();
            fireEvent.keyDown(input, { key: 'Escape' });

            expect(isListOpen()).toBe(false);

            fireEvent.mouseDown(input);
            fireEvent.mouseDown(outside);

            expect(isListOpen()).toBe(true);
            expect(closeCalls().map(([, reason]) => reason)).toEqual(['escape']);
        });
    });

    describe('closing a held list', () => {
        it('keeps the recently used list intact when it closes on a press outside with nothing picked', () => {
            localStorage.setItem(recentlyUsedKey, JSON.stringify([options[1]]));

            const { outside, isListOpen, hold, open, optionLabels } = setup({
                showRecentlyUsed: true,
                recentlyLocalStorageKey: recentlyUsedKey,
            });

            expect(optionLabels()).toEqual(['Fakt', 'Onet']);

            hold();
            fireEvent.mouseDown(outside);

            expect(isListOpen()).toBe(false);

            open();

            expect(optionLabels()).toEqual(['Fakt', 'Onet']);
        });

        it('still holds the list after the click that opened the menu has ended', async () => {
            const { outside, menuItem, isListOpen, hold } = setup();

            hold();
            await endOfTask();
            fireEvent.mouseDown(menuItem);

            expect(isListOpen()).toBe(true);

            fireEvent.mouseDown(outside);

            expect(isListOpen()).toBe(false);
        });

        it('closes on a press outside and reports it once as a blur, with the native event', () => {
            const { outside, closeCalls, isListOpen, hold } = setup();

            hold();
            fireEvent.mouseDown(outside);

            expect(isListOpen()).toBe(false);
            expect(closeCalls()).toHaveLength(1);

            const [event, reason] = closeCalls()[0];

            expect(reason).toBe('blur');
            expect(event).toBeInstanceOf(MouseEvent);
            expect(event.type).toBe('mousedown');
            expect(event.target).toBe(outside);
        });

        it('closes when focus moves outside and reports it once as a blur, with the native event', () => {
            const { outside, closeCalls, isListOpen, hold } = setup();

            hold();
            act(() => outside.focus());

            expect(isListOpen()).toBe(false);
            expect(closeCalls()).toHaveLength(1);

            const [event, reason] = closeCalls()[0];

            expect(reason).toBe('blur');
            expect(event).toBeInstanceOf(FocusEvent);
            expect(event.type).toBe('focusin');
            expect(event.target).toBe(outside);
        });

        it('only asks a controlled list to close', () => {
            const { outside, closeCalls, isListOpen, hold, rerenderWith } = setup();

            // Opened by the user first, then taken over by the consumer.
            rerenderWith({ open: true });
            hold();
            fireEvent.mouseDown(outside);

            expect(closeCalls().map(([, reason]) => reason)).toEqual(['blur']);
            expect(isListOpen()).toBe(true);

            rerenderWith({});

            expect(isListOpen()).toBe(true);
        });
    });

    describe('without a held list', () => {
        it('ignores presses and focus changes elsewhere in the document', () => {
            const { outside, onClose, isListOpen } = setup();

            fireEvent.mouseDown(outside);
            fireEvent.focusIn(outside);

            expect(isListOpen()).toBe(true);
            expect(onClose).not.toHaveBeenCalled();
        });

        it('listens on the document only while the list is open', () => {
            const added = vi.spyOn(document, 'addEventListener');
            const removed = vi.spyOn(document, 'removeEventListener');
            const listenersOf = (spy: typeof added | typeof removed, type: string): unknown[] =>
                spy.mock.calls.filter(([calledType]) => calledType === type).map(([, listener]) => listener);

            const { getByRole, unmount } = render(
                <Autocomplete<Option> options={options} labels={{ title: 'Publication' }} />,
            );
            const input = getByRole('combobox');

            expect(listenersOf(added, 'focusin')).toEqual([]);

            act(() => input.focus());
            fireEvent.mouseDown(input);

            const [listener] = listenersOf(added, 'focusin');

            expect(listenersOf(added, 'focusin')).toHaveLength(1);
            expect(listenersOf(added, 'mousedown')).toContain(listener);

            fireEvent.keyDown(input, { key: 'Escape' });

            expect(listenersOf(removed, 'focusin')).toEqual([listener]);
            expect(listenersOf(removed, 'mousedown')).toContain(listener);

            fireEvent.mouseDown(input);

            const [, reopenedListener] = listenersOf(added, 'focusin');

            expect(listenersOf(added, 'focusin')).toHaveLength(2);

            unmount();

            expect(listenersOf(removed, 'focusin')).toEqual([listener, reopenedListener]);
        });
    });
});
