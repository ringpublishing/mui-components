import { useEffect, useRef, useState } from 'react';

import type { SideRailItem } from './SideRail.types.js';

interface SideRailStateOptions {
    /** The items shown in the rail, top list first. */
    visibleItems: SideRailItem[];
    /** `activeItemId` of a controlled rail; `undefined` when the rail holds the active item itself. */
    controlledActiveItemId: string | null | undefined;
    defaultActiveItemId: string | null;
    isAlwaysOpen: boolean;
    onActiveItemChange?: (id: string | null) => void;
}

export interface SideRailState {
    /** Id whose drawer is open, `null` while the drawer is closed. */
    activeItemId: string | null;
    /** Id whose panel the drawer shows: the active one, or the one it had while it closes. */
    shownId: string | null;
    /** Ids opened at least once, for the panels mounted from their first opening. */
    openedIds: ReadonlySet<string>;
    /** Opens, swaps or closes the drawer for a clicked item, or runs the item's `onClick`. */
    activate: (item: SideRailItem) => void;
    /** Closes the drawer, unless it cannot close. */
    close: () => void;
    /** Called once the drawer has finished closing. */
    handleDrawerExited: () => void;
}

/** An item that opens a drawer: enabled, and without an `onClick` that runs instead. */
function opensDrawer(item: SideRailItem): boolean {
    return !item.disabled && !item.onClick;
}

/** The active id, held by the application or by the rail, and the function that changes it. */
function useActiveItemId(options: SideRailStateOptions): [string | null, (id: string | null) => void] {
    const { visibleItems, controlledActiveItemId, defaultActiveItemId, isAlwaysOpen, onActiveItemChange } = options;

    // The fallback last reported to the application, so that it is reported once, not on every render.
    const reportedFallbackIdRef = useRef<string | null>(null);
    const [uncontrolledActiveItemId, setUncontrolledActiveItemId] = useState<string | null>(defaultActiveItemId);

    const isControlled = controlledActiveItemId !== undefined;
    const requestedId = isControlled ? controlledActiveItemId : uncontrolledActiveItemId;
    // A drawer that cannot close shows the first item that opens one until an item is chosen.
    const fallbackId = isAlwaysOpen && requestedId === null ? (visibleItems.find(opensDrawer)?.id ?? null) : null;

    // The application learns which item the rail opened on its own, as if it had been clicked. A controlled rail
    // keeps showing the fallback when the application does not take it up.
    useEffect(() => {
        const isNewFallback = fallbackId !== null && fallbackId !== reportedFallbackIdRef.current;

        reportedFallbackIdRef.current = fallbackId;

        if (isNewFallback) {
            if (!isControlled) {
                setUncontrolledActiveItemId(fallbackId);
            }

            onActiveItemChange?.(fallbackId);
        }
    }, [fallbackId, isControlled, onActiveItemChange]);

    const changeActiveItem = (id: string | null): void => {
        if (!isControlled) {
            setUncontrolledActiveItemId(id);
        }

        onActiveItemChange?.(id);
    };

    return [requestedId ?? fallbackId, changeActiveItem];
}

/**
 * What the drawer has shown. Updated during render from the active id, so an id changed by the application is covered
 * too.
 */
function useDrawerHistory(
    activeItemId: string | null,
): Pick<SideRailState, 'shownId' | 'openedIds' | 'handleDrawerExited'> {
    // While the drawer closes, it keeps showing the panel it had, so the panel does not vanish before the drawer.
    const [closingId, setClosingId] = useState<string | null>(null);
    const [previousActiveItemId, setPreviousActiveItemId] = useState<string | null>(activeItemId);
    const [openedIds, setOpenedIds] = useState<ReadonlySet<string>>(
        () => new Set(activeItemId === null ? [] : [activeItemId]),
    );

    if (previousActiveItemId !== activeItemId) {
        setPreviousActiveItemId(activeItemId);
        setClosingId(activeItemId === null ? previousActiveItemId : null);
    }

    if (activeItemId !== null && !openedIds.has(activeItemId)) {
        setOpenedIds(new Set(openedIds).add(activeItemId));
    }

    return {
        shownId: activeItemId ?? closingId,
        openedIds,
        handleDrawerExited: (): void => setClosingId(null),
    };
}

/** The active item of a `SideRail`, controlled or not, and what its drawer has shown. */
export function useSideRailState(options: SideRailStateOptions): SideRailState {
    const { isAlwaysOpen } = options;
    const [activeItemId, changeActiveItem] = useActiveItemId(options);
    const drawerHistory = useDrawerHistory(activeItemId);

    const close = (): void => {
        if (activeItemId !== null && !isAlwaysOpen) {
            changeActiveItem(null);
        }
    };

    const activate = (item: SideRailItem): void => {
        if (item.onClick) {
            item.onClick();
        } else if (item.id !== activeItemId) {
            changeActiveItem(item.id);
        } else {
            close();
        }
    };

    return { activeItemId, activate, close, ...drawerHistory };
}
