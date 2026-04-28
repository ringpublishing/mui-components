import { GridRowId } from '@mui/x-data-grid';

export const getItemRowId = (item: Record<string, unknown>, index: number): GridRowId => {
    return (item?.id as GridRowId) ?? index;
};

export const shouldShowCheckbox = (checkboxSelection: boolean, disableSelection: boolean): boolean => {
    return checkboxSelection && !disableSelection;
};

/**
 * Helper to determine if an item can be selected via click (not checkbox)
 */
export const canSelectItemByClick = (disableSelection: boolean, disableSelectionOnClick: boolean): boolean => {
    return !disableSelection && !disableSelectionOnClick;
};

/**
 * Helper to determine if an item can be selected
 */
export const canSelectItem = (disableSelection: boolean): boolean => {
    // Items can be selected if selection is not disabled
    // In the future, this could be extended to check item-specific properties
    return !disableSelection;
};

/**
 * Helper to get selection state for an item
 */
export const getItemSelectionState = (
    itemRowId: GridRowId,
    selectionModel: GridRowId[],
): {
    isSelected: boolean;
    selectionIndex: number;
} => {
    const selectionIndex = selectionModel.indexOf(itemRowId);
    const isSelected = selectionIndex !== -1;

    return {
        isSelected,
        selectionIndex,
    };
};

/**
 * Helper to toggle item selection in selection model
 */
export const toggleItemInSelection = (itemRowId: GridRowId, currentSelection: GridRowId[]): GridRowId[] => {
    const { isSelected } = getItemSelectionState(itemRowId, currentSelection);

    if (isSelected) {
        // Remove item from selection
        return currentSelection.filter((id) => id !== itemRowId);
    } else {
        // Add item to selection
        return [...currentSelection, itemRowId];
    }
};

/**
 * Helper to validate selection model against items
 * Filters out selection IDs that don't correspond to actual items
 */
export const validateSelectionModel = (
    selectionModel: GridRowId[],
    items: ReadonlyArray<Record<string, unknown>>,
): GridRowId[] => {
    const validIds = new Set<GridRowId>();

    // Build set of valid IDs from items
    items.forEach((item, index) => {
        const rowId = getItemRowId(item, index);
        validIds.add(rowId);
    });

    // Filter selection model to only include valid IDs
    return selectionModel.filter((id) => validIds.has(id));
};

/**
 * Helper to get all possible item IDs from items array
 */
export const getAllRowIds = (items: ReadonlyArray<Record<string, unknown>>): GridRowId[] => {
    return items.map((item, index) => getItemRowId(item, index));
};

/**
 * Helper to check if all items are selected
 */
export const areAllItemsSelected = (
    items: ReadonlyArray<Record<string, unknown>>,
    selectionModel: GridRowId[],
): boolean => {
    if (items.length === 0) {
        return false;
    }

    const allRowIds = getAllRowIds(items);
    const selectionSet = new Set(selectionModel);

    return allRowIds.every((id) => selectionSet.has(id));
};

/**
 * Helper to select all items
 */
export const selectAllItems = (items: ReadonlyArray<Record<string, unknown>>): GridRowId[] => {
    return getAllRowIds(items);
};

/**
 * Helper to deselect all items
 */
export const deselectAllItems = (): GridRowId[] => {
    return [];
};
