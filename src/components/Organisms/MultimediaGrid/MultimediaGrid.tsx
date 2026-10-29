import { Box, Stack, styled, useTheme } from '@mui/material';
import { useVirtualizer } from '@tanstack/react-virtual';
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { GridRowId } from '@mui/x-data-grid';
import { GridSpacer, SEPARATOR_ROW_HEIGHT } from '../../internal/spacer.js';
import { DataToolbar, StandaloneToolbarProps } from './DataToolbar.js';
import { FilterChipGroup } from '../../internal/FilterChipGroup.js';
import { MediaCard, MediaCardProps } from '../MediaCard/MediaCard.js';
import {
    calculateRowPosition,
    calculateTotalHeight,
    generateItemKey,
    getRowHeight,
    VirtualRow,
} from './gridHelpers.js';
import { MultimediaGridProps } from './multimediaGrid.types.js';
import { useCellRatio } from './useCellRatio.js';
import { useContainerWidth } from './useContainerWidth.js';
import { useCurrentBreakpoint } from './useCurrentBreakpoint.js';
import { useDynamicLayout } from './useDynamicLayout.js';
import { useVirtualizerOnChange, useInfiniteScrollHandler } from './useVirtualizerHandlers.js';
import { useSpacersInfo } from './useSpacersInfo.js';
import { useSpacing } from './useSpacing.js';
import {
    useGridApiRef,
    MediaGridItemProps,
    MediaGridApi,
    useSyncGridProps,
    useSelectionChange,
    useActiveCardChange,
} from './gridApi.js';
import { useVirtualRowsSync } from './useVirtualRowsSync.js';
import { useResolvedColumns } from './useResolvedColumns.js';
import { useBottomBarContext } from '../../internal/BottomBar/BottomBarContext.js';
import { useItemsSync, useBottomBarSetup } from './useMultimediaGridSetup.js';
import { Placeholder, PlaceholderVariant } from '../../Molecules/Placeholder/Placeholder.js';
import { CommonLanguages } from '../../../helpers/commonTypes.js';
import { useScrollToActiveCard } from './useScrollToActiveCard.js';
import { resolveItemDataTestId } from '../../../helpers/dataTestId.js';
import { useRingDataTestId } from '../../../helpers/hooks/useRingDataTestId.js';

export const MultimediaGrid: React.FC<MultimediaGridProps> = (props) => {
    const {
        labels,
        items,
        sortableFields,
        totalRowCount = 0,
        columns,
        cellRatio,
        spacing,
        rowSpacing,
        columnSpacing,
        overscan = 1,
        showRingToolbar = false,
        loading = false,
        error = false,
        slotProps = {},
        refreshItems,
        sortField,
        refreshCallback,
        autoRefresh,
        refreshRate,
        disableAutoRefreshOnUserInteraction,
        userInteractionDebounceDelay,
        initialState,
        autoRefreshCallback,
        enableBulkActions = false,
        bulkActions,
        onBulkActionsClose,
        maxRowsCount,
        sx = {},
        onLoadMore,
        hasMore = false,
        selectionModel,
        onSelectionModelChange,
        disableSelection = false,
        disableSelectionOnClick = false,
        checkboxSelection = false,
        additionalComponent,
        apiRef: externalApiRef,
        dynamicLayout = false,
        dynamicCardWidth = 200,
        dynamicCardHeight = 300,
        dataTestIdSuffix,
        getItemDataTestId,
        placeholderLabels,
        filterChips,
    } = props;
    const dataTestId = useRingDataTestId('MultimediaGrid', dataTestIdSuffix);
    const internalApiRef = useGridApiRef();
    const apiRef = externalApiRef || internalApiRef;
    const { setBottomBarState } = useBottomBarContext();
    const theme = useTheme();
    const language = theme?.locale || CommonLanguages.enUS;

    if (!apiRef.current) {
        throw new Error(
            'MultimediaGrid requires a valid apiRef. Please provide one using the apiRef prop or use the useGridApiRef hook to create one.',
        );
    }

    // Bulk actions work on the selection, so they turn checkbox selection on like `RingDataGrid` does.
    const resolvedCheckboxSelection = checkboxSelection || enableBulkActions;

    useItemsSync(apiRef, items);
    useBottomBarSetup(resolvedCheckboxSelection, apiRef, setBottomBarState);

    const [, forceUpdate] = useState([]);
    const parentRef = useRef<HTMLElement>(null);
    const spacerHeight = SEPARATOR_ROW_HEIGHT;
    const containerWidth = useContainerWidth(parentRef);
    const breakpoint = useCurrentBreakpoint(containerWidth);

    const gap = useSpacing(spacing, rowSpacing, columnSpacing, breakpoint);

    const dynamicLayoutResult = useDynamicLayout(
        dynamicLayout,
        containerWidth,
        dynamicCardWidth,
        dynamicCardHeight,
        gap.column,
    );

    const columnsFromHook = useResolvedColumns(columns, breakpoint);
    const resolvedColumns = dynamicLayoutResult ? dynamicLayoutResult.countPerRow : columnsFromHook;

    const resolvedCellRatio = useCellRatio(cellRatio, breakpoint);
    const { isFirstItemSpacer } = useSpacersInfo(items);
    const toolbarOffset = showRingToolbar ? 0 : 0;
    const topSpacing = isFirstItemSpacer ? 0 : gap.row > 0 ? gap.row : 0;
    const totalTopOffset = toolbarOffset + topSpacing;

    const itemWidth = dynamicLayoutResult
        ? dynamicLayoutResult.width
        : (containerWidth - gap.column * (resolvedColumns - 1) - gap.column * 2) / resolvedColumns;

    const itemHeight = dynamicLayoutResult ? dynamicLayoutResult.height : Math.ceil(itemWidth * resolvedCellRatio);

    useVirtualRowsSync(apiRef, resolvedColumns);
    const virtualRows = apiRef.current.getVirtualRows();
    const infiniteScrollHandler = useInfiniteScrollHandler(
        {
            onLoadMore,
            loading,
            hasMore,
        },
        items,
    );

    const virtualizerOnChange = useVirtualizerOnChange({
        handlers: [infiniteScrollHandler],
        onlyWhenScrollingStopped: true,
    });

    useSyncGridProps({
        apiRef,
        checkboxSelection: resolvedCheckboxSelection,
        disableSelection,
        disableSelectionOnClick,
        selectionModel,
        onSelectionModelChange,
    });

    const rowVirtualizer = useVirtualizer({
        count: virtualRows.length,
        getScrollElement: () => parentRef.current,
        estimateSize: (index) => {
            const virtualRow: VirtualRow = virtualRows[index];

            return getRowHeight(virtualRow, itemHeight, spacerHeight, gap.row);
        },
        overscan,
        onChange: virtualizerOnChange,
    });

    useScrollToActiveCard(apiRef, containerWidth, virtualRows, rowVirtualizer);

    useLayoutEffect(() => {
        rowVirtualizer.measure();
    }, [resolvedColumns, items.length, containerWidth, gap.row, gap.column, rowVirtualizer]);

    useEffect(() => {
        if (!apiRef.current) {
            return;
        }

        const unsubscribe = apiRef.current.subscribeEvent('stateChange', () => {
            // Force re-render for visualization
            forceUpdate([]);
        });

        return unsubscribe;
    }, [apiRef]);

    const totalHeight = useMemo(() => {
        return calculateTotalHeight(virtualRows, itemHeight, gap.row, spacerHeight, totalTopOffset);
    }, [virtualRows, itemHeight, gap.row, spacerHeight, totalTopOffset]);

    /*
     * How many items precede each row. `virtualItem.index` counts rows, so without this
     * offset every card in a row would share one index — and `getItemDataTestId` is
     * documented as `(item, index)` over items.
     */
    const rowItemOffsets = useMemo(() => {
        const offsets: number[] = [];
        let seen = 0;

        virtualRows.forEach((row, rowIndex) => {
            offsets[rowIndex] = seen;
            seen += row.items?.length ?? 0;
        });

        return offsets;
    }, [virtualRows]);

    // Check if we should show empty or error state.
    const hasItems = items.length > 0;
    const showEmptyState = !loading && !error && !hasItems;
    const showErrorState = !loading && error;
    const showGrid = !error && hasItems;

    return (
        <Stack data-testid={dataTestId} sx={{ width: '100%', height: '100%', ...sx }}>
            <FilterChipGroup chips={filterChips?.chips} onDeleteAll={filterChips?.onDeleteAll} />
            {showRingToolbar ? (
                <MultimediaGridToolbar
                    apiRef={apiRef}
                    dataTestIdSuffix={dataTestIdSuffix}
                    labels={labels}
                    sortableFields={sortableFields}
                    sortField={sortField}
                    totalRowCount={totalRowCount}
                    loading={loading}
                    refreshItems={refreshItems}
                    refreshCallback={refreshCallback}
                    autoRefresh={autoRefresh}
                    refreshRate={refreshRate}
                    disableAutoRefreshOnUserInteraction={disableAutoRefreshOnUserInteraction}
                    userInteractionDebounceDelay={userInteractionDebounceDelay}
                    initialState={initialState}
                    autoRefreshCallback={autoRefreshCallback}
                    enableBulkActions={enableBulkActions}
                    bulkActions={bulkActions}
                    onBulkActionsClose={onBulkActionsClose}
                    maxRowsCount={maxRowsCount}
                    additionalComponent={additionalComponent}
                />
            ) : null}
            <GridContainer ref={parentRef}>
                {showErrorState && (
                    <Placeholder
                        variant={PlaceholderVariant.ERROR_LIST}
                        labels={placeholderLabels?.error}
                        {...(refreshItems
                            ? {
                                  buttons: [
                                      {
                                          children:
                                              placeholderLabels?.tryAgainButton ??
                                              (language === CommonLanguages.plPL ? 'Spróbuj ponownie' : 'Try again'),
                                          variant: 'contained',
                                          onClick: () => refreshItems(),
                                      },
                                  ],
                              }
                            : {})}
                    />
                )}
                {showEmptyState && (
                    <Placeholder variant={PlaceholderVariant.NOT_FOUND} labels={placeholderLabels?.empty} />
                )}
                {showGrid && (
                    <GridInnerContainer totalHeight={totalHeight}>
                        {rowVirtualizer.getVirtualItems().map((virtualItem) => {
                            const virtualRow = virtualRows[virtualItem.index];

                            if (!virtualRow) {
                                return null;
                            }

                            const yPosition = calculateRowPosition(
                                virtualRows,
                                virtualItem.index,
                                itemHeight,
                                gap.row,
                                spacerHeight,
                                totalTopOffset,
                            );

                            if (virtualRow.type === 'spacer') {
                                return (
                                    <GridSpacerContainer
                                        key={`spacer-${virtualItem.index}`}
                                        data-index={virtualItem.index}
                                        yPosition={yPosition}
                                        spacerHeight={spacerHeight}
                                        horizontalPadding={gap.column}
                                    >
                                        {virtualRow.spacer && (
                                            <GridSpacer
                                                separator={virtualRow.spacer.separator}
                                                withTopBorder={false}
                                                withBottomBorder={false}
                                            />
                                        )}
                                    </GridSpacerContainer>
                                );
                            }

                            return (
                                <GridRowContainer
                                    key={`items-${virtualItem.index}`}
                                    data-index={virtualItem.index}
                                    yPosition={yPosition}
                                    rowHeight={itemHeight}
                                    columnGap={gap.column}
                                >
                                    {virtualRow.items?.map((item, indexInRow) => {
                                        const itemIndex = (rowItemOffsets[virtualItem.index] ?? 0) + indexInRow;

                                        return (
                                            <GridItemContainer
                                                key={generateItemKey(item, virtualItem.index, indexInRow)}
                                                itemWidth={itemWidth}
                                                cellRatio={resolvedCellRatio}
                                            >
                                                <DefaultMediaCardSlot
                                                    apiRef={apiRef}
                                                    item={item}
                                                    {...slotProps?.mediaCard}
                                                    // Set after the slot props, which would
                                                    // otherwise give every card one id.
                                                    itemDataTestId={resolveItemDataTestId({
                                                        componentName: 'MultimediaGrid',
                                                        listSuffix: dataTestIdSuffix,
                                                        itemId: item.id,
                                                        index: itemIndex,
                                                        item,
                                                        override: getItemDataTestId?.(item, itemIndex),
                                                    })}
                                                />
                                            </GridItemContainer>
                                        );
                                    })}
                                </GridRowContainer>
                            );
                        })}
                    </GridInnerContainer>
                )}
            </GridContainer>
        </Stack>
    );
};

const GridContainer = styled(Box)({
    overflow: 'auto',
});

const GridInnerContainer = styled('div', {
    shouldForwardProp: (prop) => prop !== 'totalHeight',
})<{ totalHeight: number }>(({ totalHeight }) => ({
    height: `${totalHeight}px`,
    width: '100%',
    position: 'relative',
}));

const GridRowContainer = styled('div', {
    shouldForwardProp: (prop) => !['yPosition', 'rowHeight', 'columnGap'].includes(prop as string),
})<{
    yPosition: number;
    rowHeight: number;
    columnGap?: number;
}>(({ yPosition, rowHeight, columnGap = 0 }) => ({
    position: 'absolute',
    top: 0,
    left: 0,
    transform: `translateY(${yPosition}px)`,
    width: '100%',
    height: `${rowHeight}px`,
    boxSizing: 'border-box',
    display: 'flex',
    alignItems: 'center',
    gap: `${columnGap}px`,
    paddingLeft: `${columnGap}px`,
    paddingRight: `${columnGap}px`,
}));

const GridSpacerContainer = styled('div', {
    shouldForwardProp: (prop) => !['yPosition', 'spacerHeight', 'horizontalPadding'].includes(prop as string),
})<{ yPosition: number; spacerHeight: number; horizontalPadding?: number }>(
    ({ yPosition, spacerHeight, horizontalPadding = 0 }) => ({
        position: 'absolute',
        top: 0,
        left: 0,
        transform: `translateY(${yPosition}px)`,
        width: '100%',
        height: `${spacerHeight}px`,
        boxSizing: 'border-box',
        paddingLeft: `${horizontalPadding}px`,
        paddingRight: `${horizontalPadding}px`,
    }),
);

const GridItemContainer = styled(Box, {
    shouldForwardProp: (prop) => !['itemWidth', 'cellRatio'].includes(prop as string),
})<{ itemWidth: number; cellRatio: number }>(({ itemWidth, cellRatio }) => ({
    aspectRatio: cellRatio,
    height: '100%',
    width: `${itemWidth}px`,
    flexShrink: 0,
}));

interface MultimediaGridToolbarProps extends Omit<StandaloneToolbarProps, 'mode' | 'selectedRows'> {
    apiRef: MediaGridApi;
}

/*
 * Selection changes are dispatched without a grid-wide re-render, so the toolbar follows them
 * on its own to keep the bulk actions in step with the selected items.
 */
function MultimediaGridToolbar(props: MultimediaGridToolbarProps): React.JSX.Element {
    const { apiRef, onBulkActionsClose, ...toolbarProps } = props;
    const [selectedRows, setSelectedRows] = useState<GridRowId[]>(() =>
        Array.from(apiRef.current?.getSelectionModel().ids ?? []),
    );

    const handleSelectionChange = useCallback(({ selectedIds }: { selectedIds: GridRowId[] }): void => {
        setSelectedRows(selectedIds);
    }, []);

    const handleBulkActionsClose = useCallback(
        (event: React.MouseEvent<HTMLButtonElement>): void => {
            apiRef.current?.clearSelection();
            onBulkActionsClose?.(event);
        },
        [apiRef, onBulkActionsClose],
    );

    useSelectionChange(apiRef, handleSelectionChange);

    return (
        <DataToolbar
            {...toolbarProps}
            mode="standalone"
            selectedRows={selectedRows}
            onBulkActionsClose={handleBulkActionsClose}
        />
    );
}

interface MediaCardSlotProps extends MediaCardProps {
    apiRef: MediaGridApi;
    item: MediaGridItemProps;
    itemDataTestId?: string;
}

const DefaultMediaCardSlot: React.FC<MediaCardSlotProps> = ({ apiRef, item, itemDataTestId, ...otherProps }) => {
    const [, forceUpdate] = useState({});

    const itemId = item.id;
    const isSelected = apiRef.current?.isItemSelected(itemId);
    const isActiveCard = apiRef.current?.isCardActive(itemId);
    const checkboxSelection = apiRef.current?.isSelectionEnabled();
    const disableSelectionOnClick = apiRef.current?.isSelectionOnClickDisabled();

    useSelectionChange(apiRef, ({ selectedIds }) => {
        if (selectedIds.includes(itemId) || isSelected) {
            forceUpdate({});
        }
    });

    useActiveCardChange(apiRef, ({ activeCardId }) => {
        if (activeCardId === itemId || isActiveCard) {
            forceUpdate({});
        }
    });

    const handleCheckboxClick = (event: React.MouseEvent): void => {
        if (!apiRef.current) {
            return;
        }

        event.stopPropagation();
        apiRef.current.toggleItemSelection(itemId);
    };

    const handleCardClick = (): void => {
        if (!apiRef.current) {
            return;
        }

        const currentActiveCardId = apiRef.current?.getActiveCardId();

        if (currentActiveCardId === itemId) {
            apiRef.current.setActiveCardId(null);
        } else {
            apiRef.current.setActiveCardId(itemId);
        }

        if (!disableSelectionOnClick && checkboxSelection) {
            apiRef.current.toggleItemSelection(itemId);
        }

        const itemOnClick = item?.onClick;

        if (itemOnClick) {
            itemOnClick();
        }
    };

    const mediaCardProps = otherProps as Partial<MediaCardProps>;
    const slotProps = {
        ...(mediaCardProps?.slotProps || {}),
        ...(!checkboxSelection && { checkbox: undefined }),
        ...(checkboxSelection &&
            itemId !== undefined && {
                checkbox: {
                    ...((mediaCardProps?.slotProps as MediaCardProps['slotProps'])?.checkbox || {}),
                    checked: isSelected || false,
                    onClick: handleCheckboxClick,
                    showOnHover: isSelected
                        ? false
                        : ((mediaCardProps?.slotProps as MediaCardProps['slotProps'])?.checkbox?.showOnHover ?? false),
                },
            }),
    };

    return (
        <MediaCard
            slotProps={slotProps}
            {...item}
            onClick={handleCardClick}
            hoverable={mediaCardProps?.hoverable ?? true}
            active={isActiveCard || false}
            dataTestId={itemDataTestId}
            sx={{
                height: '100%',
                ...mediaCardProps?.sx,
            }}
        />
    );
};

export type {
    MultimediaGridItemSlotProps,
    MultimediaGridCellContext,
    MultimediaGridProps,
    MultimediaGridSlots,
    MultimediaGridSlotProps,
    MultimediaGridSlotComponent,
} from './multimediaGrid.types.js';

export { useGridApiRef, useActiveCardChange } from './gridApi.js';
export type { MediaGridApi, MediaGridApi as GridApiRef, MediaGridItemProps, MediaGridItemsProps } from './gridApi.js';
