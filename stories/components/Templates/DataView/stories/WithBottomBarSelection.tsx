import React, { useState } from 'react';
import type { StoryObj, Meta } from '@storybook/react-vite';
import type { GridRowId } from '@mui/x-data-grid';
import type { GridRowSelectionModel } from '@mui/x-data-grid-pro';
import {
    Users,
    Share2,
    Bookmark,
    Eye,
    ChartColumn,
    Ellipsis,
    Columns2,
    Images,
    ShoppingCart,
    Play,
    Film,
} from 'lucide-react';

import { createCodeStory } from '../../../../helpers.js';
import customCode from './code/WithBottomBarSelectionExample.tsx?raw';
import {
    type BottomBarApiRef,
    DataView,
    type DataViewProps,
    type TopSlotProps,
    Detail,
    DetailProps,
    SplitButton,
} from '../../../../../src/index.js';
import {
    MediaGridItemProps,
    MediaGridItemsProps,
    MultimediaGrid,
    useActiveCardChange,
    useGridApiRef,
} from '../../../../../src/components/Organisms/MultimediaGrid/MultimediaGrid.js';
import { DefaultDataViewArgs, searchBarChildren } from '../common/defaultArgs.js';

import { getImagePath, TestImage, ImageSize } from '../../../../helpers/imagesData.js';

type DataViewMeta = Meta<typeof DataView>;

const Example = (args: Partial<DataViewProps>): React.JSX.Element => {
    // Sample media items for demonstrating BottomBar selection
    const items: MediaGridItemsProps = [
        {
            id: 0,
            title: 'Breaking News: Election Results',
            image: getImagePath(TestImage.RIVER, ImageSize.LARGE),
            fields: [
                { value: 'Politics Desk' },
                { value: 'Key results of the 2024 local elections' },
                { value: '15 minutes ago' },
            ],
            statusLabels: [
                {
                    label: 'BREAKING',
                    color: 'error',
                    key: 'breaking-news',
                },
                {
                    label: 'LIVE',
                    color: 'success',
                    key: 'live-coverage',
                },
            ],
            actions: [
                { label: 'Share', icon: <Share2 /> },
                { label: 'Save', icon: <Bookmark /> },
            ],
        },
        {
            id: 1,
            title: 'An interview with an economist',
            image: getImagePath(TestImage.PEOPLE, ImageSize.MEDIUM),
            fields: [
                { value: 'Anna Kowalska' },
                { value: 'Analysis of the property market' },
                { value: '2 hours ago' },
            ],
            statusLabels: [
                {
                    label: 'PREMIUM',
                    color: 'warning',
                    key: 'premium-content',
                },
            ],
        },
        {
            id: 2,
            title: 'Match report: Poland vs Germany',
            image: getImagePath(TestImage.CAMERA, ImageSize.MEDIUM),
            fields: [
                { value: 'Sport24' },
                { value: 'A dramatic match decided in extra time' },
                { value: '4 hours ago' },
            ],
            statusLabels: [
                {
                    label: 'RESULTS',
                    color: 'primary',
                    key: 'match-results',
                },
            ],
            actions: [
                { label: 'See more', icon: <Eye /> },
                { label: 'Statistics', icon: <ChartColumn /> },
            ],
        },
        {
            id: 'spacer-trending',
            separator: {
                title: 'Most Popular Today',
                color: 'primary',
                icon: <Users />,
            },
        },
        {
            id: 4,
            title: 'Reviewing the new iPhone 15',
            image: getImagePath(TestImage.APARTMENT, ImageSize.LARGE),
            fields: [
                { value: 'Technology desk' },
                { value: 'A full review of the newest Apple smartphone' },
                { value: '6 hours ago' },
            ],
            statusLabels: [
                {
                    label: 'REVIEW',
                    color: 'info',
                    key: 'review-content',
                },
                {
                    label: 'RATING: 8/10',
                    color: 'success',
                    key: 'rating',
                    showOnHover: true,
                },
            ],
            actions: [
                { label: 'Read more', icon: <Ellipsis /> },
                { label: 'Compare', icon: <Columns2 /> },
            ],
        },
        {
            id: 5,
            title: 'Behind the scenes of the series',
            image: getImagePath(TestImage.LIVING_ROOM, ImageSize.MEDIUM),
            fields: [
                { value: 'Culture Magazine' },
                { value: 'Exclusive photos from the set of the new series' },
                { value: '8 hours ago' },
            ],
            statusLabels: [
                {
                    label: 'EXCLUSIVE',
                    color: 'secondary',
                    key: 'exclusive-content',
                },
            ],
        },
        {
            id: 6,
            title: 'Weekend weather forecast',
            image: getImagePath(TestImage.MOUNTAINS, ImageSize.MEDIUM),
            fields: [{ value: 'Weather Desk' }, { value: 'A sunny weekend, up to 25°C' }, { value: '1 day ago' }],
            statusLabels: [
                {
                    label: 'WEATHER',
                    color: 'info',
                    key: 'weather-forecast',
                },
            ],
        },
        {
            id: 7,
            title: 'New fashion trends for 2024',
            image: getImagePath(TestImage.PEOPLE_2, ImageSize.MEDIUM),
            fields: [
                { value: 'Lifestyle & Fashion' },
                { value: 'What will be in style next season?' },
                { value: '1 day ago' },
            ],
            statusLabels: [
                {
                    label: 'TRENDS',
                    color: 'warning',
                    key: 'fashion-trends',
                },
            ],
            actions: [
                { label: 'Gallery', icon: <Images /> },
                { label: 'Buy now', icon: <ShoppingCart /> },
            ],
        },
        {
            id: 8,
            title: 'An investment guide',
            image: getImagePath(TestImage.FARM, ImageSize.MEDIUM),
            fields: [{ value: 'Personal Finance' }, { value: 'How to invest safely in 2024' }, { value: '2 days ago' }],
            statusLabels: [
                {
                    label: 'GUIDE',
                    color: 'success',
                    key: 'financial-guide',
                },
                {
                    label: 'VERIFIED',
                    color: 'primary',
                    key: 'verified-content',
                    showOnHover: true,
                },
            ],
        },
        {
            id: 9,
            title: 'The "Dune 3" premiere',
            image: getImagePath(TestImage.DESERT, ImageSize.MEDIUM),
            fields: [
                { value: 'Film & Cinema' },
                { value: 'The long-awaited sequel to the science-fiction saga' },
                { value: '3 days ago' },
            ],
            statusLabels: [
                {
                    label: 'PREMIERE',
                    color: 'error',
                    key: 'movie-premiere',
                },
            ],
            actions: [
                { label: 'Trailer', icon: <Play /> },
                { label: 'Buy tickets', icon: <Film /> },
            ],
        },
        {
            id: 10,
            title: 'A recipe for homemade pizza',
            image: getImagePath(TestImage.KITCHEN, ImageSize.MEDIUM),
            fields: [
                { value: 'Kuchnia & Przepisy' },
                { value: 'Krok po kroku do idealnej pizzy w domu' },
                { value: '4 days ago' },
            ],
            statusLabels: [
                {
                    label: 'RECIPE',
                    color: 'success',
                    key: 'recipe-content',
                },
                {
                    label: '30 MIN',
                    color: 'info',
                    key: 'cooking-time',
                },
            ],
        },
    ];

    // State for detail panel
    const [detailProps, setDetailProps] = React.useState<DetailProps | null>(null);

    // Create API ref for grid control
    const externalApiRef = useGridApiRef();

    // Listen to card activation to show detail panel
    useActiveCardChange(externalApiRef, ({ activeCardId }): void => {
        if (activeCardId === null) {
            setDetailProps(null);

            return;
        }

        const item = externalApiRef.current?.getItem(activeCardId);
        setDetailProps({
            main: {
                title: {
                    value: item?.title ?? '',
                },
                mediaProps: {
                    image: item?.image ?? '',
                    objectFit: 'cover',
                },
            },
        });
    });

    const detail = <Detail empty={detailProps === null} {...detailProps} />;
    const [detailOpen, setDetailOpen] = useState(false);
    const [rowSelectionModel, setRowSelectionModel] = useState<GridRowSelectionModel>({
        type: 'include',
        ids: new Set(),
    });

    const selectableItems = items.filter((item): item is MediaGridItemProps => !('separator' in item));
    const selectableItemIds = selectableItems.map((item) => item.id as GridRowId);
    const isAllSelected = selectableItemIds.length > 0 && rowSelectionModel.ids.size === selectableItemIds.length;

    const handleSelectAll = (): void => {
        if (!externalApiRef.current) {
            return;
        }

        const selectionModel: GridRowSelectionModel = { type: 'include', ids: new Set(selectableItemIds) };

        externalApiRef.current.setSelectionModel(selectionModel);
        setRowSelectionModel(selectionModel);
    };

    const handleClearSelection = (): void => {
        if (!externalApiRef.current) {
            return;
        }

        externalApiRef.current.clearSelection();
        setRowSelectionModel({ type: 'include', ids: new Set() });
    };

    const grid = (
        <MultimediaGrid
            onSelectionModelChange={(newSelection): void => {
                setRowSelectionModel(newSelection);
            }}
            selectionModel={rowSelectionModel}
            apiRef={externalApiRef}
            items={items}
            totalRowCount={items.length}
            // Enable checkbox selection mode
            checkboxSelection={true}
            // Disable selection on card click (only checkbox works)
            disableSelectionOnClick={true}
            slotProps={{
                mediaCard: {
                    slotProps: {
                        checkbox: {
                            // Show checkbox only on hover
                            showOnHover: true,
                        },
                    },
                },
            }}
        />
    );

    return (
        <DataView
            sx={{ height: 'calc(100vh - 38px)' }}
            {...args}
            slots={{
                main: grid,
                right: detail,
            }}
            rightSlotOpen={detailOpen}
            setRightSlotOpen={setDetailOpen}
            slotProps={{
                ...args.slotProps,
                top: {
                    ...args.slotProps?.top,
                    defaultValue: '',
                    searchFunc: (): void => {
                        /* noop */
                    },
                    children: [
                        <SplitButton
                            key="selection-actions"
                            variant="contained"
                            size="small"
                            actions={[
                                {
                                    label: 'Select all',
                                    onClick: handleSelectAll,
                                    disabled: isAllSelected,
                                },
                                {
                                    label: 'Clear selection',
                                    onClick: handleClearSelection,
                                    disabled: rowSelectionModel.ids.size === 0,
                                },
                            ]}
                        />,
                        ...((args.slotProps?.top?.children ?? searchBarChildren) as React.JSX.Element[]),
                    ],
                } as TopSlotProps,
            }}
        />
    );
};

export const WithBottomBarSelection: StoryObj<DataViewMeta> = {
    args: {
        ...DefaultDataViewArgs,
        slotProps: {
            bottom: {
                labels: {
                    selected: 'selected',
                    show: undefined,
                    hide: undefined,
                },
                showVisibilityToggle: true,
                showImagePlaceholder: true,
                fieldMap: {
                    name: 'title',
                    image: 'image',
                },
                getTooltip: (row: Record<string, unknown>): React.ReactNode => {
                    const fields = (row.fields as { value: string }[] | undefined) ?? [];

                    return (
                        <>
                            <strong>{row.title as string}</strong>
                            {fields[0] && (
                                <>
                                    <br />
                                    {fields[0].value}
                                </>
                            )}
                            {fields[2] && (
                                <>
                                    <br />
                                    {fields[2].value}
                                </>
                            )}
                        </>
                    );
                },
                onClick: (item: Record<string, unknown>, apiRef: BottomBarApiRef): void => {
                    if (apiRef && 'current' in apiRef && apiRef.current && 'setActiveCardId' in apiRef.current) {
                        apiRef.current.setActiveCardId(item.id as GridRowId);
                    }
                },
            },
        },
    },
    render: (args, context) => {
        return createCodeStory({
            context,
            customProps: {},
            customCode,
            example: <Example {...args} />,
        });
    },
};
