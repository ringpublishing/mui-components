import React, { useEffect, useId, useRef } from 'react';
import { ClickAwayListener, Tabs, useMediaQuery, type Theme } from '@mui/material';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import classNames from 'classnames';
import type { RingSideRailDrawerVariant, RingSideRailOwnerState } from '@ringpublishing/mui-theme';

import { RingLucideIcon } from '../../../helpers/RingLucideIcon.js';
import { buildRingDataTestId, useRingDataTestId } from '../../../helpers/hooks/useRingDataTestId.js';
import { resolveItemDataTestId } from '../../../helpers/dataTestId.js';
import type {
    ControlledSideRailProps,
    SideRailItem,
    SideRailPanel,
    SideRailProps,
    UncontrolledSideRailProps,
} from './SideRail.types.js';
import { SideRailScrollButton, type SideRailScrollButtonProps } from './components/SideRailScrollButton.js';
import { SideRailTab } from './components/SideRailTab.js';
import { useSideRailState } from './useSideRailState.js';
import {
    SideRailBottomGroup,
    SideRailDivider,
    SideRailDrawer,
    SideRailDrawerContent,
    SideRailList,
    SideRailPanelRoot,
    SideRailRail,
    SideRailRoot,
} from './components/slots.js';

const DEFAULT_ARIA_LABELS = {
    rail: 'Side panels',
    list: 'Panels',
    bottomList: 'Pinned panels',
    badge: 'new content',
};

const DEFAULT_DRAWER_WIDTH = 380;

const REDUCED_MOTION = '(prefers-reduced-motion: reduce)';

// MUI's dialogs, menus and popovers, and any other dialog marked modal.
const MODAL_SELECTOR = '.MuiModal-root, [aria-modal="true"]';

// Where the drawer stops pushing the content and floats over it: the breakpoint of `DataView`'s small-screen layout.
function isSmallScreenQuery(theme: Theme): string {
    return theme.breakpoints.down('lg');
}

// The list scrolls vertically; MUI turns its horizontal arrows a quarter clockwise, so these point up and down.
function ScrollUpIcon(): React.JSX.Element {
    return <RingLucideIcon icon={ChevronLeft} fontSize="inherit" />;
}

function ScrollDownIcon(): React.JSX.Element {
    return <RingLucideIcon icon={ChevronRight} fontSize="inherit" />;
}

const SCROLL_BUTTON_SLOTS = {
    scrollButtons: SideRailScrollButton,
    startScrollButtonIcon: ScrollUpIcon,
    endScrollButtonIcon: ScrollDownIcon,
};

// An id becomes part of DOM ids, and `aria-controls` is a list of ids split at whitespace: encoded, it holds none.
function toDomIdSegment(id: string): string {
    return encodeURIComponent(id);
}

// The items open and close the drawer from their own click: `Tabs` calls `onChange` for a new tab only.
function ignoreTabsChange(): void {
    return undefined;
}

function shouldMount(panel: SideRailPanel, shownId: string | null, openedIds: ReadonlySet<string>): boolean {
    switch (panel.mount) {
        case 'always':
            return true;
        case 'firstOpen':
            return panel.id === shownId || openedIds.has(panel.id);
        default:
            return panel.id === shownId;
    }
}

/**
 * A rail of icon buttons on the right edge of a view, each opening its panel in a drawer to the left of the rail.
 *
 * At most one item is active: clicking another item swaps the drawer's panel, clicking the active one closes the
 * drawer (unless `isAlwaysOpen`). An item with `onClick` runs it instead. The items at the top scroll when they do not
 * fit, with scroll buttons over the ends of the list; `bottomItems` stay pinned under a divider.
 *
 * The rail is built from MUI `Tabs`: the top list and the bottom group are two tab lists, and the arrow keys move
 * between the items of one list, disabled ones included. An `overlay` drawer also closes on Escape and on a press
 * outside the rail other than in a modal, and takes the focus into the panel an item opens.
 */
export function SideRail(props: ControlledSideRailProps): React.JSX.Element;
export function SideRail(props: UncontrolledSideRailProps): React.JSX.Element;

export function SideRail(props: SideRailProps): React.JSX.Element {
    const {
        items,
        bottomItems = [],
        panels = [],
        drawerWidth = DEFAULT_DRAWER_WIDTH,
        drawerVariant: drawerVariantProp,
        isAlwaysOpen = false,
        disableDrawerAnimation = false,
        ariaLabels: ariaLabelsProp,
        activeItemId: controlledActiveItemId,
        defaultActiveItemId = null,
        onActiveItemChange,
        className,
        sx,
        dataTestIdSuffix,
    } = props;

    const visibleItems = items.filter((item) => !item.isHidden);
    const visibleBottomItems = bottomItems.filter((item) => !item.isHidden);

    const rootRef = useRef<HTMLDivElement>(null);
    // Set when an item of an overlay rail opens its panel, so that the focus follows the panel into the drawer.
    const focusShownPanelRef = useRef(false);
    const baseId = useId();
    const isSmallScreen = useMediaQuery(isSmallScreenQuery);
    const prefersReducedMotion = useMediaQuery(REDUCED_MOTION);
    const { activeItemId, shownId, openedIds, activate, close, handleDrawerExited } = useSideRailState({
        visibleItems: [...visibleItems, ...visibleBottomItems],
        controlledActiveItemId,
        defaultActiveItemId,
        isAlwaysOpen,
        onActiveItemChange,
    });
    const dataTestId = useRingDataTestId('SideRail', dataTestIdSuffix);

    const ariaLabels = { ...DEFAULT_ARIA_LABELS, ...ariaLabelsProp };
    const drawerVariant: RingSideRailDrawerVariant = drawerVariantProp ?? (isSmallScreen ? 'overlay' : 'push');
    const drawerOpen = activeItemId !== null;
    const ownerState: RingSideRailOwnerState = { drawerOpen, drawerVariant, drawerWidth };
    // An overlay covers the content beside the rail, so it also closes the way a popup does.
    const closesLikePopup = drawerVariant === 'overlay' && drawerOpen && !isAlwaysOpen;

    const labels = new Map([...items, ...bottomItems].map((item) => [item.id, item.label]));
    const getPanelDomId = (id: string): string => `${baseId}-panel-${toDomIdSegment(id)}`;
    const getItemDomId = (id: string): string => `${baseId}-item-${toDomIdSegment(id)}`;
    const mountedPanels = panels.filter((panel) => shouldMount(panel, shownId, openedIds));
    const mountedPanelIds = new Set(mountedPanels.map((panel) => panel.id));
    const shownPanelDomId = shownId === null ? null : getPanelDomId(shownId);
    // Typed as the slot's own props: the type of `slotProps.scrollButtons` has no `data-testid`.
    const scrollButtonProps: Partial<SideRailScrollButtonProps> = { 'data-testid': `${dataTestId}-scroll` };

    // After the render that mounts the panel, so that there is something to focus. The drawer is still 0px wide then:
    // scrolling the panel into view would shift it sideways inside the drawer for the whole slide.
    useEffect(() => {
        if (focusShownPanelRef.current && shownPanelDomId !== null) {
            focusShownPanelRef.current = false;
            rootRef.current?.ownerDocument.getElementById(shownPanelDomId)?.focus({ preventScroll: true });
        }
    }, [shownPanelDomId]);

    const handleActivate = (item: SideRailItem): void => {
        focusShownPanelRef.current = drawerVariant === 'overlay' && !item.onClick && item.id !== activeItemId;
        activate(item);
    };

    const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>): void => {
        // An Escape that a control in a panel has handled, such as one closing its own menu, is left to it.
        if (event.key !== 'Escape' || event.defaultPrevented || !closesLikePopup) {
            return;
        }

        const root = rootRef.current;
        // The focus goes back to the item of the closed panel, or to the item its list focuses first.
        const itemToFocus =
            (activeItemId === null ? null : root?.ownerDocument.getElementById(getItemDomId(activeItemId))) ??
            root?.querySelector<HTMLElement>('[role="tab"][tabindex="0"]');

        event.preventDefault();
        close();
        itemToFocus?.focus();
    };

    const handleClickAway = (event: MouseEvent | TouchEvent): void => {
        // A modal lies over the drawer, not beside it, even when it is outside the rail's React tree, such as the
        // application an item's `onClick` opens.
        const isInModal = event.target instanceof Element && event.target.closest(MODAL_SELECTOR) !== null;

        if (closesLikePopup && !isInModal) {
            close();
        }
    };

    const renderTabs = (group: SideRailItem[]): React.JSX.Element[] =>
        group.map((item) => (
            <SideRailTab
                key={item.id}
                id={getItemDomId(item.id)}
                value={item.id}
                item={item}
                ownerState={ownerState}
                panelId={mountedPanelIds.has(item.id) ? getPanelDomId(item.id) : undefined}
                badgeLabel={ariaLabels.badge}
                dataTestId={resolveItemDataTestId({
                    componentName: 'SideRail',
                    listSuffix: dataTestIdSuffix,
                    itemId: item.id,
                    item,
                })}
                onActivate={handleActivate}
            />
        ));

    // A list whose items do not include the active id selects none of them.
    const groupValue = (group: SideRailItem[]): string | false =>
        group.some((item) => item.id === activeItemId) ? (activeItemId as string) : false;

    return (
        // On press, not on click: a control outside that opens a panel would otherwise have it closed straight away.
        <ClickAwayListener mouseEvent="onPointerDown" touchEvent={false} onClickAway={handleClickAway}>
            <SideRailRoot
                ref={rootRef}
                ownerState={ownerState}
                className={classNames('ring-siderail', className)}
                data-testid={dataTestId}
                sx={sx}
                onKeyDown={handleKeyDown}
            >
                <SideRailDrawer
                    ownerState={ownerState}
                    in={drawerOpen}
                    orientation="horizontal"
                    // Without its animation the drawer opens and closes at once; MUI's own duration otherwise.
                    timeout={disableDrawerAnimation || prefersReducedMotion ? 0 : undefined}
                    onExited={handleDrawerExited}
                    data-testid={`${dataTestId}-drawer`}
                >
                    <SideRailDrawerContent ownerState={ownerState}>
                        {mountedPanels.map((panel) => {
                            const name = panel.label ?? labels.get(panel.id);

                            return (
                                <SideRailPanelRoot
                                    key={panel.id}
                                    ownerState={ownerState}
                                    id={getPanelDomId(panel.id)}
                                    // A region needs a name; without one the panel is a plain container.
                                    role={name ? 'region' : undefined}
                                    aria-label={name}
                                    tabIndex={-1}
                                    hidden={panel.id !== shownId}
                                    data-testid={buildRingDataTestId('SideRail', dataTestIdSuffix, 'panel', panel.id)}
                                >
                                    {panel.content}
                                </SideRailPanelRoot>
                            );
                        })}
                    </SideRailDrawerContent>
                </SideRailDrawer>
                <SideRailRail ownerState={ownerState} role="group" aria-label={ariaLabels.rail}>
                    <SideRailList
                        ownerState={ownerState}
                        orientation="vertical"
                        variant="scrollable"
                        scrollButtons="auto"
                        allowScrollButtonsMobile={true}
                        slots={SCROLL_BUTTON_SLOTS}
                        slotProps={{ scrollButtons: scrollButtonProps }}
                        aria-label={ariaLabels.list}
                        value={groupValue(visibleItems)}
                        onChange={ignoreTabsChange}
                    >
                        {renderTabs(visibleItems)}
                    </SideRailList>
                    {visibleBottomItems.length > 0 && (
                        <SideRailBottomGroup ownerState={ownerState}>
                            <SideRailDivider ownerState={ownerState} />
                            <Tabs
                                orientation="vertical"
                                aria-label={ariaLabels.bottomList}
                                value={groupValue(visibleBottomItems)}
                                onChange={ignoreTabsChange}
                            >
                                {renderTabs(visibleBottomItems)}
                            </Tabs>
                        </SideRailBottomGroup>
                    )}
                </SideRailRail>
            </SideRailRoot>
        </ClickAwayListener>
    );
}
