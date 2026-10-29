import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import React, { useRef } from 'react';
import { fireEvent, render, waitFor } from '../../test-utils/customRenderer.js';
import { userEvent } from '@testing-library/user-event';
import { Rocket } from 'lucide-react';
import { ActionBox, ActionBoxProps } from '../../../src/index.js';
import { determinePopoverPositions } from '../../../src/components/Molecules/ActionBox/popoverPositions.js';
import { Action } from '../../../src/types.js';

describe('Components: ActionBox', () => {
    const action1 = vi.fn();
    const action2 = vi.fn();
    const actions = [
        {
            label: 'Action 1',
            onClick: action1,
            icon: <Rocket />,
        },
        {
            label: 'Action 2',
            onClick: action2,
            disabled: true,
            disabledReason: 'Disabled because of some reason',
        },
    ];

    beforeEach(() => {
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    const TestComponent = ({ actions }: { actions: Action[] }): React.JSX.Element => {
        const anchorRef = useRef(null);

        return (
            <div ref={anchorRef}>
                <button>Open ActionBox</button>
                <ActionBox actions={actions} anchorEl={anchorRef} hasScroll={false} visibleActionsCount={3} />
            </div>
        );
    };

    it('should render component with actions visible', () => {
        const { getByText, queryByText } = render(<TestComponent actions={actions} />);

        expect(getByText('Open ActionBox')).toBeDefined();
        expect(queryByText('Action 1')).toBeNull();

        fireEvent.click(getByText('Open ActionBox'));

        expect(getByText('Action 1')).toBeDefined();
    });

    it('should call action on click', () => {
        const { getByText } = render(<TestComponent actions={actions} />);
        fireEvent.click(getByText('Open ActionBox'));
        fireEvent.click(getByText('Action 1'));

        expect(action1).toHaveBeenCalledTimes(1);
        expect(action2).toHaveBeenCalledTimes(0);
    });

    it('should call onOpen when opening', () => {
        const onOpen = vi.fn();
        const anchorRef = React.createRef<HTMLButtonElement>();
        const { getByRole } = render(
            <>
                <button ref={anchorRef}>Open ActionBox</button>
                <ActionBox actions={actions} anchorEl={anchorRef} onOpen={onOpen} />
            </>,
        );

        fireEvent.click(getByRole('button', { name: 'Open ActionBox' }));
        expect(onOpen).toHaveBeenCalledTimes(1);
    });

    it('should call onClose when an action is selected', () => {
        const onClose = vi.fn();
        const anchorRef = React.createRef<HTMLButtonElement>();
        const { getByRole } = render(
            <>
                <button ref={anchorRef}>Open ActionBox</button>
                <ActionBox actions={actions} anchorEl={anchorRef} onClose={onClose} />
            </>,
        );

        fireEvent.click(getByRole('button', { name: 'Open ActionBox' }));
        fireEvent.click(getByRole('menuitem', { name: 'Action 1' }));

        expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('should render with onClose callback', () => {
        const onClose = vi.fn();
        const anchorRef = React.createRef<HTMLButtonElement>();
        render(
            <>
                <button ref={anchorRef}>Open ActionBox</button>
                <ActionBox actions={actions} anchorEl={anchorRef} onClose={onClose} />
            </>,
        );

        expect(onClose).not.toHaveBeenCalled();
    });

    it('should call onClose on click away', async () => {
        vi.useRealTimers();

        const onClose = vi.fn();
        const anchorRef = React.createRef<HTMLButtonElement>();
        const { getByRole } = render(
            <>
                <button ref={anchorRef}>Open ActionBox</button>
                <ActionBox actions={actions} anchorEl={anchorRef} onClose={onClose} />
            </>,
        );

        fireEvent.click(getByRole('button', { name: 'Open ActionBox' }));

        const backdrop = document.querySelector('.MuiBackdrop-root');
        expect(backdrop).not.toBeNull();
        fireEvent.click(backdrop as Element);

        await waitFor(() => expect(onClose).toHaveBeenCalledTimes(1));
    });

    describe('accessibility', () => {
        beforeEach(() => {
            vi.useRealTimers();
        });

        const ButtonAnchor = ({ actions }: { actions: Action[] }): React.JSX.Element => {
            const anchorRef = useRef<HTMLButtonElement>(null);

            return (
                <>
                    <button ref={anchorRef}>Open ActionBox</button>
                    <ActionBox actions={actions} anchorEl={anchorRef} />
                </>
            );
        };

        it('marks a button anchor as a menu button whose state follows the menu', async () => {
            const user = userEvent.setup();
            const { getByRole } = render(<ButtonAnchor actions={actions} />);
            const trigger = getByRole('button', { name: 'Open ActionBox' });

            expect(trigger.getAttribute('aria-haspopup')).toBe('menu');
            expect(trigger.hasAttribute('aria-expanded')).toBe(false);
            expect(trigger.hasAttribute('aria-controls')).toBe(false);

            await user.click(trigger);

            expect(trigger.getAttribute('aria-expanded')).toBe('true');
            expect(trigger.getAttribute('aria-controls')).toBe(getByRole('menu').id);

            await user.keyboard('{Escape}');

            expect(trigger.hasAttribute('aria-expanded')).toBe(false);
            expect(trigger.hasAttribute('aria-controls')).toBe(false);
            expect(trigger.getAttribute('aria-haspopup')).toBe('menu');
        });

        it('leaves an anchor that is not a button without menu-button attributes', () => {
            const { getByText } = render(<TestComponent actions={actions} />);
            const anchor = getByText('Open ActionBox').parentElement as HTMLElement;

            fireEvent.click(getByText('Open ActionBox'));

            expect(anchor.hasAttribute('aria-haspopup')).toBe(false);
            expect(anchor.hasAttribute('aria-expanded')).toBe(false);
        });

        it('exposes a disabled action as disabled, described by its reason', async () => {
            const user = userEvent.setup();
            const { getByRole } = render(<ButtonAnchor actions={actions} />);

            await user.click(getByRole('button', { name: 'Open ActionBox' }));

            const disabledItem = getByRole('menuitem', {
                name: 'Action 2',
                description: 'Disabled because of some reason',
            });

            expect(disabledItem.getAttribute('aria-disabled')).toBe('true');
            expect(getByRole('menuitem', { name: 'Action 1' }).hasAttribute('aria-disabled')).toBe(false);
        });

        it('focuses the first enabled action and stops on a disabled one without activating it', async () => {
            const user = userEvent.setup();
            const onEnabled = vi.fn();
            const onDisabled = vi.fn();
            const onLast = vi.fn();
            const { getByRole, queryByRole } = render(
                <ButtonAnchor
                    actions={[
                        { label: 'Disabled first', onClick: onDisabled, disabled: true, disabledReason: 'Not now' },
                        { label: 'Enabled', onClick: onEnabled },
                        { label: 'Disabled', onClick: onDisabled, disabled: true },
                        { label: 'Last', onClick: onLast },
                    ]}
                />,
            );

            getByRole('button', { name: 'Open ActionBox' }).focus();
            await user.keyboard('{Enter}');

            expect(document.activeElement).toBe(getByRole('menuitem', { name: 'Enabled' }));

            await user.keyboard('{ArrowDown}');

            const disabledItem = getByRole('menuitem', { name: 'Disabled' });

            expect(document.activeElement).toBe(disabledItem);

            await user.keyboard('{Enter}');
            await user.keyboard(' ');
            fireEvent.click(disabledItem);

            expect(onDisabled).not.toHaveBeenCalled();
            expect(getByRole('menu')).toBeDefined();
            expect(document.activeElement).toBe(disabledItem);

            await user.keyboard('{ArrowUp}{ArrowUp}');

            expect(document.activeElement).toBe(getByRole('menuitem', { name: 'Disabled first' }));

            await user.keyboard('{ArrowDown}{ArrowDown}{ArrowDown}{Enter}');

            expect(onLast).toHaveBeenCalledTimes(1);
            expect(onEnabled).not.toHaveBeenCalled();
            await waitFor(() => expect(queryByRole('menu')).toBeNull());
        });

        describe('long labels', () => {
            const longLabel = 'Move to the archive of articles published before the 2024 site redesign';

            beforeEach(() => {
                // jsdom has no layout: a label longer than 30 characters stands in for one wider than its box.
                vi.spyOn(HTMLElement.prototype, 'scrollWidth', 'get').mockImplementation(function (this: HTMLElement) {
                    return (this.textContent ?? '').length > 30 ? 500 : 100;
                });
                vi.spyOn(HTMLElement.prototype, 'clientWidth', 'get').mockReturnValue(260);
            });

            it('shows a cut-off label in full in a tooltip, without repeating it as a description', async () => {
                const user = userEvent.setup();
                const { getByRole, findByRole } = render(
                    <ButtonAnchor actions={[{ label: 'Duplicate' }, { label: longLabel }]} />,
                );

                await user.click(getByRole('button', { name: 'Open ActionBox' }));

                const longItem = getByRole('menuitem', { name: longLabel });

                await user.hover(longItem);

                expect((await findByRole('tooltip')).textContent).toBe(longLabel);
                expect(longItem.hasAttribute('aria-describedby')).toBe(false);
                expect(longItem.hasAttribute('title')).toBe(false);
            });

            it('gives a label that fits no tooltip', async () => {
                const user = userEvent.setup();
                const { getByRole, queryByRole } = render(<ButtonAnchor actions={[{ label: 'Duplicate' }]} />);

                await user.click(getByRole('button', { name: 'Open ActionBox' }));
                await user.hover(getByRole('menuitem', { name: 'Duplicate' }));
                await new Promise((resolve) => setTimeout(resolve, 200));

                expect(queryByRole('tooltip')).toBeNull();
            });

            it('shows the reason, not the label, for a disabled action', async () => {
                const user = userEvent.setup();
                const { getByRole, findByRole } = render(
                    <ButtonAnchor
                        actions={[{ label: longLabel, disabled: true, disabledReason: 'Used in a published article' }]}
                    />,
                );

                await user.click(getByRole('button', { name: 'Open ActionBox' }));
                await user.hover(getByRole('menuitem', { name: longLabel }));

                expect((await findByRole('tooltip')).textContent).toBe('Used in a published article');
            });
        });
    });

    describe('closing', () => {
        beforeEach(() => {
            vi.useRealTimers();
        });

        // A card, row or list item that owns the menu; its trigger stops its own click like the library's do.
        const ClickableOwner = (props: {
            onOwnerClick: () => void;
            onClose?: () => void;
            onBackdropClick?: () => void;
        }): React.JSX.Element => {
            const anchorRef = useRef<HTMLButtonElement>(null);

            return (
                <div onClick={props.onOwnerClick}>
                    <button ref={anchorRef} onClick={(e): void => e.stopPropagation()}>
                        Open ActionBox
                    </button>
                    <ActionBox
                        actions={[{ label: 'Edit' }]}
                        anchorEl={anchorRef}
                        onClose={props.onClose}
                        slotProps={{ backdrop: { onClick: props.onBackdropClick } }}
                    />
                </div>
            );
        };

        it('does not pass the click that dismisses the menu on to the owner', async () => {
            const user = userEvent.setup();
            const onOwnerClick = vi.fn();
            const onClose = vi.fn();
            const onBackdropClick = vi.fn();
            const { getByRole, queryByRole } = render(
                <ClickableOwner onOwnerClick={onOwnerClick} onClose={onClose} onBackdropClick={onBackdropClick} />,
            );

            await user.click(getByRole('button', { name: 'Open ActionBox' }));
            await user.click(document.querySelector('.MuiBackdrop-root') as Element);

            await waitFor(() => expect(queryByRole('menu')).toBeNull());
            expect(onOwnerClick).not.toHaveBeenCalled();
            expect(onClose).toHaveBeenCalledTimes(1);
            expect(onBackdropClick).toHaveBeenCalledTimes(1);
        });

        const FocusingAction = (props: { onFieldBlur: () => void }): React.JSX.Element => {
            const anchorRef = useRef<HTMLButtonElement>(null);
            const fieldRef = useRef<HTMLInputElement>(null);

            return (
                <>
                    <input aria-label="Title" ref={fieldRef} onBlur={props.onFieldBlur} />
                    <button ref={anchorRef}>Open ActionBox</button>
                    <ActionBox
                        actions={[
                            { label: 'Edit title', onClick: (): void => fieldRef.current?.focus() },
                            { label: 'Duplicate' },
                        ]}
                        anchorEl={anchorRef}
                    />
                </>
            );
        };

        it('leaves focus where an action put it, by mouse and by keyboard', async () => {
            const user = userEvent.setup();
            const onFieldBlur = vi.fn();
            const { getByRole } = render(<FocusingAction onFieldBlur={onFieldBlur} />);
            const field = getByRole('textbox', { name: 'Title' });

            await user.click(getByRole('button', { name: 'Open ActionBox' }));
            await user.click(getByRole('menuitem', { name: 'Edit title' }));
            await user.keyboard('Breaking');

            expect(document.activeElement).toBe(field);
            expect(onFieldBlur).not.toHaveBeenCalled();
            expect((field as HTMLInputElement).value).toBe('Breaking');

            getByRole('button', { name: 'Open ActionBox' }).focus();
            await user.keyboard('{Enter}');
            await user.keyboard('{Enter}');

            expect(document.activeElement).toBe(field);
        });

        it('returns focus to the trigger after an action that does not move it', async () => {
            const user = userEvent.setup();
            const { getByRole } = render(<FocusingAction onFieldBlur={vi.fn()} />);
            const trigger = getByRole('button', { name: 'Open ActionBox' });

            await user.click(trigger);
            await user.click(getByRole('menuitem', { name: 'Duplicate' }));

            expect(document.activeElement).toBe(trigger);
        });
    });

    describe('menu height', () => {
        const thirtyActions = Array.from({ length: 30 }, (unused, index) => ({ label: `Action ${index + 1}` }));

        const openMenuPaper = (props: Omit<ActionBoxProps, 'anchorEl'>): HTMLElement => {
            const anchorRef = React.createRef<HTMLButtonElement>();
            const { getByRole } = render(
                <>
                    <button ref={anchorRef}>Open ActionBox</button>
                    <ActionBox anchorEl={anchorRef} {...props} />
                </>,
            );

            fireEvent.click(getByRole('button', { name: 'Open ActionBox' }));

            return getByRole('menu').closest('.MuiMenu-paper') as HTMLElement;
        };

        it('keeps a long menu within the screen and lets it scroll', () => {
            const paper = openMenuPaper({ actions: thirtyActions });

            expect(paper.style.maxHeight).toBe('');
            expect(getComputedStyle(paper).maxHeight).toBe('calc(100% - 96px)');
            expect(getComputedStyle(paper).overflowY).toBe('auto');
        });

        it('lets a long menu scroll with hasScroll false when visibleActionsCount is not set', () => {
            const paper = openMenuPaper({ actions: thirtyActions, hasScroll: false });

            expect(paper.style.maxHeight).toBe('');
            expect(getComputedStyle(paper).overflowY).toBe('auto');
        });

        it('makes the menu tall enough for visibleActionsCount actions, within the screen, and scrolls the rest', () => {
            const paper = openMenuPaper({ actions: thirtyActions.slice(0, 5), visibleActionsCount: 2 });

            expect(paper.style.maxHeight).toBe('min(88px, calc(100% - 96px))');
            expect(paper.style.overflowY).toBe('auto');
        });

        it('lets the menu scroll when items are taller than counted for visibleActionsCount', () => {
            const paper = openMenuPaper({ actions: thirtyActions.slice(0, 6), visibleActionsCount: 6 });

            expect(paper.style.overflowY).toBe('auto');
        });

        it('cuts off the actions beyond visibleActionsCount with hasScroll false', () => {
            const paper = openMenuPaper({
                actions: thirtyActions.slice(0, 5),
                visibleActionsCount: 2,
                hasScroll: false,
            });

            expect(paper.style.maxHeight).toBe('min(88px, calc(100% - 96px))');
            expect(paper.style.overflowY).toBe('hidden');
        });
    });

    it('should close dropdown on click outside', async () => {
        vi.useRealTimers();

        const { queryByText, getByText } = render(<TestComponent actions={actions} />);
        fireEvent.click(getByText('Open ActionBox'));

        expect(getByText('Action 1')).toBeDefined();

        const backdrop = document.querySelector('.MuiBackdrop-root');
        expect(backdrop).not.toBeNull();
        fireEvent.click(backdrop as Element);

        await waitFor(() => expect(queryByText('Action 1')).toBeNull());
    });
});

describe('determinePopoverPositions', () => {
    it('should return correct anchor/transform origin for each placement', () => {
        expect(determinePopoverPositions('bottom-end')).toEqual({
            anchorOrigin: { vertical: 'bottom', horizontal: 'right' },
            transformOrigin: { vertical: 'top', horizontal: 'right' },
        });
        expect(determinePopoverPositions('bottom-start')).toEqual({
            anchorOrigin: { vertical: 'bottom', horizontal: 'left' },
            transformOrigin: { vertical: 'top', horizontal: 'left' },
        });
        expect(determinePopoverPositions('top-end')).toEqual({
            anchorOrigin: { vertical: 'top', horizontal: 'right' },
            transformOrigin: { vertical: 'bottom', horizontal: 'right' },
        });
        expect(determinePopoverPositions('top-start')).toEqual({
            anchorOrigin: { vertical: 'top', horizontal: 'left' },
            transformOrigin: { vertical: 'bottom', horizontal: 'left' },
        });
        expect(determinePopoverPositions('left-end')).toEqual({
            anchorOrigin: { vertical: 'bottom', horizontal: 'left' },
            transformOrigin: { vertical: 'bottom', horizontal: 'right' },
        });
        expect(determinePopoverPositions('left-start')).toEqual({
            anchorOrigin: { vertical: 'top', horizontal: 'left' },
            transformOrigin: { vertical: 'top', horizontal: 'right' },
        });
        expect(determinePopoverPositions('right-end')).toEqual({
            anchorOrigin: { vertical: 'bottom', horizontal: 'right' },
            transformOrigin: { vertical: 'bottom', horizontal: 'left' },
        });
        expect(determinePopoverPositions('right-start')).toEqual({
            anchorOrigin: { vertical: 'top', horizontal: 'right' },
            transformOrigin: { vertical: 'top', horizontal: 'left' },
        });
    });

    it('should return default (bottom-end) anchor/transform origin for undefined placement', () => {
        expect(determinePopoverPositions(undefined)).toEqual({
            anchorOrigin: { vertical: 'bottom', horizontal: 'right' },
            transformOrigin: { vertical: 'top', horizontal: 'right' },
        });
    });
});
