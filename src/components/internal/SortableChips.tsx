import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import {
    Announcements,
    closestCenter,
    DndContext,
    DragCancelEvent,
    DragEndEvent,
    DragMoveEvent,
    DragOverEvent,
    DragOverlay,
    DragStartEvent,
    DropAnimationFunctionArguments,
    KeyboardSensor,
    PointerSensor,
    PointerSensorOptions,
    ScreenReaderInstructions,
    UniqueIdentifier,
    useDndContext,
    useSensor,
    useSensors,
} from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, SortingStrategy } from '@dnd-kit/sortable';
import { CSS, Transform } from '@dnd-kit/utilities';
import { Box, Portal, SxProps, Theme, useTheme } from '@mui/material';
import { findItemSurface, SortableItem, SortableItemData } from './SortableItem.js';

declare module '@dnd-kit/core' {
    interface PointerSensorOptions {
        boundaryRef?: React.RefObject<HTMLElement | null>;
    }
}

/**
 * `PointerSensor` that starts a drag only from a pointerdown inside `boundaryRef`, so anything
 * rendered in a portal (an item's action menu, a popover) can be clicked without picking the item up.
 */
class SortablePointerSensor extends PointerSensor {
    public static readonly activators = [
        {
            eventName: 'onPointerDown' as const,
            handler: (event: React.PointerEvent, options: PointerSensorOptions): boolean => {
                const target = event.nativeEvent.target;
                const boundary = options.boundaryRef?.current;

                if (target instanceof Element && boundary && !boundary.contains(target)) {
                    return false;
                }

                return PointerSensor.activators[0].handler(event, options);
            },
        },
    ];
}

/**
 * Moves the item `activeId` to the position of the item `overId`, returning a new array. Exported
 * for unit testing.
 */
export function reorderById<T extends SortableItemData>(
    items: T[],
    activeId: UniqueIdentifier,
    overId: UniqueIdentifier,
): T[] {
    if (activeId === overId) {
        return items;
    }

    const activeIndex = items.findIndex(({ id }) => id === activeId);
    const overIndex = items.findIndex(({ id }) => id === overId);

    if (activeIndex === -1 || overIndex === -1) {
        return items;
    }

    return arrayMove(items, activeIndex, overIndex);
}

/**
 * Name (when the host can resolve one) and ordinal position of one item, or `undefined` when the id
 * is not in the list. Shared by the two announcement builders below.
 */
function locateItem<T extends SortableItemData>(
    items: T[],
    id: UniqueIdentifier,
    getItemLabel?: (item: T) => string,
): { name?: string; position: string } | undefined {
    const index = items.findIndex((item) => item.id === id);

    if (index === -1) {
        return undefined;
    }

    return { name: getItemLabel?.(items[index]), position: `position ${index + 1} of ${items.length}` };
}

/**
 * The live-region description of one item (its name, when the host can resolve one, and its ordinal
 * position); exported for unit testing. `undefined` when the id is not in the list, which dnd-kit's
 * `announce` ignores, so the live region keeps its previous text.
 */
export function describeItemPosition<T extends SortableItemData>(
    items: T[],
    id: UniqueIdentifier,
    getItemLabel?: (item: T) => string,
): string | undefined {
    const located = locateItem(items, id, getItemLabel);

    if (located === undefined) {
        return undefined;
    }

    const { name, position } = located;

    return name === undefined ? position : `${name}, ${position}`;
}

/**
 * The live-region sentence for an aborted drag (Escape, or a release clear of the collection),
 * which states where the item went back to; exported for unit testing. Built as a whole sentence,
 * because `describeItemPosition` cannot follow "Reorder cancelled." without reading as a fragment.
 */
export function describeAbortedReorder<T extends SortableItemData>(
    items: T[],
    id: UniqueIdentifier,
    getItemLabel?: (item: T) => string,
): string {
    const located = locateItem(items, id, getItemLabel);

    if (located === undefined) {
        return 'Reorder cancelled.';
    }

    const { name, position } = located;

    return name === undefined
        ? `Reorder cancelled. Back at ${position}.`
        : `Reorder cancelled. ${name} is back at ${position}.`;
}

function haveSameOrder<T extends SortableItemData>(a: T[], b: T[]): boolean {
    return a.length === b.length && a.every((item, index) => item.id === b[index]?.id);
}

/**
 * Places the dragged item into `items` right after its nearest predecessor in `working` that `items` still has, or
 * first, keeping the order `items` gives every other item. A dragged item missing from `items` stays in place until
 * the release; the current objects are returned.
 */
export function moveIntoItems<T extends SortableItemData>(working: T[], items: T[], activeId: UniqueIdentifier): T[] {
    const activeIndex = working.findIndex(({ id }) => id === activeId);

    if (activeIndex === -1) {
        return items;
    }

    const current = new Map(items.map((item) => [item.id, item]));
    const rest = items.filter(({ id }) => id !== activeId);
    const predecessor = working
        .slice(0, activeIndex)
        .reverse()
        .find(({ id }) => current.has(id));
    const at = predecessor === undefined ? 0 : rest.findIndex(({ id }) => id === predecessor.id) + 1;

    return [...rest.slice(0, at), current.get(activeId) ?? working[activeIndex], ...rest.slice(at)];
}

/**
 * No-op sorting strategy: the live reorder in `onDragOver` lets the flex layout position every
 * chip. Per-item transforms would overlap chips across wrapped rows and make collision detection
 * swap two neighbours back and forth until React aborts with "Maximum update depth exceeded".
 */
const noTransformStrategy: SortingStrategy = () => null;

/**
 * How far beyond the collection's edges a drop still counts as "inside". Generous on purpose: the
 * grabbed item is under the pointer, so releasing a little past the edge is still aimed at the list.
 */
const DROP_OUTSIDE_MARGIN = 32;

/**
 * True when the pointer was released clear of the collection, which `closestCenter` cannot tell since it
 * always resolves an `over`. `pointer` is `null` for a keyboard drag, which is never treated as outside.
 */
function isPointerOutsideContainer(container: HTMLElement | null, pointer: { x: number; y: number } | null): boolean {
    if (container === null || pointer === null) {
        return false;
    }

    const { left, right, top, bottom } = container.getBoundingClientRect();
    const { x, y } = pointer;

    return (
        x < left - DROP_OUTSIDE_MARGIN ||
        x > right + DROP_OUTSIDE_MARGIN ||
        y < top - DROP_OUTSIDE_MARGIN ||
        y > bottom + DROP_OUTSIDE_MARGIN
    );
}

export type SortableChipsDirection = 'wrap' | 'vertical' | 'horizontal';

export interface SortableChipsProps<T extends SortableItemData> {
    /**
     * Chips to render, each identified by a unique `id`.
     */
    items: T[];
    /**
     * Called once with the reordered list when a drag completes and the order changed; the items are
     * the current prop objects in their new order. `activatorEvent` is the pointer or keyboard event
     * that started the drag.
     */
    onChange(items: T[], activatorEvent?: Event): void;
    /**
     * Renders a single chip, wrapped in a draggable `SortableItem`. `isDragActive` is true for every
     * chip while any drag is in progress, to suppress hover affordances such as tooltips.
     */
    renderChip: (item: T, index: number, isDragActive: boolean) => React.ReactNode;
    /**
     * Layout of the collection: a wrapping row of inline chips, a vertical stack or a single
     * horizontal row; the drag mechanics are the same in each.
     * @defaultValue 'wrap'
     */
    direction?: SortableChipsDirection;
    /**
     * Adds a `KeyboardSensor` so items can be lifted with Space/Enter and moved with the arrow
     * keys. Keep it off when the host owns keyboard navigation (e.g. MUI Autocomplete's input).
     * @defaultValue false
     */
    keyboardSorting?: boolean;
    /**
     * Look of the `DragOverlay` ghost that follows the pointer:
     * - `plain` — the item itself, tilted, with a pill-shaped shadow (chips),
     * - `card` — the item on a lifted paper surface, per the list drag&drop design.
     * @defaultValue 'plain'
     */
    ghost?: 'plain' | 'card';
    /**
     * Items can be grabbed only by a `SortableList.DragHandle` rendered inside them.
     * @defaultValue false
     */
    grabByDragHandle?: boolean;
    /**
     * Resolves the `data-testid` put on an item's sortable wrapper. Return `undefined` to render
     * no attribute at all (the Autocomplete chip path puts its own id on the chip instead).
     */
    getItemDataTestId?: (item: T, index: number) => string | undefined;
    /**
     * Styles for the root, which lays the items out as its direct children, merged after the internal
     * layout styles. `className` and `dataTestId` land on the same element.
     */
    sx?: SxProps<Theme>;
    /**
     * Class name of the root.
     */
    className?: string;
    /**
     * `data-testid` of the root.
     */
    dataTestId?: string;
    /**
     * Human-readable name of an item, used only in the drag live-region announcements; without it
     * the announcements state positions alone.
     */
    getItemLabel?: (item: T) => string;
}

/**
 * Ghost decorations: the ghost follows the pointer tilted by −2° and lifted with a shadow.
 * `box-shadow` rather than `filter: drop-shadow`, which puts the ghost on its own rasterization
 * layer and renders the rotated content blurry.
 */
export const GHOST_TILT = 'rotate(-2deg)';

/**
 * Drop animation, per the design-system drag&drop pattern: the ghost flies to the drop slot with
 * ease-out over 180ms while its −2° lift returns to 0 and its lift shadow fades out, then it and
 * the slot disappear together.
 */
const DROP_DURATION_MS = 180;
const DROP_EASING = 'ease-out';
/**
 * Backstop margin. dnd-kit's `AnimationManager` unmounts the ghost clone only once the promise the
 * drop animation returns has settled, and it attaches no `catch` — so the promise must never reject
 * and never hang.
 */
const DROP_SETTLE_GRACE_MS = 120;

/** Resolves when `promise` settles OR when `timeoutMs` elapses — never rejects, never hangs. */
export function settle(promise: Promise<unknown>, timeoutMs: number): Promise<void> {
    return new Promise<void>((resolve) => {
        const timer = setTimeout(resolve, timeoutMs);

        promise
            .catch(() => undefined)
            .then(() => {
                clearTimeout(timer);
                resolve();
            });
    });
}

/**
 * Where the ghost has to land, measured against the overlay's wrapper rather than the tilted ghost
 * dnd-kit measures, whose rotated bounding box would land it a couple of pixels off the slot.
 * Exported for unit testing.
 */
export function resolveDropTransform(
    transform: Transform,
    overlayRect: { left: number; top: number },
    activeRect: { left: number; top: number },
): Transform {
    return {
        ...transform,
        x: transform.x - (overlayRect.left - activeRect.left),
        y: transform.y - (overlayRect.top - activeRect.top),
    };
}

/** Wrapper keyframes: dnd-kit owns this node's transform, so only its translate is animated. */
export function dropKeyframes(from: Transform, to: Transform): Keyframe[] {
    return [{ transform: CSS.Transform.toString(from) }, { transform: CSS.Transform.toString(to) }];
}

/**
 * The resting lift shadow with every `rgb()`/`rgba()` colour driven to zero alpha, so the shadow
 * dims in place without its offsets and blur collapsing. Returns `null` when the value carries no
 * such colour, leaving the shadow un-animated.
 */
export function fadeShadow(shadow: string): string | null {
    if (!/rgba?\(/.test(shadow)) {
        return null;
    }

    return shadow.replace(/rgba?\([^)]*\)/g, (colour: string) => {
        const [red, green, blue] = colour
            .slice(colour.indexOf('(') + 1, -1)
            .split(',')
            .map((channel) => channel.trim());

        return `rgba(${red}, ${green}, ${blue}, 0)`;
    });
}

/**
 * Ghost keyframes: the untilt and the shadow fade, run as one animation on the inner ghost in
 * parallel with dnd-kit's translate on the wrapper. The tilt cannot live in the wrapper's
 * keyframes, because `PositionedOverlay` spreads the caller's `style` after its own `transform`.
 */
export function ghostKeyframes(restingShadow: string): Keyframe[] {
    const landed = fadeShadow(restingShadow);

    if (landed === null) {
        return [{ transform: GHOST_TILT }, { transform: 'rotate(0deg)' }];
    }

    return [
        { transform: GHOST_TILT, boxShadow: restingShadow },
        { transform: 'rotate(0deg)', boxShadow: landed },
    ];
}

/**
 * Sensor options, hoisted out of the component so their identity is stable: `useSensor` memoises on
 * `[sensor, options]`, and a fresh object per render would rebuild dnd-kit's whole context.
 */
const LIST_SENSOR_ACTIVATION = { distance: 5 } as const;
const CHIP_SENSOR_ACTIVATION = { delay: 125, tolerance: 10 } as const;
const KEYBOARD_SENSOR_OPTIONS = { coordinateGetter: sortableKeyboardCoordinates } as const;

// The pointer sits on the ghost for the whole drag, so without this its content would show its hover look
// (a clickable chip's darker fill and pointer cursor) instead of the one it has at rest.
const ghostContentSx = { '& *': { pointerEvents: 'none' } } as const;

const plainGhostSx: SxProps<Theme> = (theme: Theme) => ({
    ...ghostContentSx,
    // The lift shadow is cast by this wrapper, so its box has to match the chip's exactly. `flex`
    // removes the descender space an `inline-flex` chip leaves in block flow, and the tripled
    // selector outranks MUI's `.MuiAutocomplete-tag` rule, whose 3px margin and `calc(100% - 6px)`
    // cap only make sense in the row the ghost was lifted from.
    display: 'flex',
    width: 'fit-content',
    // `fit-content` alone grows to the full width of an unwrappable label; `PlainGhost` narrows this
    // to the width the item has in the list.
    maxWidth: '100%',
    '&&& > *': { margin: 0, maxWidth: '100%' },
    // Pill-shaped so the shadow hugs a MUI Chip; `PlainGhost` replaces it with the item's own radius when it finds one.
    borderRadius: '100px',
    // Opaque, so the ghost keeps the appearance the chip has at rest. A chip with a translucent
    // fill — MUI's default `colorDefault` is an 8%-alpha overlay, i.e. it is really the surface
    // underneath showing through — would otherwise go see-through the moment the ghost lifts it off
    // that surface and flies it over the rest of the collection.
    backgroundColor: theme.palette.background.paper,
    transform: GHOST_TILT,
    boxShadow: theme.shadows[4],
    cursor: 'grabbing',
});

const cardGhostSx: SxProps<Theme> = (theme: Theme) => ({
    ...ghostContentSx,
    transform: GHOST_TILT,
    cursor: 'grabbing',
    borderRadius: 3,
    backgroundColor: theme.palette.background.paper,
    boxShadow: theme.shadows[10],
});

/**
 * The `plain` ghost, shaped like the element that draws the dragged item in the list (see
 * `findItemSurface`): no wider, so a label ellipsized there stays ellipsized, and with its corner
 * radius, so the shadow and the opaque backdrop follow its outline instead of a pill's.
 */
function PlainGhost(props: { children: React.ReactNode }): React.JSX.Element {
    const { children } = props;
    const { activeNode } = useDndContext();
    const [shape, setShape] = useState<{ maxWidth: string; borderRadius: string } | null>(null);

    useLayoutEffect(() => {
        // `null` once the item is dropped: the ghost flies to its slot in the shape it was lifted with.
        const found = activeNode === null ? null : findItemSurface(activeNode);

        if (found !== null) {
            const { width } = found.surface.getBoundingClientRect();

            setShape({
                maxWidth: `${width}px`,
                borderRadius: window.getComputedStyle(found.surface).borderRadius,
            });
        }
    }, [activeNode]);

    return (
        <Box sx={plainGhostSx} style={shape ?? undefined}>
            {children}
        </Box>
    );
}

/**
 * Internal drag&drop engine for collections of variable-size items: a wrapping row of chips, a
 * vertical stack of cards or a single horizontal row. The list is reordered live on `onDragOver`
 * so the real flex layout positions every item, the dragged item follows the pointer in a
 * `DragOverlay` while its in-list copy becomes a drop-slot placeholder, and `onChange` fires once
 * on drop if the order changed.
 */
export function SortableChips<T extends SortableItemData>(props: SortableChipsProps<T>): React.JSX.Element {
    const {
        items,
        onChange,
        renderChip,
        direction = 'wrap',
        keyboardSorting = false,
        ghost = 'plain',
        grabByDragHandle = false,
        getItemDataTestId,
        getItemLabel,
        sx,
        className,
        dataTestId,
    } = props;

    const isWrap = direction === 'wrap';

    const [orderedItems, setOrderedItems] = useState<T[]>(items);
    const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null);
    // Identity of the `items` prop at the last sync, and a one-shot flag raised when a drag ends.
    // Together they drive the derived-state guard below.
    const [prevItems, setPrevItems] = useState<T[]>(items);
    const [pendingResync, setPendingResync] = useState(false);
    // The drag is over but the ghost is still flying to this item's slot. Owned here, in React,
    // rather than by dnd-kit's `defaultDropAnimationSideEffects({ styles: { active: { opacity: '0' }}})`:
    // that writes opacity straight onto the DOM node and restores it only in a cleanup fired by
    // `animation.onfinish`, which never runs if the animation is interrupted — leaving the chip
    // invisible forever, because React renders `opacity: 1` on both sides of the drop commit and so
    // diffs no change to write back.
    const [droppingId, setDroppingId] = useState<UniqueIdentifier | null>(null);

    // Pointer travel (dnd-kit's cumulative drag delta) at the time of the last applied reorder. A
    // live reorder reflows the rows and can flip the computed `over` target back and forth without
    // any pointer movement, so a minimum travel between consecutive reorders breaks that loop.
    const lastReorderDelta = useRef<{ x: number; y: number } | null>(null);
    // The `over` an `onDragOver` skipped for too little travel, retried by `onDragMove`: dnd-kit reports
    // `over` only when it changes, and between equal-size neighbours the way back flips at the same point.
    const pendingOverId = useRef<UniqueIdentifier | null>(null);
    // Viewport position of the pointer during a pointer drag, `null` during a keyboard one. dnd-kit's
    // `delta` cannot stand in for it, because it includes the scroll of every scrollable ancestor.
    const lastPointer = useRef<{ x: number; y: number } | null>(null);

    // Measured on drop to tell a real reorder from a drag abandoned outside the collection.
    const containerRef = useRef<HTMLDivElement | null>(null);

    // Animations still running from the previous drop. `AnimationManager` renders the pending ghost
    // clone ALONGSIDE a new overlay, so an unfinished drop animation is exactly how two ghosts end
    // up on screen at once; a new drag finishes them instead of racing them.
    const dropAnimations = useRef<Animation[]>([]);

    const finishPendingDrop = (): void => {
        for (const animation of dropAnimations.current) {
            animation.finish();
        }

        dropAnimations.current = [];
    };

    // Finishing a drop animation settles the promise `runDropAnimation` handed dnd-kit, which is
    // what releases its timer and its closure. Without this, unmounting the collection mid-flight
    // (a modal closed straight after a drop) leaves both running against a detached node.
    useEffect(() => finishPendingDrop, []);

    // Backstop for the one case neither `runDropAnimation` nor its `settle` timer can cover:
    // `useDropAnimation` bails out WITHOUT calling us at all when the dragged node has gone (a
    // consumer remounting the collection mid-drop), so nothing would ever clear `droppingId` and
    // the drop slot would stay up forever. Same deadline as `settle`, deliberately.
    useEffect(() => {
        if (droppingId === null) {
            return;
        }

        const timer = setTimeout(() => setDroppingId(null), DROP_DURATION_MS + DROP_SETTLE_GRACE_MS);

        return () => clearTimeout(timer);
    }, [droppingId]);

    const isDragActive = activeId !== null;

    useEffect(() => {
        if (!isDragActive) {
            return;
        }

        const ownerDocument = containerRef.current?.ownerDocument ?? document;

        const track = (event: PointerEvent): void => {
            if (lastPointer.current !== null) {
                lastPointer.current = { x: event.clientX, y: event.clientY };
            }
        };

        // Capture phase, so the release point is in place before dnd-kit's own `pointerup` listener ends the drag.
        ownerDocument.addEventListener('pointermove', track, true);
        ownerDocument.addEventListener('pointerup', track, true);

        return () => {
            ownerDocument.removeEventListener('pointermove', track, true);
            ownerDocument.removeEventListener('pointerup', track, true);
        };
    }, [isDragActive]);

    const runDropAnimation = (args: DropAnimationFunctionArguments): Promise<void> => {
        const { active, dragOverlay, transform } = args;
        const overlay = dragOverlay.node;
        const ghostNode = overlay.firstElementChild;

        // jsdom — and anything else without the Web Animations API — has no `animate`. Resolve at
        // once: dnd-kit unmounts the ghost only when this promise settles.
        if (typeof overlay.animate !== 'function') {
            setDroppingId(null);

            return Promise.resolve();
        }

        const final = resolveDropTransform(transform, overlay.getBoundingClientRect(), active.rect);
        const options: KeyframeAnimationOptions = {
            duration: DROP_DURATION_MS,
            easing: DROP_EASING,
            fill: 'forwards',
        };
        const animations = [overlay.animate(dropKeyframes(transform, final), options)];

        if (ghostNode instanceof HTMLElement && typeof ghostNode.animate === 'function') {
            // The resting shadow is read off the live node rather than recomputed from the theme:
            // this helper does not know which of the two ghost looks (`plainGhostSx` /
            // `cardGhostSx`) it is animating, and the computed value is the one the fade has to
            // start from anyway.
            const restingShadow = window.getComputedStyle(ghostNode).boxShadow;

            animations.push(ghostNode.animate(ghostKeyframes(restingShadow), options));
        }

        dropAnimations.current = animations;

        // `Animation.finished` REJECTS with an AbortError when the animation is cancelled, and
        // dnd-kit's `.then` has no `catch` — an unsettled promise means the ghost is never
        // unmounted. Always settle, with a timer behind it so a detached node or a dropped frame
        // cannot strand one either.
        return settle(
            Promise.all(animations.map(({ finished }) => finished)),
            DROP_DURATION_MS + DROP_SETTLE_GRACE_MS,
        ).then(() => {
            dropAnimations.current = [];
            // Batched with dnd-kit's own `setClonedChildren(null)`, so ghost and slot go together.
            setDroppingId(null);
        });
    };

    // Keeps the working copy in sync with props while no drag is in progress, as a render-phase
    // update rather than an effect, so the chip subtree is committed once with the current items.
    // The guard is identity only (each item carries that render's `chipProps` closures), `pendingResync`
    // covers a controlled consumer ignoring `onChange`, and the sync must run while the drop ghost flies
    // (`droppingId` keeps the slot by id): a delete clicked then would otherwise undo the reorder.
    if (activeId === null && (pendingResync || prevItems !== items)) {
        setPrevItems(items);
        setPendingResync(false);
        setOrderedItems(items);
    } else if (activeId !== null && prevItems !== items) {
        // A live source may add or remove items while one is dragged: show them at once and keep the dragged
        // item where the user holds it, instead of freezing the list until the release.
        setPrevItems(items);
        setOrderedItems(moveIntoItems(orderedItems, items, activeId));
    }

    // Both pointer sensors are scoped to the container, so a press in an item's portalled content (an action
    // menu, a popover) stays a click. `vertical` / `horizontal` start a drag after a few pixels of travel.
    const listPointerSensor = useSensor(
        SortablePointerSensor,
        // `containerRef` is itself stable, so this memo never recomputes; it exists only to keep the
        // options object's identity stable (see the constants above).
        useMemo(() => ({ activationConstraint: LIST_SENSOR_ACTIVATION, boundaryRef: containerRef }), []),
    );
    // `wrap` (and therefore Autocomplete's chips) uses a short press delay instead: a chip carries
    // its own click targets — the delete "X" and the `renderChip` chip menu — and a quick tap has
    // to stay a click rather than becoming a 5px drag.
    const chipPointerSensor = useSensor(
        SortablePointerSensor,
        useMemo(() => ({ activationConstraint: CHIP_SENSOR_ACTIVATION, boundaryRef: containerRef }), []),
    );
    const keyboardSensor = useSensor(KeyboardSensor, KEYBOARD_SENSOR_OPTIONS);
    // `useSensors` filters out disabled entries; hooks above must run unconditionally.
    const sensors = useSensors(isWrap ? chipPointerSensor : listPointerSensor, keyboardSorting ? keyboardSensor : null);

    // The announced order, kept in a ref because dnd-kit dispatches the announcement in the same
    // batched block as the drag callback, before any `setState` from it has rendered. It is written
    // eagerly next to every `setOrderedItems`.
    const orderedItemsRef = useRef(orderedItems);

    orderedItemsRef.current = orderedItems;

    // True when the drag that just ended was abandoned rather than committed: Escape (`onDragCancel`)
    // or a release clear of the collection. Written before dnd-kit dispatches the announcement, for
    // the same batching reason as the ref above.
    const abortedDrag = useRef(false);
    // What the live region was last told: dnd-kit fires an `onDragOver` announcement in the same
    // interaction as `onDragStart`, which would overwrite "Grabbed …" before it is in the DOM. A
    // position the user has already heard is not announced again.
    const lastAnnouncement = useRef<string | undefined>(undefined);

    // dnd-kit's default announcements read `active.id` / `over.id` verbatim, which leaks internal
    // keys and never states a position. Memoised because dnd-kit resubscribes its monitor whenever
    // the handler identities change; every callback reads state through refs, so `getItemLabel` is
    // the only dependency.
    const announcements: Announcements = useMemo(() => {
        const describeItem = (id: UniqueIdentifier): string | undefined =>
            describeItemPosition(orderedItemsRef.current, id, getItemLabel);

        const announcePosition = (id: UniqueIdentifier, sentence: (position: string) => string): string | undefined => {
            const position = describeItem(id);

            if (position === undefined || position === lastAnnouncement.current) {
                return undefined;
            }

            lastAnnouncement.current = position;

            return sentence(position);
        };

        return {
            onDragStart: ({ active }): string | undefined =>
                announcePosition(active.id, (position) => `Grabbed ${position}.`),
            onDragOver: ({ active }): string | undefined =>
                announcePosition(active.id, (position) => `Moved to ${position}.`),
            // A position that changed without a new `over` (a reorder retried from `onDragMove`, items the host
            // added or removed); a move that keeps the position is not announced again.
            onDragMove: ({ active }): string | undefined =>
                announcePosition(active.id, (position) => `Moved to ${position}.`),
            onDragEnd: ({ active }): string | undefined => {
                lastAnnouncement.current = undefined;

                if (abortedDrag.current) {
                    return describeAbortedReorder(orderedItemsRef.current, active.id, getItemLabel);
                }

                const position = describeItem(active.id);

                return position === undefined ? undefined : `Dropped at ${position}.`;
            },
            onDragCancel: ({ active }): string => {
                lastAnnouncement.current = undefined;

                return describeAbortedReorder(orderedItemsRef.current, active.id, getItemLabel);
            },
        };
    }, [getItemLabel]);

    // Without a `KeyboardSensor` there is no space bar to press; dnd-kit's default instructions
    // would describe an interaction this collection does not support.
    const screenReaderInstructions: ScreenReaderInstructions = useMemo(
        () => ({
            draggable: keyboardSorting
                ? 'To pick up an item, press the space bar. While dragging, use the arrow keys to move it. ' +
                  'Press space again to drop it in its new position, or press escape to cancel.'
                : 'Drag an item with the pointer to reorder it.',
        }),
        [keyboardSorting],
    );
    const accessibility = useMemo(
        () => ({ announcements, screenReaderInstructions }),
        [announcements, screenReaderInstructions],
    );

    // Shared tail of every drag ending. `pendingResync` covers a CONTROLLED consumer that ignores
    // `onChange`; `setDroppingId` is batched with `setActiveId(null)` so the slot the item lands in
    // keeps its placeholder in the very commit the ghost starts flying towards it.
    const endDrag = (id: UniqueIdentifier): void => {
        setPendingResync(true);
        setDroppingId(id);
        setActiveId(null);
    };

    // A drag abandoned rather than committed: Escape, or a release clear of the collection. The
    // working copy is rolled back to props here, with the ref written first because dnd-kit builds
    // the announcement in the same batched block.
    const abortDrag = (id: UniqueIdentifier): void => {
        abortedDrag.current = true;
        orderedItemsRef.current = items;
        setOrderedItems(items);
        endDrag(id);
    };

    const theme = useTheme();

    // `over` changed but the pointer barely moved since the last reorder: that is layout-reflow feedback,
    // not user intent, and applying it would start the reorder⇄re-measure oscillation (see refs above).
    const hasTravelledSinceReorder = (delta: { x: number; y: number }): boolean => {
        const last = lastReorderDelta.current;

        return last === null || Math.abs(delta.x - last.x) + Math.abs(delta.y - last.y) >= 5;
    };

    const reorder = (id: UniqueIdentifier, overId: UniqueIdentifier, delta: { x: number; y: number }): void => {
        pendingOverId.current = null;
        lastReorderDelta.current = { ...delta };
        // Computed here rather than in a functional update, so the announcement dispatched later in this
        // same batch describes the order this reorder produces instead of the one before it (see `orderedItemsRef`).
        orderedItemsRef.current = reorderById(orderedItemsRef.current, id, overId);
        setOrderedItems(orderedItemsRef.current);
    };

    // Resolve item + index in a single scan; reused by the DragOverlay below (drag is a hot path).
    const activeIndex = isDragActive ? orderedItems.findIndex(({ id }) => id === activeId) : -1;
    const activeItem = activeIndex === -1 ? undefined : orderedItems[activeIndex];

    // The root wraps `DndContext`, so dnd-kit's hidden instructions and live region render inside it,
    // after the items, and the collection has a single root element.
    return (
        <Box
            ref={containerRef}
            className={className}
            data-testid={dataTestId}
            display="flex"
            flexDirection={direction === 'vertical' ? 'column' : 'row'}
            flexWrap={isWrap ? 'wrap' : 'nowrap'}
            // `vertical` items are spaced by their own margins, so only `horizontal` and
            // `wrap` get a gap.
            gap={direction === 'vertical' ? 0 : isWrap ? 0.5 : 1}
            paddingRight={isWrap ? 0.5 : undefined}
            // This Box and the SortableItem wrappers are content-sized flex items, so an
            // overlong chip would grow them past the host row instead of ellipsizing its
            // label. Cap the whole chain (container → wrapper → chip) at the row width.
            sx={[
                {
                    maxWidth: '100%',
                    minWidth: 0,
                    '& > div': { maxWidth: '100%', minWidth: 0 },
                    '& .MuiChip-root': { maxWidth: '100%' },
                },
                // Last, so the host's styles win over the defaults above.
                ...(Array.isArray(sx) ? sx : [sx]),
            ]}
        >
            <DndContext
                sensors={sensors}
                accessibility={accessibility}
                collisionDetection={closestCenter}
                onDragStart={(event: DragStartEvent): void => {
                    const activator = event.activatorEvent as Partial<PointerEvent> | null;

                    finishPendingDrop();
                    setDroppingId(null);
                    lastReorderDelta.current = null;
                    pendingOverId.current = null;
                    lastPointer.current =
                        typeof activator?.clientX === 'number' && typeof activator.clientY === 'number'
                            ? { x: activator.clientX, y: activator.clientY }
                            : null;
                    abortedDrag.current = false;
                    lastAnnouncement.current = undefined;
                    setActiveId(event.active.id);
                }}
                onDragMove={(event: DragMoveEvent): void => {
                    const overId = pendingOverId.current;

                    if (overId !== null && hasTravelledSinceReorder(event.delta)) {
                        reorder(event.active.id, overId, event.delta);
                    }
                }}
                onDragOver={(event: DragOverEvent): void => {
                    const { active, over, delta } = event;

                    pendingOverId.current = null;

                    if (over === null || active.id === over.id) {
                        return;
                    }

                    if (!hasTravelledSinceReorder(delta)) {
                        pendingOverId.current = over.id;

                        return;
                    }

                    reorder(active.id, over.id, delta);
                }}
                onDragEnd={(event: DragEndEvent): void => {
                    // Dropping clear of the collection aborts, the way a list drag is expected to —
                    // the live reorder is only a preview until the pointer is released over it.
                    if (isPointerOutsideContainer(containerRef.current, lastPointer.current)) {
                        // The ghost still animates — back to the item's original slot, which `abortDrag`
                        // has just restored. That IS the "snap back" affordance for an abort.
                        abortDrag(event.active.id);

                        return;
                    }

                    // Read through the ref, since a reorder applied by the last `onDragOver` may not have rendered
                    // yet. Host changes are already in the working copy; a dragged item the host removed is not committed.
                    const next = moveIntoItems(orderedItemsRef.current, items, event.active.id);

                    if (items.some(({ id }) => id === event.active.id) && !haveSameOrder(next, items)) {
                        onChange(next, event.activatorEvent);
                    }

                    endDrag(event.active.id);
                }}
                onDragCancel={(event: DragCancelEvent): void => {
                    abortDrag(event.active.id);
                }}
            >
                <SortableContext items={orderedItems} strategy={noTransformStrategy}>
                    {orderedItems.map((item, index) => (
                        <SortableItem
                            id={item.id}
                            key={item.id}
                            dataTestId={getItemDataTestId?.(item, index)}
                            dragPlaceholder={true}
                            isDropping={item.id === droppingId}
                            grabByDragHandle={grabByDragHandle}
                            keyboardDraggable={keyboardSorting}
                        >
                            {renderChip(item, index, isDragActive)}
                        </SortableItem>
                    ))}
                </SortableContext>
                {/*
                 * The drop animation is owned here so the ghost lands on the slot, the item stays hidden
                 * through React state and the promise always settles. The overlay is portalled to
                 * `document.body` at `zIndex.tooltip`, so a transformed ancestor or a `Dialog` cannot
                 * offset, clip or cover the ghost; dnd-kit detects collisions with the ghost's rect, so an
                 * offset ghost would also land the drop in the wrong place.
                 */}
                <Portal>
                    <DragOverlay dropAnimation={runDropAnimation} zIndex={theme.zIndex.tooltip}>
                        {activeItem ? (
                            ghost === 'card' ? (
                                <Box sx={cardGhostSx}>{renderChip(activeItem, activeIndex, true)}</Box>
                            ) : (
                                <PlainGhost>{renderChip(activeItem, activeIndex, true)}</PlainGhost>
                            )
                        ) : null}
                    </DragOverlay>
                </Portal>
            </DndContext>
        </Box>
    );
}
