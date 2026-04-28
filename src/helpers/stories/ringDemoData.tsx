import styled from '@emotion/styled';
import { action } from 'storybook/actions';
import { useCallback, useMemo, useState, useEffect, ReactNode } from 'react';
import { createSpacerItem, SpacerItem } from '../../components/Organisms/DataGrid/spacer.js';
import { StoriesData, storiesData, MetricsTypes } from './storiesData.js';
import { MediaCardProps } from '../../components/Organisms/MediaCard/MediaCard.js';
import { formatDate } from '../formatDate.js';
import { GridRowId } from '@mui/x-data-grid';
import { Box, ChipProps } from '@mui/material';
import { ChipsGroup } from '../../components/index.js';
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined';
import ZoomInOutlinedIcon from '@mui/icons-material/ZoomInOutlined';
import { range } from 'lodash';

export interface BaseItem {
    id: string;
    [key: string]: unknown;
}

interface SpacerConfig {
    index: number;
    spacerItem: SpacerItem;
}

interface GridHookConfig<T extends BaseItem, TSource = unknown> {
    initialCount?: number;
    loadingDelay?: number;
    spacers?: SpacerConfig[];
    defaultSelectionIndices?: number[];
    totalAvailableItems?: number;

    itemTransformer?: (item: T, index: number, allItems: T[]) => T;
    dataEnhancer?: (items: T[], config: GridHookConfig<T, TSource>) => T[];
    dataSource?: TSource[];
    dataMapper?: (sourceItem: TSource, index: number) => T;
    dataGenerator?: (startIndex: number, count: number) => T[];
}

interface UseDemoDataReturn<T extends BaseItem> {
    items: T[];
    loading: boolean;
    hasMore: boolean;
    getMoreData: (count?: number) => Promise<void>;
    nextData: (count?: number) => Promise<void>;
    refresh: () => void;
    totalCount: number;
    getItemIds: (count?: number) => GridRowId[];
    getFirstNItemIds: (count: number) => GridRowId[];
    getDefaultSelection: () => GridRowId[];
    getItemIdsByIndices: (indices: number[]) => GridRowId[];
}

const defaultDataGenerator = <T extends BaseItem>(startIndex: number, count: number): T[] => {
    return Array.from(
        { length: count },
        (unused, i) =>
            ({
                id: `item-${startIndex + i}`,
                title: `Item ${startIndex + i + 1}`,
                description: `Description for item ${startIndex + i + 1}`,
                createdAt: new Date(Date.now() - Math.random() * 10000000000).toISOString(),
            }) as unknown as T,
    );
};

const insertSpacers = <T extends BaseItem>(items: T[], spacers: SpacerConfig[] = [], currentLength = 0): T[] => {
    if (!spacers.length) {
        return items;
    }

    const result = [...items];

    const relevantSeparators = spacers.filter(
        ({ index }) => index >= currentLength && index < currentLength + items.length,
    );

    const sortedSeparators = [...relevantSeparators].sort((a, b) => b.index - a.index);

    sortedSeparators.forEach(({ index, spacerItem }) => {
        const relativeIndex = index - currentLength;

        if (relativeIndex >= 0 && relativeIndex <= result.length) {
            result.splice(relativeIndex, 0, spacerItem as unknown as T);
        }
    });

    return result;
};

const useDemoData = <TSource = unknown, T extends BaseItem = BaseItem>(
    config: GridHookConfig<T, TSource> = {},
): UseDemoDataReturn<T> => {
    const {
        initialCount = 20,
        loadingDelay = 1000,
        spacers = [],
        defaultSelectionIndices = [],
        totalAvailableItems: customTotalAvailableItems,
        itemTransformer,
        dataEnhancer,
        dataSource = storiesData,
        dataMapper,
        dataGenerator = defaultDataGenerator,
    } = config;

    const [items, setItems] = useState<T[]>([]);
    const [loading, setLoading] = useState(false);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [initialized, setInitialized] = useState(false);
    const isUsingDataSource = Boolean(dataSource && dataMapper);
    const totalAvailableItems =
        customTotalAvailableItems ?? (isUsingDataSource ? (dataSource as TSource[]).length : 1000);
    const processItems = useCallback(
        (rawItems: T[], allItems: T[] = []): T[] => {
            let processedItems = rawItems;

            if (itemTransformer) {
                processedItems = processedItems.map((item, index) => itemTransformer(item, index, allItems));
            }

            if (dataEnhancer) {
                processedItems = dataEnhancer(processedItems, config);
            }

            return processedItems;
        },
        [itemTransformer, dataEnhancer, config],
    );

    const loadData = useCallback(
        async (count: number, append = false, startIndex?: number) => {
            setLoading(true);

            try {
                if (loadingDelay > 0) {
                    await new Promise((resolve) => setTimeout(resolve, loadingDelay));
                }

                const indexToUse = startIndex !== undefined ? startIndex : currentIndex;
                let newItems: T[];

                if (isUsingDataSource) {
                    const sourceSlice = (dataSource as TSource[]).slice(indexToUse, indexToUse + count);
                    newItems = sourceSlice.map((sourceItem, index) =>
                        (dataMapper as (item: TSource, index: number) => T)(sourceItem, indexToUse + index),
                    );
                } else {
                    newItems = dataGenerator(indexToUse, count);
                }

                const processedNewItems = processItems(newItems);

                setItems((prevItems) => {
                    if (append) {
                        const newItemsWithSpacers = insertSpacers(processedNewItems, spacers, prevItems.length);

                        return [...prevItems, ...newItemsWithSpacers];
                    } else {
                        return insertSpacers(processedNewItems, spacers, 0);
                    }
                });

                if (startIndex !== undefined) {
                    setCurrentIndex(startIndex + count);
                } else {
                    setCurrentIndex((prev) => prev + count);
                }
            } finally {
                setLoading(false);
            }
        },
        [currentIndex, dataSource, dataMapper, dataGenerator, processItems, spacers, loadingDelay, isUsingDataSource],
    );

    useEffect(() => {
        if (!initialized) {
            loadData(initialCount);
            setInitialized(true);
        }
    }, [initialized, loadData, initialCount]);

    const getMoreData = useCallback(
        async (count = 10) => {
            if (!loading) {
                await loadData(count, true);
            }
        },
        [loading, loadData],
    );

    const nextData = useCallback(
        (count = 10) => {
            return getMoreData(count);
        },
        [getMoreData],
    );

    const refresh = useCallback(() => {
        loadData(initialCount, false, 0);
    }, [loadData, initialCount]);

    const hasMore = useMemo(() => {
        return currentIndex < totalAvailableItems;
    }, [currentIndex, totalAvailableItems]);

    const getItemIds = useCallback(
        (count?: number): GridRowId[] => {
            const itemsToProcess = count ? items.slice(0, count) : items;

            return itemsToProcess.map((item) => item.id);
        },
        [items],
    );

    const getFirstNItemIds = useCallback(
        (count: number): GridRowId[] => {
            return items.slice(0, count).map((item) => item.id);
        },
        [items],
    );

    const getDefaultSelection = useCallback((): GridRowId[] => {
        return defaultSelectionIndices.length > 0 && items.length > 0
            ? defaultSelectionIndices
                  .filter((index) => index >= 0 && index < items.length)
                  .map((index) => items[index].id)
            : [];
    }, [items, defaultSelectionIndices]);

    const getItemIdsByIndices = useCallback(
        (indices: number[]): GridRowId[] => {
            return indices.filter((index) => index >= 0 && index < items.length).map((index) => items[index].id);
        },
        [items],
    );

    return {
        items,
        loading,
        hasMore,
        getMoreData,
        nextData,
        refresh,
        totalCount: totalAvailableItems,
        getItemIds,
        getFirstNItemIds,
        getDefaultSelection,
        getItemIdsByIndices,
    };
};

export const sortableFields = [
    { name: 'Publication date', key: 'publicationDate', onSortingChange: action('onSortingChange') },
    { name: 'Created date', key: 'createdDate', onSortingChange: action('onSortingChange') },
];

interface MultimediaGridItem extends MediaCardProps, Pick<BaseItem, 'id'> {
    [key: string]: unknown;
}

interface MultimediaGridDemoConfig extends Partial<GridHookConfig<MultimediaGridItem, StoriesData>> {
    testMode?: boolean;
    addExampleChipsGroup?: boolean;
}

const Actions = styled.div({
    alignItems: 'flex-end',
    flexDirection: 'row',
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '4px',
});

export const MediaCardActions = (): ReactNode => {
    return (
        <Actions>
            <ZoomInOutlinedIcon />
            <FileDownloadOutlinedIcon />
        </Actions>
    );
};

const Container = styled.div({
    width: '100%',
    overflow: 'hidden',
    display: 'flex',
    justifyContent: 'space-between',
});

const randomColor = (): string => ['secondary', 'success', 'info'][Math.floor(Math.random() * 3)];
const randomLabel = (): string =>
    ['Lion', 'Cheetah', 'Tiger', 'Leopard', 'Jaguar', 'Panther', 'Puma', 'Lynx'][Math.floor(Math.random() * 8)];

export function MultimediaGridChipsGroups(): ReactNode {
    const exampleChips: ChipProps[] = range(8).map(() => {
        const label = randomLabel();

        return {
            label,
            onClick: (): void => action(`Click ${label}`)(),
            color: randomColor(),
        } as ChipProps;
    });

    return <ChipsGroup chips={exampleChips} />;
}

const MediaCardFooterWithChipsGroup = (
    <Container>
        <Box sx={{ width: '80%' }}>{MultimediaGridChipsGroups()}</Box>
        <Box sx={{ width: '20%' }}>
            <MediaCardActions />
        </Box>
    </Container>
);

export const useMultimediaGridDemoData = (config?: MultimediaGridDemoConfig): UseDemoDataReturn<MultimediaGridItem> => {
    const { testMode = false, addExampleChipsGroup = false, ...restConfig } = config || {};

    if (testMode) {
        const originalTestItems = storiesData.filter((story) => story.title.toLowerCase().includes('test'));
        const originalTestCount = originalTestItems.length;
        const maxGeneratedItems = 200 - originalTestCount;
        const totalTestItems = originalTestCount + maxGeneratedItems;

        return useDemoData<StoriesData, MultimediaGridItem>({
            initialCount: 5,
            loadingDelay: restConfig.loadingDelay ?? 1000,
            totalAvailableItems: totalTestItems,
            dataSource: [],
            dataGenerator: (startIndex: number, count: number): MultimediaGridItem[] => {
                if (startIndex === 0) {
                    const testItemsToLoad = originalTestItems
                        .slice(0, Math.min(originalTestItems.length, count))
                        .map((data: StoriesData): MultimediaGridItem => {
                            const storyData = data;
                            const workflowColor = storyData.workflowStage?.color || '#666';
                            const editorialScore = storyData.metrics?.editorialScore || 0;
                            const itemId = `story-${storyData.id}`;
                            const slots = addExampleChipsGroup ? { footer: MediaCardFooterWithChipsGroup } : {};

                            return {
                                id: itemId,
                                image: storyData.image || undefined,
                                title: storyData.title,
                                ratio: '16/9' as const,
                                square: false,
                                focusable: true,
                                slots,
                                fields: [
                                    { value: `Editorial Score: ${editorialScore}` },
                                    {
                                        value: `Modified: ${new Date(storyData.modificationTime).toLocaleDateString('pl-PL')}`,
                                    },
                                    { value: `Author: ${storyData.author || 'Unknown'}` },
                                    { value: `Source: ${storyData.source || 'Unknown'}` },
                                ],
                                statusLabels: [
                                    {
                                        label: storyData.workflowStage?.name || 'Draft',
                                        color: workflowColor === '#04A03C' ? 'success' : 'default',
                                    },
                                ],
                                actions: [
                                    {
                                        label: 'View',
                                        onClick: (): void => action('view-item')(storyData.id),
                                    },
                                    {
                                        label: 'Edit',
                                        onClick: (): void => action('edit-item')(storyData.id),
                                    },
                                ],
                            };
                        });

                    const remainingCount = count - testItemsToLoad.length;

                    if (remainingCount > 0) {
                        const generatedItems = Array.from({ length: remainingCount }, (unused, i) => {
                            const itemIndex = originalTestCount + i;
                            const generatedIndex = i + 1;
                            const categories = ['technology', 'business', 'sport', 'science', 'lifestyle', 'travel'];
                            const category = categories[generatedIndex % categories.length];

                            return {
                                id: `test-generated-${itemIndex}`,
                                title: `Test Article ${generatedIndex} - ${category}`,
                                image: `https://picsum.photos/400/300?random=${itemIndex + 1000}`,
                                ratio: '16/9' as const,
                                square: false,
                                focusable: true,
                                fields: [
                                    { value: `Category: ${category}` },
                                    {
                                        value: `Created: ${new Date(Date.now() - itemIndex * 60000).toLocaleDateString('pl-PL')}`,
                                    },
                                    { value: `Author: Test Author ${(generatedIndex % 10) + 1}` },
                                    { value: `Views: ${Math.floor(Math.random() * 10000)}` },
                                ],
                                statusLabels: [
                                    {
                                        label: generatedIndex % 3 === 0 ? 'Published' : 'Draft',
                                        color: generatedIndex % 3 === 0 ? ('success' as const) : ('default' as const),
                                    },
                                ],
                                actions: [
                                    {
                                        label: 'View',
                                        onClick: (): void => action('view-test-item')(itemIndex),
                                    },
                                    {
                                        label: 'Edit',
                                        onClick: (): void => action('edit-test-item')(itemIndex),
                                    },
                                ],
                            };
                        });

                        return [...testItemsToLoad, ...generatedItems];
                    }

                    return testItemsToLoad;
                }

                return Array.from({ length: count }, (unused, i) => {
                    const itemIndex = startIndex + i;
                    const generatedIndex = itemIndex - originalTestCount + 1;
                    const categories = ['technology', 'business', 'sport', 'science', 'lifestyle', 'travel'];
                    const category = categories[(generatedIndex - 1) % categories.length];

                    return {
                        id: `test-generated-${itemIndex}`,
                        title: `Test Article ${generatedIndex} - ${category}`,
                        image: `https://picsum.photos/400/300?random=${itemIndex + 1000}`,
                        ratio: '16/9' as const,
                        square: false,
                        focusable: true,
                        fields: [
                            { value: `Category: ${category}` },
                            {
                                value: `Created: ${new Date(Date.now() - itemIndex * 60000).toLocaleDateString('pl-PL')}`,
                            },
                            { value: `Author: Test Author ${(generatedIndex % 10) + 1}` },
                            { value: `Views: ${Math.floor(Math.random() * 10000)}` },
                        ],
                        statusLabels: [
                            {
                                label: generatedIndex % 3 === 0 ? 'Published' : 'Draft',
                                color: generatedIndex % 3 === 0 ? ('success' as const) : ('default' as const),
                            },
                        ],
                        actions: [
                            {
                                label: 'View',
                                onClick: (): void => action('view-test-item')(itemIndex),
                            },
                            {
                                label: 'Edit',
                                onClick: (): void => action('edit-test-item')(itemIndex),
                            },
                        ],
                    };
                });
            },
            ...restConfig,
        });
    }

    return useDemoData<StoriesData, MultimediaGridItem>({
        initialCount: 120,
        loadingDelay: 1000,
        dataMapper: (data: StoriesData): MultimediaGridItem => {
            const storyData = data;

            const workflowColor = storyData.workflowStage?.color || '#666';
            const editorialScore = storyData.metrics?.editorialScore || 0;
            const itemId = `story-${storyData.id}`;
            const slots = addExampleChipsGroup ? { footer: MediaCardFooterWithChipsGroup } : {};

            return {
                id: itemId,
                image: storyData.image || undefined,
                title: storyData.title,
                ratio: '16/9' as const,
                square: false,
                focusable: true,
                slots,
                fields: [
                    { value: `Editorial Score: ${editorialScore}` },
                    { value: `Modified: ${new Date(storyData.modificationTime).toLocaleDateString('pl-PL')}` },
                    { value: `Author: ${storyData.author || 'Unknown'}` },
                    { value: `Source: ${storyData.source || 'Unknown'}` },
                ],
                statusLabels: [
                    {
                        label: storyData.workflowStage?.name || 'Draft',
                        color: workflowColor === '#04A03C' ? 'success' : 'default',
                    },
                ],
                actions: [
                    {
                        label: 'View',
                        onClick: (): void => action('view-item')(storyData.id),
                    },
                    {
                        label: 'Edit',
                        onClick: (): void => action('edit-item')(storyData.id),
                    },
                ],
            };
        },
        spacers: [
            {
                index: 3,
                spacerItem: createSpacerItem({
                    title: 'First content',
                    color: 'primary',
                    id: 'first-content',
                }),
            },
            {
                index: 15,
                spacerItem: createSpacerItem({
                    title: 'More content',
                    color: 'secondary',
                    id: 'more-content',
                }),
            },
            {
                index: 25,
                spacerItem: createSpacerItem({
                    title: 'Additional content',
                    color: 'success',
                    id: 'additional-content',
                }),
            },
        ],
        ...config,
    });
};

// Hook dla RingDataGrid - analogiczny do useMultimediaGridDemoData
interface RingDataGridItem extends BaseItem {
    title: {
        label: string;
        caption: string;
        imageUrl: string;
        showPlaceholder: boolean;
    };
    date: string;
    author: string;
    source: string;
    flags: string[];
    stage: {
        name: string;
        color: string;
    };
    status: string;
    actions: unknown[];
    charactersCount: number | null;
    wordCount: number | null;
    editorialScore: number | null;
    tagsCount: number | null;
    topicsCount: number | null;
}

export const useRingDataGridDemoData = (
    config?: Partial<GridHookConfig<RingDataGridItem, StoriesData>>,
): UseDemoDataReturn<RingDataGridItem> => {
    return useDemoData<StoriesData, RingDataGridItem>({
        initialCount: 120,
        loadingDelay: 1000,
        dataMapper: (story: StoriesData): RingDataGridItem => {
            const metrics = (Object.values(MetricsTypes) as MetricsTypes[]).reduce(
                (acc, metric) => {
                    acc[metric] = story.metrics[metric];

                    return acc;
                },
                {} as Record<MetricsTypes, number | null>,
            );

            return {
                id: story.id,
                title: {
                    label: story.title,
                    caption: story.kind || '',
                    imageUrl: story.image || '',
                    showPlaceholder: true,
                },
                date: formatDate(story.modificationTime),
                author: story.author || '',
                source: story.source || '',
                flags: story.flags,
                stage: story.workflowStage,
                status: story.status,
                actions: [
                    {
                        label: 'View',
                        onClick: (): void => action('view-item')(story.id),
                    },
                    {
                        label: 'Edit',
                        onClick: (): void => action('edit-item')(story.id),
                    },
                ],
                ...metrics,
            };
        },
        ...config,
    });
};
