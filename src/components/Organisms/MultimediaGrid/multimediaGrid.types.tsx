import React from 'react';
import { CommonComponentProps } from '../../../helpers/commonTypes.js';
import { DataToolbarBaseProps } from '../../internal/DataToolbar.js';
import { FilterChip } from '../../internal/FilterChipGroup.js';
import { MediaCardProps } from '../MediaCard/MediaCard.js';
import { InfiniteScrollOptions } from './useInfiniteScroll.js';
import { GridRowId, GridCallbackDetails } from '@mui/x-data-grid';
import { MediaGridApi, MediaGridItemsProps } from './gridApi.js';
import { GridRowSelectionModel } from '@mui/x-data-grid-pro';
import { PlaceholderStateLabels } from '../../Molecules/Placeholder/Placeholder.js';

export type BreakpointValue = 'xs' | 'sm' | 'md' | 'lg';
export type ResponsiveValue<T> = T | Partial<Record<BreakpointValue, T>>;

/**
 * Context passed to slots - contains all information about the position and state of the element
 */
export interface MultimediaGridItemSlotProps {
    /** Element data - object containing information about the multimedia element */
    item: Record<string, unknown>;
    /** Element index in the overall list of all elements */
    globalIndex: number;
    /** Element index in the current row (0-based) */
    indexInRow: number;
    /** Row number (0-based) */
    rowIndex: number;
    /** Total number of elements in the current row */
    itemsInCurrentRow: number;
    /** Maximum number of elements per row (from configuration) */
    maxItemsPerRow: number;
    /** Width of a single element in pixels */
    itemWidth: number;
    /** Height of a single element in pixels */
    itemHeight: number;
    /** Whether it's the first element in the row */
    isFirstInRow: boolean;
    /** Whether it's the last element in the row */
    isLastInRow: boolean;
    /** Whether it's the first row */
    isFirstRow: boolean;
    /** Whether it's the last row */
    isLastRow: boolean;
    /** Current container breakpoint (xs, sm, md, lg) */
    breakpoint: BreakpointValue;
    /** Whether this item is currently selected */
    isSelected?: boolean;
    /** Selection identifier for this item */
    itemId?: GridRowId;
    /** Function to toggle selection for this item */
    toggleItemSelection?: (itemId: GridRowId) => void;
    /** Whether checkbox selection is enabled */
    checkboxSelection?: boolean;
    /** Whether clicking on item (not checkbox) should trigger selection */
    disableSelectionOnClick?: boolean;
    /** Whether this item is currently the active/clicked card */
    isActiveCard?: boolean;
    /** Function to set the active card */
    setActiveCardId?: (itemId: GridRowId | null) => void;
}

/**
 * Slot definition - similar to MUI
 */
export interface MultimediaGridSlots {
    /**
     * Slot for the MediaCard component - allows replacing the default MediaCard component
     * with a custom component to display media grid elements.
     */
    mediaCard?: React.ElementType;
}

/**
 * Enhanced slotProps with automatic context and better typing
 */
export interface MultimediaGridSlotProps {
    /**
     * Properties passed to the mediaCard slot.
     * Automatically adds context and maintains full typing for the selected component.
     */
    mediaCard?: MediaCardProps;
}
export type SelectionModelChangeHandler = (
    newSelection: GridRowSelectionModel,
    details?: Partial<GridCallbackDetails>,
) => void;
/**
 * Main interface with improved typing
 */
export interface MultimediaGridProps<TSlots extends MultimediaGridSlots = MultimediaGridSlots>
    extends DataToolbarBaseProps, CommonComponentProps, Pick<InfiniteScrollOptions, 'onLoadMore' | 'hasMore'> {
    items: MediaGridItemsProps;
    rowVerticalPadding?: number;
    /** Number of columns */
    columns?: ResponsiveValue<number>;
    /** Cell ratio in format "width/height" (e.g., "16/9", "4/3", "1/1") */
    cellRatio?: ResponsiveValue<string>;
    /** Spacing for both rows and columns */
    spacing?: ResponsiveValue<number>;
    /** Spacing for rows only */
    rowSpacing?: ResponsiveValue<number>;
    /** Spacing for columns only */
    columnSpacing?: ResponsiveValue<number>;

    /**
     * Enables dynamic layout calculation for optimal card sizing
     * @default false
     */
    dynamicLayout?: boolean;

    /**
     * Target card width in pixels for dynamic layout algorithm
     * @default 200
     */
    dynamicCardWidth?: number;

    /**
     * Target card height in pixels for dynamic layout algorithm
     * @default 300
     */
    dynamicCardHeight?: number;

    /**
     * Error state - when true, displays error message instead of grid
     * @default false
     */
    error?: boolean;
    /**
     * Set of selected item IDs.
     * This prop allows controlling the selection state externally.
     */
    selectionModel?: GridRowSelectionModel;
    /**
     * Callback fired when the selection model changes.
     * @param newSelection The new selection model.
     * @param details Additional details about the selection change.
     */
    onSelectionModelChange?: SelectionModelChangeHandler;
    /**
     * If `true`, the item selection is disabled.
     * @default false
     */
    disableSelection?: boolean;
    /**
     * If `true`, the selection on click on an item is disabled.
     * Similar to MUI DataGrid's disableRowSelectionOnClick.
     * When enabled, only checkbox clicks will trigger selection.
     * @default false
     */
    disableSelectionOnClick?: boolean;

    // Backward compatibility aliases - deprecated
    /** @deprecated Use selectionModel instead */
    rowSelectionModel?: GridRowId[];
    /** @deprecated Use onSelectionModelChange instead */
    onRowSelectionModelChange?: (newSelection: GridRowId[], details: GridCallbackDetails) => void;
    /** @deprecated Use disableSelection instead */
    disableRowSelection?: boolean;
    /** @deprecated Use disableSelectionOnClick instead */
    disableRowSelectionOnClick?: boolean;
    /**
     * If `true`, the checkboxSelection is enabled.
     * @default false
     */
    checkboxSelection?: boolean;

    /**
     * Number of extra items rendered outside of the visible viewport
     * for performance optimization during scrolling
     * @default 3
     */
    overscan?: number;

    showRingToolbar?: boolean;

    /**
     * Overridable component slots.
     * @default {}
     */
    slots?: TSlots;

    /**
     * The props used for each slot inside the component.
     * @default {}
     */
    slotProps?: MultimediaGridSlotProps;

    /**
     * Additional component to be rendered in the toolbar (right side, after the refresh icon)
     */
    additionalComponent?: React.ReactNode;
    apiRef?: MediaGridApi;

    /**
     * Filter chips to be displayed in the FilterChipGroup above the grid.
     */
    filterChips?: {
        chips: FilterChip[];
        onDeleteAll?: () => void | Promise<void>;
    };

    /**
     * Labels for the placeholders rendered when the grid is in an error or empty state.
     * When omitted, the Placeholder component falls back to its default localized labels.
     */
    placeholderLabels?: PlaceholderStateLabels;
}

/**
 * Helpers for context typing
 */
export type MultimediaGridCellContext<T = Record<string, never>> = MultimediaGridItemSlotProps & T;

/**
 * Type for a slot component with context - can be used to type custom components
 */
export type MultimediaGridSlotComponent<TProps = Record<string, unknown>> = React.ComponentType<
    TProps & {
        context: MultimediaGridItemSlotProps;
        slotProps: MediaCardProps;
        apiRef: MediaGridApi;
    } & CommonComponentProps
>;

export type GridItemsProp<T = Record<string | symbol, unknown>> = Readonly<T>;
