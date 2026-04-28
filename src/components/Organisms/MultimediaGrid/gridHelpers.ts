import { SEPARATOR_ROW_HEIGHT } from '../DataGrid/spacer.js';
import { MediaGridItemProps } from './gridApi.js';

export const pixelsToNumber = (pixels: string | number): number => {
    if (typeof pixels === 'number') {
        return pixels;
    }

    const pixelNumberStr = pixels.toString().replace(/px|rem|em|%/g, '');
    const pixelNumber = parseFloat(pixelNumberStr);

    if (isNaN(pixelNumber)) {
        throw new Error(`Invalid pixel value: ${pixels}`);
    }

    return pixelNumber;
};

export interface SpacerItem {
    id: string;
    separator: {
        title: string;
        color: string;
        icon: React.ReactNode;
    };
}

export interface GridLayoutItem {
    type: 'item' | 'spacer';
    data: unknown;
    originalIndex?: number;
}

export interface VirtualRow {
    index: number;
    type: 'item' | 'spacer';
    items?: MediaGridItemProps[];
    spacer?: SpacerItem;
    columns?: number;
}

export const isSpacerItem = (item: unknown): item is SpacerItem => {
    if (!item || typeof item !== 'object') {
        return false;
    }

    const itemObj = item as Record<string, unknown>;

    return (
        'separator' in itemObj && 'id' in itemObj && typeof itemObj.id === 'string' && itemObj.id.startsWith('spacer-')
    );
};

export const createVirtualRows = (items: MediaGridItemProps[], columns: number): VirtualRow[] => {
    const virtualRows: VirtualRow[] = [];
    let currentRowItems: MediaGridItemProps[] = [];

    for (let i = 0; i < items.length; i++) {
        const item = items[i];

        if (isSpacerItem(item)) {
            if (currentRowItems.length > 0) {
                virtualRows.push({
                    index: virtualRows.length,
                    type: 'item',
                    items: [...currentRowItems],
                    columns,
                });
                currentRowItems = [];
            }

            virtualRows.push({
                index: virtualRows.length,
                type: 'spacer',
                spacer: item,
            });
        } else {
            currentRowItems.push(item);

            if (currentRowItems.length === columns) {
                virtualRows.push({
                    index: virtualRows.length,
                    type: 'item',
                    items: [...currentRowItems],
                    columns,
                });
                currentRowItems = [];
            }
        }
    }

    if (currentRowItems.length > 0) {
        virtualRows.push({
            index: virtualRows.length,
            type: 'item',
            items: [...currentRowItems],
            columns,
        });
    }

    return virtualRows;
};

export const getRowHeight = (
    virtualRow: VirtualRow,
    itemHeight: number,
    spacerHeight = SEPARATOR_ROW_HEIGHT,
    rowGap = 0,
): number => {
    const baseHeight = virtualRow?.type === 'spacer' ? spacerHeight : itemHeight;

    return baseHeight + rowGap;
};

export const calculateRowPosition = (
    virtualRows: VirtualRow[],
    targetIndex: number,
    itemHeight: number,
    rowGap: number,
    spacerHeight = SEPARATOR_ROW_HEIGHT,
    toolbarOffset = 0,
): number => {
    let position = toolbarOffset;

    for (let i = 0; i < targetIndex; i++) {
        position += getRowHeight(virtualRows[i], itemHeight, spacerHeight, rowGap);
    }

    return position;
};

export const calculateTotalHeight = (
    virtualRows: VirtualRow[],
    itemHeight: number,
    rowGap: number,
    spacerHeight = SEPARATOR_ROW_HEIGHT,
    toolbarOffset = 0,
): number => {
    if (virtualRows.length === 0) {
        return toolbarOffset;
    }

    let totalHeight = toolbarOffset;

    virtualRows.forEach((row) => {
        totalHeight += getRowHeight(row, itemHeight, spacerHeight, rowGap);
    });

    return totalHeight;
};

export const calculateGlobalIndex = (virtualRows: VirtualRow[], rowIndex: number, indexInRow: number): number => {
    let globalIndex = 0;

    for (let i = 0; i < rowIndex; i++) {
        const prevRow = virtualRows[i];

        if (prevRow.type === 'item' && prevRow.items) {
            globalIndex += prevRow.items.length;
        }
    }

    return globalIndex + indexInRow;
};

/**
 * Calculate the actual index in the original items array (excluding spacers)
 * This is used for selection logic where we need to map virtualRows position
 * to the position in the original items array
 */
export const calculateItemsArrayIndex = (
    items: ReadonlyArray<unknown>,
    virtualRows: VirtualRow[],
    rowIndex: number,
    indexInRow: number,
): number => {
    let nonSpacerItemsBeforeCurrentRow = 0;

    for (let i = 0; i < rowIndex; i++) {
        const prevRow = virtualRows[i];

        if (prevRow.type === 'item' && prevRow.items) {
            nonSpacerItemsBeforeCurrentRow += prevRow.items.length;
        }
    }

    const targetNonSpacerIndex = nonSpacerItemsBeforeCurrentRow + indexInRow;

    let nonSpacerCount = 0;

    for (let i = 0; i < items.length; i++) {
        const item = items[i];

        if (!isSpacerItem(item)) {
            if (nonSpacerCount === targetNonSpacerIndex) {
                return i;
            }

            nonSpacerCount++;
        }
    }

    return targetNonSpacerIndex;
};

export const createItemContext = (
    item: unknown,
    virtualRows: VirtualRow[],
    rowIndex: number,
    indexInRow: number,
    maxItemsPerRow: number,
    itemWidth: number,
    itemHeight: number,
    breakpoint: string,
    isSelected?: boolean,
    itemId?: string | number,
    toggleItemSelection?: (itemId: string | number) => void,
    checkboxSelection?: boolean,
    disableSelectionOnClick?: boolean,
    isActiveCard?: boolean,
    setActiveCardId?: (itemId: string | number | null) => void,
): {
    item: Record<string, unknown>;
    globalIndex: number;
    indexInRow: number;
    rowIndex: number;
    itemsInCurrentRow: number;
    maxItemsPerRow: number;
    itemWidth: number;
    itemHeight: number;
    isFirstInRow: boolean;
    isLastInRow: boolean;
    isFirstRow: boolean;
    isLastRow: boolean;
    breakpoint: string;
    isSelected?: boolean;
    itemId?: string | number;
    toggleItemSelection?: (itemId: string | number) => void;
    checkboxSelection?: boolean;
    disableSelectionOnClick?: boolean;
    isActiveCard?: boolean;
    setActiveCardId?: (itemId: string | number | null) => void;
} => {
    const virtualRow = virtualRows[rowIndex];
    const itemsInCurrentRow = virtualRow.type === 'item' && virtualRow.items ? virtualRow.items.length : 0;

    const globalIndex = calculateGlobalIndex(virtualRows, rowIndex, indexInRow);

    return {
        item: item as Record<string, unknown>,
        globalIndex,
        indexInRow,
        rowIndex,
        itemsInCurrentRow,
        maxItemsPerRow,
        itemWidth: parseFloat(itemWidth.toFixed(2)),
        itemHeight: parseFloat(itemHeight.toFixed(2)),
        isFirstInRow: indexInRow === 0,
        isLastInRow: indexInRow === itemsInCurrentRow - 1,
        isFirstRow: rowIndex === 0,
        isLastRow: rowIndex === virtualRows.length - 1,
        breakpoint,
        isSelected,
        itemId,
        toggleItemSelection,
        checkboxSelection,
        disableSelectionOnClick,
        isActiveCard,
        setActiveCardId,
    };
};

export const generateItemKey = (item: unknown, rowIndex: number, indexInRow: number): string => {
    if (!item || typeof item !== 'object') {
        return `item-${rowIndex}-${indexInRow}`;
    }

    const itemObj = item as Record<string, unknown>;

    return (itemObj.id as string) || `item-${rowIndex}-${indexInRow}`;
};
