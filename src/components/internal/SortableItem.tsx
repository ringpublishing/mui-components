import { DraggableSyntheticListeners, UniqueIdentifier } from '@dnd-kit/core';
import React, { createContext, PropsWithChildren, useLayoutEffect, useMemo, useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { alpha, Box, SxProps, Theme } from '@mui/material';
import { WithItemDataTestId } from '../../helpers/dataTestId.js';

export interface SortableItemContext {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    attributes: Record<string, any>;
    listeners: DraggableSyntheticListeners;
    ref(node: HTMLElement | null): void;
    isDragging: boolean;
    /** The item is rendered as the drop-slot placeholder, so its content is hidden (see `dragPlaceholderSx`). */
    isPlaceholder: boolean;
}

export const SORTABLE_ITEM_CONTEXT = createContext<SortableItemContext>({
    attributes: {},
    listeners: undefined,
    ref() {
        /* noop */
    },
    isDragging: false,
    isPlaceholder: false,
});

export type SortableItemData = { id: UniqueIdentifier } & WithItemDataTestId;

type DragAttributes = ReturnType<typeof useSortable>['attributes'];

/**
 * The dnd-kit attributes that advertise a KEYBOARD-operable draggable. Dropped as a unit when the
 * collection is pointer-only: `aria-roledescription` is invalid on an element without a semantic
 * role, and `aria-pressed` / `aria-describedby` only make sense next to that role.
 */
const KEYBOARD_DRAG_ATTRIBUTES = [
    'role',
    'tabIndex',
    'aria-roledescription',
    'aria-describedby',
    'aria-pressed',
] as const;

/** Whether `element` draws a box of its own (a fill, a border or a shadow) rather than only holding its content. */
function drawsBox(element: Element): boolean {
    const style = window.getComputedStyle(element);
    const isUnset = (value: string): boolean => value === '' || value === 'none';
    const borderWidths = [style.borderTopWidth, style.borderRightWidth, style.borderBottomWidth, style.borderLeftWidth];

    return (
        !/^(|transparent|rgba\(.*,\s*0\))$/.test(style.backgroundColor) ||
        !isUnset(style.backgroundImage) ||
        borderWidths.some((width) => Number.parseFloat(width) > 0) ||
        !isUnset(style.boxShadow)
    );
}

/**
 * The element that draws an item, looked up from the item's sortable node: its only element child or, past
 * wrappers that draw nothing and hold a single element (an anchor `Box` around a `Chip`), the first element
 * below it that draws a box, with `depth` counting the wrappers passed. `null` when the item renders several
 * elements side by side or draws no box at all.
 */
export function findItemSurface(item: Element): { surface: HTMLElement; depth: number } | null {
    let candidate = item.childElementCount === 1 ? item.firstElementChild : null;

    for (let depth = 0; candidate instanceof HTMLElement; depth += 1) {
        if (drawsBox(candidate)) {
            return { surface: candidate, depth };
        }

        candidate = candidate.childElementCount === 1 ? candidate.firstElementChild : null;
    }

    return null;
}

/**
 * Turns the dragged item's in-list copy into the drop slot: the content is hidden in place and a
 * dashed, primary-tinted indicator is painted over it by a pseudo-element on the element that draws
 * the item, `surfaceDepth` levels below the item's child (see `findItemSurface`). Painting there keeps
 * the item's own radius and excludes its margins, including those of a chip inside an anchor wrapper,
 * and hiding the content (with `visibility`, re-enabled on the pseudo-element) instead of wrapping it
 * keeps the DOM tree, state and focus intact.
 */
function dragPlaceholderSx(surfaceDepth: number): SxProps<Theme> {
    const surface = `& > *${' > *'.repeat(surfaceDepth)}`;

    return (theme: Theme) => ({
        position: 'relative',
        '& > *': { visibility: 'hidden', position: 'relative' },
        ...(surfaceDepth > 0 ? { [surface]: { position: 'relative' } } : {}),
        [`${surface}::after`]: {
            content: '""',
            visibility: 'visible',
            position: 'absolute',
            inset: 0,
            border: '1px dashed',
            borderColor: theme.palette.primary.main,
            backgroundColor: alpha(theme.palette.primary.main, theme.palette.action.selectedOpacity),
            borderRadius: 'inherit',
            boxSizing: 'border-box',
        },
    });
}

interface SortableItemProps {
    id: UniqueIdentifier;
    /** Applied to the sortable wrapper element; the owning list resolves the value. */
    dataTestId?: string;
    grabByDragHandle?: boolean;
    disableDrag?: boolean;
    disableTransformOfUndraggedItems?: boolean;
    /**
     * While the item is being dragged, render its in-list copy as a drop-slot placeholder instead of
     * the default 0.4-opacity ghost. Use it when a `DragOverlay` already renders the dragged item.
     */
    dragPlaceholder?: boolean;
    /**
     * The drag is over but the `DragOverlay` ghost is still flying to this slot, so the placeholder
     * stays up and the item does not reappear under its own ghost. Driven from the owning list's
     * React state, because dnd-kit's own drop side effect writes `opacity: 0` straight onto the node.
     */
    isDropping?: boolean;
    /**
     * Whether the item advertises itself as a keyboard-operable draggable (`role="button"`,
     * `tabIndex=0`, `aria-roledescription` and `aria-describedby` from dnd-kit). Set it to `false` in
     * a pointer-only collection, where that set is a dead tab stop and nests a button role around a
     * chip's own button; pointer dragging is unaffected.
     * @defaultValue true
     */
    keyboardDraggable?: boolean;
}

export function SortableItem(props: PropsWithChildren<SortableItemProps>): React.JSX.Element {
    const {
        children,
        dataTestId,
        grabByDragHandle,
        disableDrag,
        disableTransformOfUndraggedItems,
        dragPlaceholder,
        isDropping,
        keyboardDraggable = true,
    } = props;
    const { attributes, listeners, node, setNodeRef, transform, transition, setActivatorNodeRef, isDragging } =
        useSortable({
            id: props.id,
        });
    // Wrappers between the item's child and the element that draws it; measured when the slot comes up.
    const [surfaceDepth, setSurfaceDepth] = useState(0);

    const dragAttributes = useMemo((): DragAttributes => {
        if (keyboardDraggable) {
            return attributes;
        }

        const stripped: Partial<DragAttributes> = { ...attributes };

        for (const attribute of KEYBOARD_DRAG_ATTRIBUTES) {
            delete stripped[attribute];
        }

        return stripped as DragAttributes;
    }, [attributes, keyboardDraggable]);

    const showPlaceholder = Boolean(dragPlaceholder) && (isDragging || Boolean(isDropping));

    const context = useMemo(
        () => ({
            attributes: disableDrag ? {} : dragAttributes,
            listeners: disableDrag ? {} : listeners,
            ref: setActivatorNodeRef, // Used to attach to the drag handle
            isDragging,
            isPlaceholder: showPlaceholder,
        }),
        [dragAttributes, listeners, setActivatorNodeRef, isDragging, showPlaceholder, disableDrag],
    );

    // Before paint, so the slot never flashes on an anchor wrapper first.
    useLayoutEffect(() => {
        if (showPlaceholder && node.current !== null) {
            setSurfaceDepth(findItemSurface(node.current)?.depth ?? 0);
        }
    }, [showPlaceholder, node]);

    const transformRecalculated = transform
        ? { ...transform, x: isDragging ? transform.x : 0, y: isDragging ? transform.y : 0 }
        : null;

    const style: React.CSSProperties = {
        opacity: isDragging && !dragPlaceholder ? 0.4 : 1,
        touchAction: 'none', // See https://docs.dndkit.com/api-documentation/sensors/pointer#recommendations
        // The placeholder marks the drop slot in the flow of the list, so the translate that would
        // drag its copy around is skipped.
        transform: showPlaceholder
            ? undefined
            : CSS.Translate.toString(disableTransformOfUndraggedItems ? transformRecalculated : transform),
        transition,
        WebkitUserSelect: 'none', // Do not show the "magnifying glass" on mobile Safari
        cursor: disableDrag ? 'default' : isDragging ? 'grabbing' : grabByDragHandle ? 'default' : 'grab',
    };

    // The placeholder styling lands on the item's own wrapper, so the children stay exactly where
    // they are in the tree (see `dragPlaceholderSx`).
    const sx = showPlaceholder ? dragPlaceholderSx(surfaceDepth) : undefined;

    if (grabByDragHandle) {
        return (
            <SORTABLE_ITEM_CONTEXT.Provider value={context}>
                <Box ref={setNodeRef} data-testid={dataTestId} style={style} sx={sx}>
                    {children}
                </Box>
            </SORTABLE_ITEM_CONTEXT.Provider>
        );
    }

    return (
        <Box
            ref={setNodeRef}
            data-testid={dataTestId}
            style={style}
            sx={sx}
            {...(disableDrag ? {} : dragAttributes)}
            {...(disableDrag ? {} : listeners)}
        >
            {children}
        </Box>
    );
}
