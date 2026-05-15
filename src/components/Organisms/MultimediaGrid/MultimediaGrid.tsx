import { Box, Stack, styled, useTheme } from '@mui/material';
import { useVirtualizer } from '@tanstack/react-virtual';
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { SEPARATOR_ROW_HEIGHT } from '../DataGrid/spacer.js';
import { DataToolbar } from '../../internal/DataToolbar.js';
import { GridSpacer } from '../../internal/GridSpacer.js';
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
        placeholderLabels,
    } = props;
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

    useItemsSync(apiRef, items);
    useBottomBarSetup(checkboxSelection, apiRef, setBottomBarState);

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
        checkboxSelection,
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

    // Check if we should show empty or error state.
    const hasItems = items.length > 0;
    const showEmptyState = !loading && !error && !hasItems;
    const showErrorState = !loading && error;
    const showGrid = !error && hasItems;

    return (
        <Stack sx={{ width: '100%', height: '100%', ...sx }}>
            {showRingToolbar ? (
                <DataToolbar
                    labels={labels}
                    sortableFields={sortableFields}
                    rowsCount={totalRowCount}
                    loading={loading}
                    mode="standalone"
                    refreshItems={refreshItems}
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
                                        return (
                                            <GridItemContainer
                                                key={generateItemKey(item, virtualItem.index, indexInRow)}
                                                itemWidth={itemWidth}
                                                cellRatio={resolvedCellRatio}
                                            >
                                                <DefaultMediaCardSlot
                                                    apiRef={apiRef}
                                                    item={item}
                                                    dataTestIdSuffix={`${dataTestIdSuffix}-item-${virtualItem.index}-${indexInRow}`}
                                                    {...slotProps?.mediaCard}
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

interface MediaCardSlotProps extends MediaCardProps {
    apiRef: MediaGridApi;
    item: MediaGridItemProps;
}

const DefaultMediaCardSlot: React.FC<MediaCardSlotProps> = ({ apiRef, item, dataTestIdSuffix, ...otherProps }) => {
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
            dataTestIdSuffix={dataTestIdSuffix}
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
export type { MediaGridApi as GridApiRef, MediaGridItemProps, MediaGridItemsProps } from './gridApi.js';
