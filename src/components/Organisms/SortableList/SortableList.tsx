import React, { createContext, useContext, useMemo } from 'react';
import { IconButton } from '@mui/material';
import { GripVertical } from 'lucide-react';
import { CommonComponentProps } from '../../../helpers/commonTypes.js';
import { GetItemDataTestId, resolveItemDataTestId } from '../../../helpers/dataTestId.js';
import { useRingDataTestId } from '../../../helpers/hooks/useRingDataTestId.js';
import { SORTABLE_ITEM_CONTEXT, SortableItemData } from '../../internal/SortableItem.js';
import { SortableChips } from '../../internal/SortableChips.js';
import { useNonDraggableRef } from '../../../helpers/hooks/useNonDraggableRef.js';
import { DEFAULT_LUCIDE_ICON_SIZE } from '../../../helpers/lucideSize.js';

export type { SortableItemData };

export type SortableListOrientation = 'vertical' | 'horizontal' | 'wrap';

export interface SortableListLabels {
    /**
     * Accessible name of `SortableList.DragHandle`. The handle is an icon-only button, so without a
     * name a screen reader announces nothing but "button" (axe `button-name`).
     * @defaultValue 'Drag to reorder'
     */
    dragHandle?: string;
}

const DEFAULT_LABELS: Required<SortableListLabels> = {
    dragHandle: 'Drag to reorder',
};

/**
 * Hands the resolved labels to `SortableList.DragHandle`, which the consumer renders inside
 * `renderItem` and the list cannot pass props to. A handle rendered outside a `SortableList` gets
 * the English defaults.
 */
const SORTABLE_LIST_LABELS_CONTEXT = createContext<Required<SortableListLabels>>(DEFAULT_LABELS);

// Re-exported so the hook stays importable from here; it lives in helpers/hooks to be shared
// with molecules such as Autocomplete.
export { useNonDraggableRef };

export interface SortableListProps<T extends SortableItemData> extends CommonComponentProps {
    /**
     * List of items to be sorted
     */
    items: T[];

    /**
     * Function that renders an element of the list.
     * `index` is the item's current position; `isDragActive` is true for every item while any drag
     * is in progress — use it to suppress hover affordances (e.g. tooltips).
     * @param item
     */
    renderItem: (item: T, index?: number, isDragActive?: boolean) => React.ReactNode;

    /**
     * Function that is called when the order of items changes. It receives a new list of items.
     * @param items
     */
    onChange(items: T[]): void;

    /**
     * If true, items can be grabbed only by a `SortableList.DragHandle` rendered inside them. Not
     * supported in the `wrap` orientation, where the whole item is always the handle.
     * @defaultValue false
     */
    grabByDragHandle?: boolean;

    /**
     * Overrides the generated `data-testid` per item; return `undefined` to keep the default
     * `ring-sortablelist[-<suffix>]-item-<id>`. Items may instead carry `dataTestId` or
     * `itemDataTestIdSuffix`.
     */
    getItemDataTestId?: GetItemDataTestId<T>;

    /**
     * Layout and drag axis: `vertical` (a column), `horizontal` (a single row) or `wrap` (a wrapping
     * row, e.g. of chips, draggable freely in two dimensions). `wrap` is pointer-only and ignores
     * `grabByDragHandle`.
     * @defaultValue 'vertical'
     */
    orientation?: SortableListOrientation;

    /**
     * User-facing strings the list renders itself. Every member is optional and falls back to the
     * English default.
     */
    labels?: SortableListLabels;
}

export function SortableList<T extends SortableItemData>(props: SortableListProps<T>): React.JSX.Element {
    const {
        items,
        renderItem,
        onChange,
        grabByDragHandle,
        orientation = 'vertical',
        labels,
        dataTestIdSuffix,
        getItemDataTestId,
        sx,
        className,
    } = props;

    const dataTestId = useRingDataTestId('SortableList', dataTestIdSuffix);

    const isWrap = orientation === 'wrap';
    const resolvedLabels = useMemo((): Required<SortableListLabels> => ({ ...DEFAULT_LABELS, ...labels }), [labels]);

    return (
        <SORTABLE_LIST_LABELS_CONTEXT.Provider value={resolvedLabels}>
            <SortableChips
                sx={sx}
                className={className}
                dataTestId={dataTestId}
                items={items}
                onChange={onChange}
                renderChip={renderItem}
                direction={orientation}
                keyboardSorting={!isWrap}
                ghost={isWrap ? 'plain' : 'card'}
                grabByDragHandle={isWrap ? false : grabByDragHandle}
                getItemDataTestId={(item, index): string =>
                    resolveItemDataTestId({
                        componentName: 'SortableList',
                        listSuffix: dataTestIdSuffix,
                        itemId: item.id as string | number,
                        index,
                        item,
                        override: getItemDataTestId?.(item, index),
                    })
                }
            />
        </SORTABLE_LIST_LABELS_CONTEXT.Provider>
    );
}

/**
 * Drag handle component that should be used inside children of SortableList when SortableList's grabByDragHandle is true.
 */
SortableList.DragHandle = function DragHandle(): React.JSX.Element {
    const { attributes, listeners, ref, isDragging, isPlaceholder } = useContext(SORTABLE_ITEM_CONTEXT);
    const { dragHandle } = useContext(SORTABLE_LIST_LABELS_CONTEXT);

    return (
        <IconButton
            {...attributes}
            {...listeners}
            // After `attributes`, which carry dnd-kit's `aria-roledescription` / `aria-describedby`
            // but no name of any kind. An icon-only button without one is announced as "button".
            aria-label={dragHandle}
            ref={ref}
            disableRipple={false}
            disableTouchRipple={true}
            disableFocusRipple={false}
            sx={{
                cursor: isDragging ? 'grabbing' : 'grab',
                // The drop slot hides its content with `visibility: hidden`, and a hidden element
                // cannot hold or regain keyboard focus; the handle stays rendered but transparent.
                ...(isPlaceholder ? { visibility: 'visible', opacity: 0 } : {}),
            }}
        >
            <GripVertical size={DEFAULT_LUCIDE_ICON_SIZE} />
        </IconButton>
    );
};
