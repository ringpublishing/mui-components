import React, { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { act, fireEvent, screen, waitFor } from '@testing-library/react';
import { FileText, Flag, Info, Settings, Tag } from 'lucide-react';
import { Dialog, DialogContent } from '@mui/material';
import { createTheme, ThemeProvider, type Theme } from '@mui/material/styles';
import type { RingSideRailOwnerState } from '@ringpublishing/mui-theme';

import { render } from '../../test-utils/customRenderer.js';
import { SideRail, type SideRailItem, type SideRailPanel } from '../../../src/index.js';
import { SideRailScrollButton } from '../../../src/components/Organisms/SideRail/components/SideRailScrollButton.js';

const ITEMS: SideRailItem[] = [
    { id: 'generalInfo', label: 'General info', icon: FileText },
    { id: 'classification', label: 'Classifications', icon: Tag },
    { id: 'flags', label: 'Flags', icon: Flag },
];

const BOTTOM_ITEMS: SideRailItem[] = [
    { id: 'settings', label: 'Settings', icon: Settings },
    { id: 'info', label: 'Details', icon: Info },
];

const PANELS: SideRailPanel[] = [
    { id: 'generalInfo', content: <p>General info panel</p> },
    { id: 'classification', content: <p>Classifications panel</p> },
    { id: 'flags', content: <p>Flags panel</p> },
    { id: 'settings', content: <p>Settings panel</p> },
];

const item = (id: string): HTMLElement => screen.getByTestId(`ring-siderail-item-${id.toLowerCase()}`);
const panel = (id: string): HTMLElement | null => screen.queryByTestId(`ring-siderail-panel-${id.toLowerCase()}`);

/** A panel with its own state: the text typed into it survives only while the panel stays mounted. */
function NoteField({ label }: { label: string }): React.JSX.Element {
    const [value, setValue] = useState('');

    return <input aria-label={label} value={value} onChange={(event): void => setValue(event.target.value)} />;
}

describe('Components: SideRail', () => {
    it('renders the items as tabs of two lists, the bottom one under a divider', () => {
        render(<SideRail items={ITEMS} bottomItems={BOTTOM_ITEMS} panels={PANELS} />);

        const root = screen.getByTestId('ring-siderail');
        const lists = screen.getAllByRole('tablist');

        expect(root.classList).toContain('ring-siderail');
        expect(screen.getByRole('group', { name: 'Side panels' })).toBeDefined();
        expect(lists).toHaveLength(2);
        expect(lists[0].getAttribute('aria-label')).toBe('Panels');
        expect(lists[1].getAttribute('aria-label')).toBe('Pinned panels');
        expect(lists[0].querySelectorAll('[role="tab"]')).toHaveLength(3);
        expect(lists[1].querySelectorAll('[role="tab"]')).toHaveLength(2);
        expect(root.querySelector('.MuiDivider-root')).not.toBeNull();
        expect(item('generalInfo').getAttribute('aria-label')).toBe('General info');
    });

    it('leaves out the divider and the bottom list without bottom items', () => {
        render(<SideRail items={ITEMS} />);

        expect(screen.getAllByRole('tablist')).toHaveLength(1);
        expect(screen.getByTestId('ring-siderail').querySelector('.MuiDivider-root')).toBeNull();
    });

    it('opens an item, swaps to another and closes on a second click', () => {
        const onActiveItemChange = vi.fn();

        render(<SideRail items={ITEMS} panels={PANELS} onActiveItemChange={onActiveItemChange} />);

        expect(panel('generalInfo')).toBeNull();

        fireEvent.click(item('generalInfo'));

        expect(onActiveItemChange).toHaveBeenLastCalledWith('generalInfo');
        expect(item('generalInfo').getAttribute('aria-selected')).toBe('true');
        expect(panel('generalInfo')?.hidden).toBe(false);
        expect(screen.getByText('General info panel')).toBeDefined();

        fireEvent.click(item('flags'));

        expect(onActiveItemChange).toHaveBeenLastCalledWith('flags');
        expect(item('generalInfo').getAttribute('aria-selected')).toBe('false');
        expect(screen.getByText('Flags panel')).toBeDefined();

        fireEvent.click(item('flags'));

        expect(onActiveItemChange).toHaveBeenLastCalledWith(null);
        expect(item('flags').getAttribute('aria-selected')).toBe('false');
    });

    it('opens on defaultActiveItemId', () => {
        render(<SideRail items={ITEMS} panels={PANELS} defaultActiveItemId="classification" />);

        expect(item('classification').getAttribute('aria-selected')).toBe('true');
        expect(screen.getByText('Classifications panel')).toBeDefined();
    });

    it('follows activeItemId and reports clicks without changing it on its own', () => {
        const onActiveItemChange = vi.fn();
        const { rerender } = render(
            <SideRail items={ITEMS} panels={PANELS} activeItemId={null} onActiveItemChange={onActiveItemChange} />,
        );

        fireEvent.click(item('flags'));

        expect(onActiveItemChange).toHaveBeenCalledWith('flags');
        expect(item('flags').getAttribute('aria-selected')).toBe('false');

        rerender(
            <SideRail items={ITEMS} panels={PANELS} activeItemId="flags" onActiveItemChange={onActiveItemChange} />,
        );

        expect(item('flags').getAttribute('aria-selected')).toBe('true');
        expect(screen.getByText('Flags panel')).toBeDefined();
    });

    it('keeps one item open when it cannot close, and reports the item it opened on its own', () => {
        const onActiveItemChange = vi.fn();

        render(<SideRail items={ITEMS} panels={PANELS} isAlwaysOpen={true} onActiveItemChange={onActiveItemChange} />);

        expect(item('generalInfo').getAttribute('aria-selected')).toBe('true');
        expect(onActiveItemChange).toHaveBeenCalledTimes(1);
        expect(onActiveItemChange).toHaveBeenCalledWith('generalInfo');

        fireEvent.click(item('generalInfo'));

        expect(onActiveItemChange).toHaveBeenCalledTimes(1);
        expect(item('generalInfo').getAttribute('aria-selected')).toBe('true');

        fireEvent.click(item('flags'));

        expect(onActiveItemChange).toHaveBeenLastCalledWith('flags');
    });

    it('asks a controlled rail that cannot close to open the first item, and shows it meanwhile', () => {
        const onActiveItemChange = vi.fn();
        const { rerender } = render(
            <SideRail
                items={ITEMS}
                panels={PANELS}
                isAlwaysOpen={true}
                activeItemId={null}
                onActiveItemChange={onActiveItemChange}
            />,
        );

        expect(onActiveItemChange).toHaveBeenCalledTimes(1);
        expect(onActiveItemChange).toHaveBeenCalledWith('generalInfo');
        expect(item('generalInfo').getAttribute('aria-selected')).toBe('true');

        // An application that does not take the id up is not asked again on every render.
        rerender(
            <SideRail
                items={ITEMS}
                panels={PANELS}
                isAlwaysOpen={true}
                activeItemId={null}
                onActiveItemChange={onActiveItemChange}
            />,
        );

        expect(onActiveItemChange).toHaveBeenCalledTimes(1);
    });

    it('does not report an id the application has already set on a rail that cannot close', () => {
        const onActiveItemChange = vi.fn();

        render(
            <SideRail
                items={ITEMS}
                panels={PANELS}
                isAlwaysOpen={true}
                activeItemId="flags"
                onActiveItemChange={onActiveItemChange}
            />,
        );

        expect(onActiveItemChange).not.toHaveBeenCalled();
        expect(item('flags').getAttribute('aria-selected')).toBe('true');
    });

    it('keeps open the first item that opens a drawer, skipping disabled items and items with onClick', () => {
        const items: SideRailItem[] = [
            { id: 'chat', label: 'Chat', initials: 'CH', onClick: vi.fn() },
            { ...ITEMS[0], disabled: true },
            ...ITEMS.slice(1),
        ];

        render(<SideRail items={items} panels={PANELS} isAlwaysOpen={true} />);

        expect(item('chat').getAttribute('aria-selected')).toBe('false');
        expect(item('generalInfo').getAttribute('aria-selected')).toBe('false');
        expect(item('classification').getAttribute('aria-selected')).toBe('true');
        expect(screen.getByText('Classifications panel')).toBeDefined();
    });

    it('falls back to the bottom group when no top item opens a drawer', () => {
        const items = ITEMS.map((entry) => ({ ...entry, disabled: true }));

        render(<SideRail items={items} bottomItems={BOTTOM_ITEMS} panels={PANELS} isAlwaysOpen={true} />);

        expect(item('settings').getAttribute('aria-selected')).toBe('true');
        expect(screen.getByText('Settings panel')).toBeDefined();
    });

    it('leaves the drawer closed when no item opens one, even if it cannot close', () => {
        const items = ITEMS.map((entry) => ({ ...entry, disabled: true }));

        render(<SideRail items={items} panels={PANELS} isAlwaysOpen={true} />);

        expect(screen.queryByRole('tab', { selected: true })).toBeNull();
        expect(screen.queryByText('General info panel')).toBeNull();
    });

    it('runs the onClick of an item instead of opening it', () => {
        const openApp = vi.fn();
        const onActiveItemChange = vi.fn();
        const items = [...ITEMS, { id: 'plugin:chat', label: 'Chat', initials: 'CH', onClick: openApp }];

        render(
            <SideRail
                items={items}
                panels={PANELS}
                defaultActiveItemId="generalInfo"
                onActiveItemChange={onActiveItemChange}
            />,
        );

        const chat = item('plugin:chat');

        expect(chat.textContent).toContain('CH');
        expect(chat.hasAttribute('aria-haspopup')).toBe(false);
        expect(chat.hasAttribute('aria-controls')).toBe(false);

        fireEvent.click(chat);

        expect(openApp).toHaveBeenCalledTimes(1);
        expect(onActiveItemChange).not.toHaveBeenCalled();
        expect(item('generalInfo').getAttribute('aria-selected')).toBe('true');
        expect(chat.getAttribute('aria-selected')).toBe('false');
    });

    it('announces the popup an item with onClick opens, and none for an item without onClick', () => {
        const items: SideRailItem[] = [
            { ...ITEMS[0], ariaHasPopup: 'dialog' },
            { id: 'plugin:chat', label: 'Chat', initials: 'CH', onClick: vi.fn(), ariaHasPopup: 'dialog' },
        ];

        render(<SideRail items={items} panels={PANELS} />);

        expect(item('plugin:chat').getAttribute('aria-haspopup')).toBe('dialog');
        expect(item('generalInfo').hasAttribute('aria-haspopup')).toBe(false);
    });

    it('names a button with initials by its label and the initials it shows', () => {
        const items: SideRailItem[] = [
            { id: 'plugin:proofreading', label: 'Proofreading', initials: 'PR' },
            { id: 'plugin:seo', label: 'SEO', initials: 'SE', hasBadge: true },
            // The icon wins over the initials, which are then not drawn and not named.
            { id: 'notes', label: 'Notes', icon: Info, initials: 'NO' },
        ];

        render(<SideRail items={items} />);

        expect(screen.getByRole('tab', { name: 'Proofreading, PR' })).toBe(item('plugin:proofreading'));
        expect(item('plugin:seo').getAttribute('aria-label')).toBe('SEO, SE, new content');
        expect(item('notes').getAttribute('aria-label')).toBe('Notes');
    });

    it('leaves a hidden item out of the rail but still opens its panel', () => {
        const items = [...ITEMS, { id: 'debug', label: 'Debug', icon: Info, isHidden: true }];
        const panels = [...PANELS, { id: 'debug', content: <p>Debug panel</p> }];

        render(<SideRail items={items} panels={panels} activeItemId="debug" onActiveItemChange={vi.fn()} />);

        expect(screen.queryByTestId('ring-siderail-item-debug')).toBeNull();
        expect(screen.getByText('Debug panel')).toBeDefined();
    });

    it('opens the panel of an id that has no item and selects no tab', () => {
        const panels = [...PANELS, { id: 'plugin:ai', label: 'AI tools', content: <p>AI tools panel</p> }];

        render(<SideRail items={ITEMS} panels={panels} activeItemId="plugin:ai" onActiveItemChange={vi.fn()} />);

        expect(screen.getByRole('region', { name: 'AI tools' })).toBe(panel('plugin:ai'));
        expect(screen.getByText('AI tools panel')).toBeDefined();
        expect(screen.queryAllByRole('tab', { selected: true })).toHaveLength(0);
    });

    it('names the lists with ariaLabels', () => {
        render(
            <SideRail
                items={ITEMS}
                bottomItems={BOTTOM_ITEMS}
                ariaLabels={{ rail: 'Panele boczne', list: 'Panele', bottomList: 'Przypięte panele' }}
            />,
        );

        expect(screen.getByRole('group', { name: 'Panele boczne' })).toBeDefined();
        expect(screen.getByRole('tablist', { name: 'Panele' })).toBeDefined();
        expect(screen.getByRole('tablist', { name: 'Przypięte panele' })).toBeDefined();
    });

    it('points an item at its panel even when its id holds whitespace', () => {
        const items: SideRailItem[] = [{ id: 'related content', label: 'Related content', icon: Info }];
        const panels: SideRailPanel[] = [{ id: 'related content', content: <p>Related content panel</p> }];

        render(<SideRail items={items} panels={panels} defaultActiveItemId="related content" />);

        const panelId = item('related content').getAttribute('aria-controls') as string;

        expect(panelId).not.toMatch(/\s/);
        expect(document.getElementById(panelId)?.textContent).toBe('Related content panel');
    });

    it('names a panel by its own label before the label of its item', () => {
        const panels = PANELS.map((entry) => (entry.id === 'flags' ? { ...entry, label: 'Story flags' } : entry));

        render(<SideRail items={ITEMS} panels={panels} defaultActiveItemId="flags" />);

        expect(panel('flags')?.getAttribute('aria-label')).toBe('Story flags');
    });

    it('points each item at its panel', () => {
        render(<SideRail items={ITEMS} panels={PANELS} defaultActiveItemId="flags" />);

        const panelId = item('flags').getAttribute('aria-controls');

        expect(panelId).toBeTruthy();
        expect(document.getElementById(panelId as string)).toBe(panel('flags'));
        expect(panel('flags')?.getAttribute('role')).toBe('region');
        expect(panel('flags')?.getAttribute('aria-label')).toBe('Flags');
    });

    it('keeps a disabled item and its tooltip but does not open it', async () => {
        const onActiveItemChange = vi.fn();
        const items = [{ ...ITEMS[0], disabled: true }, ...ITEMS.slice(1)];

        render(<SideRail items={items} panels={PANELS} onActiveItemChange={onActiveItemChange} />);

        const disabled = item('generalInfo');

        expect(disabled.getAttribute('aria-disabled')).toBe('true');
        expect(disabled.hasAttribute('disabled')).toBe(false);

        fireEvent.click(disabled);

        expect(onActiveItemChange).not.toHaveBeenCalled();

        fireEvent.mouseOver(disabled);

        expect((await screen.findByRole('tooltip')).textContent).toBe('General info');
    });

    it('shows the disabled reason in the tooltip and announces it as the description', async () => {
        const reason = 'Save the story to edit its general info';
        const items = [{ ...ITEMS[0], disabled: true, disabledReason: reason }, ...ITEMS.slice(1)];

        render(<SideRail items={items} panels={PANELS} />);

        const disabled = item('generalInfo');
        const description = document.getElementById(disabled.getAttribute('aria-describedby') as string);

        expect(disabled.getAttribute('aria-label')).toBe('General info');
        expect(description?.textContent).toBe(reason);

        fireEvent.mouseOver(disabled);

        expect((await screen.findByRole('tooltip')).textContent).toBe(reason);
    });

    it('ignores the disabled reason of an enabled item', async () => {
        const items = [{ ...ITEMS[0], disabledReason: 'Not now' }, ...ITEMS.slice(1)];

        render(<SideRail items={items} panels={PANELS} />);

        const enabled = item('generalInfo');

        expect(enabled.hasAttribute('aria-describedby')).toBe(false);

        fireEvent.mouseOver(enabled);

        expect((await screen.findByRole('tooltip')).textContent).toBe('General info');
    });

    it('announces a badge after the label', () => {
        const items = [...ITEMS, { id: 'comments', label: 'Comments', icon: Info, hasBadge: true }];

        render(<SideRail items={items} ariaLabels={{ badge: 'nowa treść' }} />);

        expect(item('comments').getAttribute('aria-label')).toBe('Comments, nowa treść');
        expect(item('comments').querySelector('.MuiBadge-dot')).not.toBeNull();
    });

    it('colours the badge dot with badgeColor, and the primary colour without it', () => {
        const items = [
            ...ITEMS,
            { id: 'comments', label: 'Comments', icon: Info, hasBadge: true, badgeColor: 'rgb(46, 125, 50)' },
            { id: 'notes', label: 'Notes', icon: Info, hasBadge: true },
            { id: 'history', label: 'History', icon: Info, badgeColor: 'rgb(46, 125, 50)' },
        ];

        render(<SideRail items={items} />);

        const dot = (id: string): HTMLElement => item(id).querySelector('.MuiBadge-badge') as HTMLElement;

        expect(getComputedStyle(dot('comments')).backgroundColor).toBe('rgb(46, 125, 50)');
        expect(getComputedStyle(dot('notes')).backgroundColor).not.toBe('rgb(46, 125, 50)');
        expect(item('history').querySelector('.MuiBadge-badge')).toBeNull();
    });

    it('rings a highlighted item without announcing the ring', async () => {
        const reason = 'Anna Nowak is editing Live coverage';
        const items = [
            ...ITEMS,
            {
                id: 'ext',
                label: 'Live',
                initials: 'LV',
                disabled: true,
                disabledReason: reason,
                hasHighlight: true,
                highlightColor: '#e91e63',
            },
        ];

        render(<SideRail items={items} />);

        const extension = item('ext');
        const description = document.getElementById(extension.getAttribute('aria-describedby') as string);

        expect(extension.getAttribute('aria-label')).toBe('Live, LV');
        expect(description?.textContent).toBe(reason);

        fireEvent.mouseOver(extension);

        expect((await screen.findByRole('tooltip')).textContent).toBe(reason);
    });

    it('leaves an enabled highlighted item with its label as the only tooltip and no description', async () => {
        const items = [...ITEMS, { id: 'ext', label: 'Live', initials: 'LV', hasHighlight: true }];

        render(<SideRail items={items} />);

        expect(item('ext').hasAttribute('aria-describedby')).toBe(false);

        fireEvent.mouseOver(item('ext'));

        expect((await screen.findByRole('tooltip')).textContent).toBe('Live');
    });
    it('moves focus between the items of a list with the arrow keys', () => {
        render(<SideRail items={ITEMS} bottomItems={BOTTOM_ITEMS} defaultActiveItemId="generalInfo" />);

        act(() => item('generalInfo').focus());
        fireEvent.keyDown(item('generalInfo'), { key: 'ArrowDown' });

        expect(document.activeElement).toBe(item('classification'));

        fireEvent.keyDown(item('classification'), { key: 'End' });

        expect(document.activeElement).toBe(item('flags'));
    });

    it('reaches a disabled item with the arrow keys, so that its reason can be read, and wraps at the ends', () => {
        const reason = 'Choose a section first';
        const items = ITEMS.map((entry) =>
            entry.id === 'classification' ? { ...entry, disabled: true, disabledReason: reason } : entry,
        );

        render(<SideRail items={items} bottomItems={BOTTOM_ITEMS} defaultActiveItemId="generalInfo" />);

        act(() => item('generalInfo').focus());
        fireEvent.keyDown(item('generalInfo'), { key: 'ArrowDown' });

        expect(document.activeElement).toBe(item('classification'));
        expect(
            document.getElementById(item('classification').getAttribute('aria-describedby') as string)?.textContent,
        ).toBe(reason);

        fireEvent.keyDown(item('classification'), { key: 'ArrowDown' });
        fireEvent.keyDown(item('flags'), { key: 'ArrowDown' });

        // The bottom group is a list of its own: the focus wraps to the top of this one.
        expect(document.activeElement).toBe(item('generalInfo'));

        fireEvent.keyDown(item('generalInfo'), { key: 'ArrowUp' });

        expect(document.activeElement).toBe(item('flags'));

        fireEvent.keyDown(item('flags'), { key: 'Home' });

        expect(document.activeElement).toBe(item('generalInfo'));
    });

    it('points an item at its panel only while the panel is in the DOM', () => {
        const panels: SideRailPanel[] = [
            { id: 'generalInfo', content: <p>General info panel</p>, mount: 'always' },
            { id: 'classification', content: <p>Classifications panel</p> },
            { id: 'flags', content: <p>Flags panel</p> },
        ];

        render(<SideRail items={ITEMS} panels={panels} />);

        expect(item('generalInfo').getAttribute('aria-controls')).toBe(panel('generalInfo')?.id);
        expect(item('classification').hasAttribute('aria-controls')).toBe(false);
        expect(item('flags').hasAttribute('aria-controls')).toBe(false);

        fireEvent.click(item('flags'));

        expect(item('flags').getAttribute('aria-controls')).toBe(panel('flags')?.id);
        expect(item('classification').hasAttribute('aria-controls')).toBe(false);
    });

    it('leaves a panel with no name a plain container rather than a region without a name', () => {
        const panels = [...PANELS, { id: 'plugin:ai', content: <p>AI tools panel</p> }];

        render(<SideRail items={ITEMS} panels={panels} activeItemId="plugin:ai" onActiveItemChange={vi.fn()} />);

        expect(panel('plugin:ai')?.hasAttribute('role')).toBe(false);
        expect(panel('plugin:ai')?.hasAttribute('aria-label')).toBe(false);
    });

    describe('overlay drawer', () => {
        // ClickAwayListener starts listening a tick after it mounts.
        const waitForClickAway = async (): Promise<void> => {
            await act(async () => {
                await new Promise((resolve) => setTimeout(resolve, 0));
            });
        };

        it('closes on Escape and gives the focus back to the item of the closed panel', () => {
            const onActiveItemChange = vi.fn();

            render(
                <SideRail
                    items={ITEMS}
                    panels={PANELS}
                    drawerVariant="overlay"
                    defaultActiveItemId="flags"
                    onActiveItemChange={onActiveItemChange}
                />,
            );

            act(() => (panel('flags') as HTMLElement).focus());
            fireEvent.keyDown(panel('flags') as HTMLElement, { key: 'Escape' });

            expect(onActiveItemChange).toHaveBeenCalledWith(null);
            expect(item('flags').getAttribute('aria-selected')).toBe('false');
            expect(document.activeElement).toBe(item('flags'));
        });

        it('leaves an Escape that a control in the panel has handled to that control', () => {
            const onActiveItemChange = vi.fn();
            const panels = PANELS.map((entry) =>
                entry.id === 'flags'
                    ? {
                          ...entry,
                          content: (
                              <input
                                  aria-label="Search flags"
                                  onKeyDown={(event): void => {
                                      if (event.key === 'Escape') {
                                          event.preventDefault();
                                      }
                                  }}
                              />
                          ),
                      }
                    : entry,
            );

            render(
                <SideRail
                    items={ITEMS}
                    panels={panels}
                    drawerVariant="overlay"
                    defaultActiveItemId="flags"
                    onActiveItemChange={onActiveItemChange}
                />,
            );

            fireEvent.keyDown(screen.getByLabelText('Search flags'), { key: 'Escape' });

            expect(onActiveItemChange).not.toHaveBeenCalled();
        });

        it('closes on a press outside the rail, not on one inside it', async () => {
            const onActiveItemChange = vi.fn();

            render(
                <>
                    <button type="button">Outside</button>
                    <SideRail
                        items={ITEMS}
                        panels={PANELS}
                        drawerVariant="overlay"
                        defaultActiveItemId="flags"
                        onActiveItemChange={onActiveItemChange}
                    />
                </>,
            );
            await waitForClickAway();

            fireEvent.pointerDown(panel('flags') as HTMLElement);

            expect(onActiveItemChange).not.toHaveBeenCalled();

            fireEvent.pointerDown(screen.getByRole('button', { name: 'Outside' }));

            expect(onActiveItemChange).toHaveBeenCalledWith(null);
            expect(item('flags').getAttribute('aria-selected')).toBe('false');
        });

        it('stays open on a press in a modal over it, such as the application an item with onClick opens', async () => {
            const onActiveItemChange = vi.fn();

            function Host(): React.JSX.Element {
                const [isAppOpen, setAppOpen] = useState(false);
                const items: SideRailItem[] = [
                    ...ITEMS,
                    { id: 'translator', label: 'Translator', initials: 'TR', onClick: (): void => setAppOpen(true) },
                ];

                return (
                    <>
                        <SideRail
                            items={items}
                            panels={PANELS}
                            drawerVariant="overlay"
                            defaultActiveItemId="flags"
                            onActiveItemChange={onActiveItemChange}
                        />
                        <Dialog open={isAppOpen}>
                            <DialogContent>
                                <input aria-label="Translate into" />
                            </DialogContent>
                        </Dialog>
                    </>
                );
            }

            render(<Host />);
            await waitForClickAway();

            fireEvent.click(item('translator'));
            fireEvent.pointerDown(screen.getByLabelText('Translate into'));

            expect(onActiveItemChange).not.toHaveBeenCalled();
            expect(panel('flags')?.hidden).toBe(false);
        });

        it('focuses the panel an item opens without scrolling it into view while the drawer is still closed', () => {
            const focus = vi.spyOn(HTMLElement.prototype, 'focus');

            try {
                render(<SideRail items={ITEMS} panels={PANELS} drawerVariant="overlay" />);

                fireEvent.click(item('flags'));

                const panelCall = focus.mock.calls[focus.mock.contexts.indexOf(panel('flags'))];

                expect(panelCall).toEqual([{ preventScroll: true }]);
            } finally {
                focus.mockRestore();
            }
        });

        it('takes the focus into the panel an item opens', () => {
            render(<SideRail items={ITEMS} panels={PANELS} drawerVariant="overlay" />);

            fireEvent.click(item('flags'));

            expect(document.activeElement).toBe(panel('flags'));

            fireEvent.click(item('classification'));

            expect(document.activeElement).toBe(panel('classification'));
        });

        it('stays open on Escape and on a press outside when it cannot close', async () => {
            const onActiveItemChange = vi.fn();

            render(
                <>
                    <button type="button">Outside</button>
                    <SideRail
                        items={ITEMS}
                        panels={PANELS}
                        drawerVariant="overlay"
                        isAlwaysOpen={true}
                        activeItemId="flags"
                        onActiveItemChange={onActiveItemChange}
                    />
                </>,
            );
            await waitForClickAway();

            fireEvent.keyDown(panel('flags') as HTMLElement, { key: 'Escape' });
            fireEvent.pointerDown(screen.getByRole('button', { name: 'Outside' }));

            expect(onActiveItemChange).not.toHaveBeenCalled();
        });

        it('leaves a push drawer, which covers nothing, to the items alone', async () => {
            const onActiveItemChange = vi.fn();

            render(
                <>
                    <button type="button">Outside</button>
                    <SideRail
                        items={ITEMS}
                        panels={PANELS}
                        drawerVariant="push"
                        defaultActiveItemId="flags"
                        onActiveItemChange={onActiveItemChange}
                    />
                </>,
            );
            await waitForClickAway();

            fireEvent.keyDown(panel('flags') as HTMLElement, { key: 'Escape' });
            fireEvent.pointerDown(screen.getByRole('button', { name: 'Outside' }));
            fireEvent.click(item('classification'));

            expect(onActiveItemChange).toHaveBeenCalledTimes(1);
            expect(onActiveItemChange).toHaveBeenCalledWith('classification');
            expect(document.activeElement).not.toBe(panel('classification'));
        });
    });

    describe('panel mounting', () => {
        const panels: SideRailPanel[] = [
            { id: 'generalInfo', content: <NoteField label="Always note" />, mount: 'always' },
            { id: 'classification', content: <NoteField label="First open note" />, mount: 'firstOpen' },
            { id: 'flags', content: <NoteField label="Active note" /> },
        ];

        const type = (label: string, value: string): void => {
            fireEvent.change(screen.getByLabelText(label), { target: { value } });
        };

        it('mounts an always panel hidden before it is opened', () => {
            render(<SideRail items={ITEMS} panels={panels} />);

            expect(panel('generalInfo')?.hidden).toBe(true);
            expect(panel('classification')).toBeNull();
            expect(panel('flags')).toBeNull();
        });

        it('keeps a firstOpen panel and its state once it has been opened', async () => {
            render(<SideRail items={ITEMS} panels={panels} />);

            fireEvent.click(item('classification'));
            type('First open note', 'kept');
            fireEvent.click(item('flags'));

            expect(panel('classification')?.hidden).toBe(true);

            fireEvent.click(item('flags'));
            await waitFor(() => expect(panel('flags')).toBeNull());

            fireEvent.click(item('classification'));

            expect((screen.getByLabelText('First open note') as HTMLInputElement).value).toBe('kept');
        });

        it('keeps an always panel and its state while another panel is open and the drawer is closed', async () => {
            render(<SideRail items={ITEMS} panels={panels} />);

            fireEvent.click(item('generalInfo'));
            type('Always note', 'kept');
            fireEvent.click(item('generalInfo'));
            await waitFor(() => expect(panel('generalInfo')?.hidden).toBe(true));

            fireEvent.click(item('generalInfo'));

            expect((screen.getByLabelText('Always note') as HTMLInputElement).value).toBe('kept');
        });

        it('unmounts an active panel when another one opens or the drawer closes', async () => {
            render(<SideRail items={ITEMS} panels={panels} />);

            fireEvent.click(item('flags'));
            type('Active note', 'lost');
            fireEvent.click(item('classification'));

            expect(panel('flags')).toBeNull();

            fireEvent.click(item('flags'));

            expect((screen.getByLabelText('Active note') as HTMLInputElement).value).toBe('');

            fireEvent.click(item('flags'));

            // The panel stays while the drawer closes, then goes.
            expect(panel('flags')).not.toBeNull();
            await waitFor(() => expect(panel('flags')).toBeNull());
        });
    });

    describe('drawer animation', () => {
        const drawer = (): HTMLElement => screen.getByTestId('ring-siderail-drawer');

        it('slides the drawer open by default', () => {
            render(<SideRail items={ITEMS} panels={PANELS} />);

            fireEvent.click(item('flags'));

            expect(drawer().style.transitionDuration).toMatch(/^[1-9]\d*ms$/);
        });

        it('opens and closes the drawer at once without its animation', async () => {
            render(<SideRail items={ITEMS} panels={PANELS} disableDrawerAnimation={true} />);

            fireEvent.click(item('flags'));

            expect(drawer().style.transitionDuration).toBe('0ms');
            expect(panel('flags')?.hidden).toBe(false);

            fireEvent.click(item('flags'));

            expect(drawer().style.transitionDuration).toBe('0ms');
            await waitFor(() => expect(panel('flags')).toBeNull());
        });

        it('does not slide the drawer for a user who reduces motion', () => {
            const matchMedia = window.matchMedia;

            window.matchMedia = vi.fn((query: string) => ({
                matches: query === '(prefers-reduced-motion: reduce)',
                media: query,
                onchange: null,
                addListener: vi.fn(),
                removeListener: vi.fn(),
                addEventListener: vi.fn(),
                removeEventListener: vi.fn(),
                dispatchEvent: vi.fn(),
            }));

            try {
                render(<SideRail items={ITEMS} panels={PANELS} />);

                fireEvent.click(item('flags'));

                expect(drawer().style.transitionDuration).toBe('0ms');
            } finally {
                window.matchMedia = matchMedia;
            }
        });
    });

    it('tells an application style override which item is active', () => {
        const ACTIVE_COLOUR = 'rgb(1, 2, 3)';
        const withOverride = (outer: Theme): Theme =>
            createTheme(outer, {
                components: {
                    RingSideRail: {
                        styleOverrides: {
                            item: ({ ownerState }: { ownerState: RingSideRailOwnerState }) =>
                                ownerState.active ? { borderTopColor: ACTIVE_COLOUR } : {},
                        },
                    },
                },
            });

        render(
            <ThemeProvider theme={withOverride}>
                <SideRail items={ITEMS} panels={PANELS} defaultActiveItemId="flags" />
            </ThemeProvider>,
        );

        expect(getComputedStyle(item('flags')).borderTopColor).toBe(ACTIVE_COLOUR);
        expect(getComputedStyle(item('generalInfo')).borderTopColor).not.toBe(ACTIVE_COLOUR);

        fireEvent.click(item('generalInfo'));

        expect(getComputedStyle(item('generalInfo')).borderTopColor).toBe(ACTIVE_COLOUR);
        expect(getComputedStyle(item('flags')).borderTopColor).not.toBe(ACTIVE_COLOUR);
    });

    it('floats the drawer over the content in the overlay variant', () => {
        render(<SideRail items={ITEMS} panels={PANELS} defaultActiveItemId="flags" drawerVariant="overlay" />);

        expect(getComputedStyle(screen.getByTestId('ring-siderail-drawer')).position).toBe('absolute');
    });

    it('floats the drawer over the content by default on a screen narrower than lg, outside DataView too', () => {
        const matchMedia = window.matchMedia;

        // The theme's `breakpoints.down('lg')` is the only `max-width` query the rail asks.
        window.matchMedia = vi.fn((query: string) => ({
            matches: query.includes('max-width'),
            media: query,
            onchange: null,
            addListener: vi.fn(),
            removeListener: vi.fn(),
            addEventListener: vi.fn(),
            removeEventListener: vi.fn(),
            dispatchEvent: vi.fn(),
        }));

        try {
            render(<SideRail items={ITEMS} panels={PANELS} defaultActiveItemId="flags" />);

            expect(getComputedStyle(screen.getByTestId('ring-siderail-drawer')).position).toBe('absolute');
        } finally {
            window.matchMedia = matchMedia;
        }
    });

    it('opens the drawer beside the rail by default', () => {
        render(<SideRail items={ITEMS} panels={PANELS} defaultActiveItemId="flags" drawerWidth={320} />);

        const drawer = screen.getByTestId('ring-siderail-drawer');

        expect(getComputedStyle(drawer).position).not.toBe('absolute');
        expect(getComputedStyle(drawer.querySelector('.MuiCollapse-wrapperInner > div') as HTMLElement).width).toBe(
            '320px',
        );
    });

    // jsdom lays nothing out, so the list never overflows and `Tabs` shows no scroll buttons: the slot is rendered
    // on its own, with the props `Tabs` gives it.
    describe('scroll buttons', () => {
        const renderButtons = (direction: 'ltr' | 'rtl'): void => {
            render(
                <ThemeProvider theme={(outer: Theme): Theme => createTheme(outer, { direction })}>
                    <SideRailScrollButton direction="left" orientation="vertical" data-testid="ring-siderail-scroll" />
                    <SideRailScrollButton direction="right" orientation="vertical" data-testid="ring-siderail-scroll" />
                </ThemeProvider>,
            );
        };

        it('names the button at the start of the list up and the one at its end down', () => {
            renderButtons('ltr');

            const [start, end] = Array.from(document.querySelectorAll('.MuiTabScrollButton-root'));

            expect(start.getAttribute('data-testid')).toBe('ring-siderail-scroll-up');
            expect(end.getAttribute('data-testid')).toBe('ring-siderail-scroll-down');
        });

        it('follows the mirrored direction Tabs gives the buttons in a right-to-left theme', () => {
            renderButtons('rtl');

            const [left, right] = Array.from(document.querySelectorAll('.MuiTabScrollButton-root'));

            // In a right-to-left theme `Tabs` gives the start button `direction="right"`.
            expect(right.getAttribute('data-testid')).toBe('ring-siderail-scroll-up');
            expect(left.getAttribute('data-testid')).toBe('ring-siderail-scroll-down');
        });
    });
});
