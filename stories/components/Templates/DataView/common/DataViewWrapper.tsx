import React, { useState } from 'react';
import { action } from 'storybook/actions';

import {
    DataView,
    DataViewProps,
    MultimediaGrid,
    RingDataGridProps,
    TopSlotProps,
    SpacerItem,
    MediaGridItemProps,
    MediaGridItemsProps,
} from '../../../../../src/index.js';
import { sortableFields, useMultimediaGridDemoData } from '../../../../../src/helpers/stories/ringDemoData.js';
import { DEFAULT_COLUMNS } from '../../../../../src/components/Organisms/MultimediaGrid/useResolvedColumns.js';
import { DEFAULT_CELL_RATIO } from '../../../../../src/components/Organisms/MultimediaGrid/useCellRatio.js';
import { StoryRingDataGridWrapper } from '../../../Organisms/DataGrid/common/StoryRingDataGridWrapper.js';
import { BottomBarSlotProps } from '../../../../../src/components/internal/BottomBar/BottomBarContainer.js';
import { Filter, Detail, AdditionalComponent, searchBarChildren, searchBarMenuActions } from './defaultArgs.js';

export interface DataViewWrapperProps {
    disableFilter?: boolean;
    disableDetail?: boolean;
    enabledMultimediaGrid?: boolean;
    enableDynamicMultimediaGrid?: boolean;
    filterDynamicWidth?: boolean;
    leftSlotWidth?: DataViewProps['leftSlotWidth'];
    // MultimediaGrid props
    columns?: object;
    cellRatio?: object | string;
    spacing?: number;
    rowSpacing?: number;
    columnSpacing?: number;
    overscan?: number;
    showRingToolbar?: boolean;
    loading?: boolean;
    error?: boolean;
    slotProps?: {
        top?: TopSlotProps;
        bottom?: BottomBarSlotProps;
    };
    gridProps?: Partial<RingDataGridProps>;
}

export const DataViewWrapper = ({
    disableFilter = false,
    disableDetail = false,
    enabledMultimediaGrid = false,
    filterDynamicWidth = false,
    leftSlotWidth,
    enableDynamicMultimediaGrid = false,
    columns = DEFAULT_COLUMNS,
    cellRatio = DEFAULT_CELL_RATIO,
    spacing = 1,
    rowSpacing,
    columnSpacing,
    overscan = 1,
    showRingToolbar = true,
    loading: loadingProp = false,
    error = false,
    slotProps = {},
    gridProps = {},
}: DataViewWrapperProps): React.JSX.Element => {
    const [detailOpen, setDetailOpen] = useState(false);
    const [detailData, setDetailData] = useState<{ title?: { imageUrl?: string; label?: string } } | null>(null);
    const [selectedMultimediaItem, setSelectedMultimediaItem] = useState<Record<string, unknown> | null>(null);
    const [gridMode, setGridMode] = useState<'dataGrid' | 'multimediaGrid'>('multimediaGrid');
    const [filterOpen, setFilterOpen] = useState(true);

    const memoizedGridProps = React.useMemo(() => gridProps, [gridProps]);

    const defaultGrid = React.useMemo(
        () => (
            <StoryRingDataGridWrapper
                withContainer={false}
                onRowClick={(item): void => {
                    action('RingDataGrid: Row clicked')(item.row?.id || item.row?.title);
                    setDetailData(item.row);
                    setDetailOpen(true);
                }}
                {...(memoizedGridProps as RingDataGridProps)}
            />
        ),
        [memoizedGridProps],
    );

    let grid = defaultGrid;

    const {
        filteredItems,
        loading: gridDataLoading,
        hasMore,
        totalCount,
        handleLoadMore,
        handleSearchChange: multimediaGridSearchChange,
        refresh,
    } = useMultimediaGridFiltering(enabledMultimediaGrid);

    const isSpacerItem = (item: unknown): item is SpacerItem => {
        return typeof item === 'object' && item !== null && 'separator' in item;
    };

    const multimediaItems: MediaGridItemsProps = React.useMemo(() => {
        if (!enabledMultimediaGrid) {
            return [];
        }

        return filteredItems.map((item: Record<string, unknown>, index): MediaGridItemProps | SpacerItem => {
            if (isSpacerItem(item)) {
                return item as SpacerItem;
            }

            const candidate = item as Partial<MediaGridItemProps>;
            const candidateId = candidate.id;
            const id =
                typeof candidateId === 'string' || typeof candidateId === 'number'
                    ? candidateId
                    : `media-item-${index}`;

            const originalOnClick = typeof candidate.onClick === 'function' ? candidate.onClick : undefined;

            const mediaItem: MediaGridItemProps = {
                ...candidate,
                id,
                onClick: (): void => {
                    originalOnClick?.();
                    action('MultimediaGrid: Item clicked')(id);
                    setSelectedMultimediaItem(item);
                    setDetailOpen(true);
                },
            } as MediaGridItemProps;

            return mediaItem;
        }) as MediaGridItemsProps;
    }, [enabledMultimediaGrid, filteredItems, setDetailOpen, setSelectedMultimediaItem]);

    const handleSearchChange = (query: string): void => {
        if (enabledMultimediaGrid) {
            action('DataViewWrapper: Search query changed (MultimediaGrid mode)')(query);
            multimediaGridSearchChange(query);
        } else {
            action('DataViewWrapper: Search query changed (DataGrid mode)')(query);
        }
    };

    const args = {
        items: multimediaItems,
        loading: loadingProp || gridDataLoading,
        showRingToolbar,
        error,
        totalRowCount: enabledMultimediaGrid ? totalCount : filteredItems.length,
        sortableFields,
        columns,
        cellRatio,
        spacing,
        rowSpacing,
        columnSpacing,
        overscan,
        onLoadMore: enabledMultimediaGrid ? handleLoadMore : undefined,
        hasMore: enabledMultimediaGrid ? hasMore : false,
        labels: {
            results: 'Results',
            refresh: 'Refresh',
            enableAutoRefresh: 'Enable auto refresh',
            disableAutoRefresh: 'Disable auto refresh',
        },
    };

    // Additional component for dynamic grid mode toggle
    const additionalComponent = (
        <AdditionalComponent
            enableDynamicMultimediaGrid={enableDynamicMultimediaGrid}
            gridMode={gridMode}
            onGridModeChange={(mode: 'dataGrid' | 'multimediaGrid'): void => {
                setGridMode(mode);
                refresh();
            }}
            onAction={(actionName: string, data?: unknown): void => {
                action(actionName)(data);
            }}
        />
    );

    if (enableDynamicMultimediaGrid) {
        if (gridMode === 'multimediaGrid') {
            grid = (
                <MultimediaGrid
                    {...args}
                    additionalComponent={additionalComponent}
                    refreshItems={(): void => {
                        action('MultimediaGrid: Refresh triggered')();
                        refresh();
                    }}
                    checkboxSelection={true}
                    disableSelectionOnClick={true}
                    slotProps={{
                        mediaCard: {
                            slotProps: {
                                checkbox: {
                                    showOnHover: true,
                                },
                            },
                        },
                    }}
                />
            );
        } else {
            grid = (
                <StoryRingDataGridWrapper
                    withContainer={false}
                    additionalComponent={additionalComponent}
                    refreshItems={(): void => {
                        action('RingDataGrid: Refresh triggered')();
                        refresh();
                    }}
                    labels={args.labels}
                    {...(gridProps as RingDataGridProps)}
                />
            );
        }
    } else if (enabledMultimediaGrid) {
        grid = (
            <MultimediaGrid
                {...args}
                refreshItems={(): void => {
                    action('MultimediaGrid: Refresh triggered')();
                    refresh();
                }}
                checkboxSelection={true}
                disableSelectionOnClick={true}
                slotProps={{
                    mediaCard: {
                        slotProps: {
                            checkbox: {
                                showOnHover: true,
                            },
                        },
                    },
                }}
            />
        );
    }

    return (
        <DataView
            sx={{ height: 'calc(100vh - 38px)' }}
            slots={{
                main: grid,
                left: disableFilter ? undefined : <Filter />,
                right: disableDetail ? undefined : (
                    <Detail
                        selectedMultimediaItem={selectedMultimediaItem}
                        detailData={detailData}
                        onCloseClick={(): void => {
                            action('Detail: Close clicked')();
                            setDetailOpen(false);
                        }}
                    />
                ),
            }}
            slotProps={{
                ...slotProps,
                top: {
                    ...slotProps.top,
                    defaultValue: '',
                    searchFunc: handleSearchChange,
                    openSlotsOnMobileLabels: {
                        rightSlot: 'Detail',
                        leftSlot: 'Filter',
                    },
                    children: searchBarChildren,
                    menuActions: searchBarMenuActions,
                } as TopSlotProps,
            }}
            rightSlotOpen={detailOpen}
            setRightSlotOpen={(open: boolean): void => {
                action('DataView: Right slot open state changed')(open);
                setDetailOpen(open);
            }}
            leftSlotOpen={filterOpen}
            setLeftSlotOpen={(open: boolean): void => {
                action('DataView: Left slot open state changed')(open);
                setFilterOpen(open);
            }}
            leftSlotWidth={leftSlotWidth}
            leftSlotDynamicWidth={{ enabled: filterDynamicWidth }}
        />
    );
};

function useMultimediaGridFiltering(enabled: boolean): {
    filteredItems: Record<string, unknown>[];
    loading: boolean;
    hasMore: boolean;
    isTestMode: boolean;
    totalCount: number;
    handleLoadMore: () => Promise<void>;
    handleSearchChange: (query: string) => void;
    refresh: () => void;
} {
    const [searchQuery, setSearchQuery] = useState('');
    const [isTestMode, setIsTestMode] = useState(false);

    const normalData = useMultimediaGridDemoData({
        initialCount: 30,
    });

    const testData = useMultimediaGridDemoData({
        initialCount: 30,
        testMode: true,
        loadingDelay: 1000,
    });

    const activeData = isTestMode ? testData : normalData;
    const { items: baseItems, loading, hasMore, nextData, totalCount, refresh } = activeData;

    React.useEffect(() => {
        if (!enabled) {
            return;
        }

        const newIsTestMode = searchQuery.toLowerCase() === 'test';

        if (newIsTestMode !== isTestMode) {
            setIsTestMode(newIsTestMode);
        }
    }, [searchQuery, isTestMode, enabled]);

    const [filteredItems, setFilteredItems] = React.useState<typeof baseItems>([]);

    React.useEffect(() => {
        if (!enabled || !baseItems) {
            return;
        }

        if (!searchQuery) {
            setFilteredItems(baseItems);
        } else if (isTestMode) {
            setFilteredItems(baseItems);
        } else {
            const filtered = baseItems.filter((item: Record<string, unknown>) =>
                (item as { title?: string }).title?.toLowerCase().includes(searchQuery.toLowerCase()),
            );
            setFilteredItems(filtered);
        }
    }, [baseItems, searchQuery, isTestMode, enabled]);

    const handleLoadMore = async (): Promise<void> => {
        const loadingMessage = isTestMode
            ? 'Loading more test items for infinite scroll testing...'
            : 'Loading more 30 items';
        action('MultimediaGrid: Load more triggered')(loadingMessage);
        await nextData(30);
    };

    const handleSearchChange = (query: string): void => {
        action('Story: Search query changed')(query);
        setSearchQuery(query);
    };

    return {
        filteredItems,
        loading,
        hasMore,
        isTestMode,
        totalCount,
        handleLoadMore,
        handleSearchChange,
        refresh,
    };
}
