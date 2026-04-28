import React, { useState } from 'react';
import type { StoryObj, Meta } from '@storybook/react-vite';
import type { GridRowId } from '@mui/x-data-grid';
import type { GridRowSelectionModel } from '@mui/x-data-grid-pro';
import {
    People,
    Share,
    Bookmark,
    Visibility,
    Assessment,
    ReadMore,
    Compare,
    PhotoLibrary,
    ShoppingCart,
    PlayArrow,
    LocalMovies,
} from '@mui/icons-material';

import { createCodeStory } from '../../../../helpers.js';
import customCode from './code/WithBottomBarSelectionExample.tsx?raw';
import {
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
import { BottomBarContextState } from '../../../../../src/components/internal/BottomBar/BottomBarContext.js';
import { DefaultDataViewArgs, searchBarChildren } from '../common/defaultArgs.js';

import { getImagePath, TestImage, ImageSize } from '../../../../../src/helpers/stories/imagesData.js';

type DataViewMeta = Meta<typeof DataView>;

const Example = (args: Partial<DataViewProps>): React.JSX.Element => {
    // Sample media items for demonstrating BottomBar selection
    const items: MediaGridItemsProps = [
        {
            id: 0,
            title: 'Breaking News: Election Results',
            image: getImagePath(TestImage.RIVER, ImageSize.LARGE),
            fields: [
                { value: 'Redakcja Polityczna' },
                { value: 'Najważniejsze wyniki wyborów samorządowych 2024' },
                { value: '15 minut temu' },
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
                { label: 'Udostępnij', icon: <Share fontSize="small" /> },
                { label: 'Zapisz', icon: <Bookmark fontSize="small" /> },
            ],
        },
        {
            id: 1,
            title: 'Wywiad z ekspertem ekonomicznym',
            image: getImagePath(TestImage.PEOPLE, ImageSize.MEDIUM),
            fields: [
                { value: 'Anna Kowalska' },
                { value: 'Analiza sytuacji na rynku nieruchomości' },
                { value: '2 godziny temu' },
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
            title: 'Relacja z meczu Polska - Niemcy',
            image: getImagePath(TestImage.CAMERA, ImageSize.MEDIUM),
            fields: [
                { value: 'Sport24' },
                { value: 'Dramatyczny mecz zakończony w dogrywce' },
                { value: '4 godziny temu' },
            ],
            statusLabels: [
                {
                    label: 'WYNIKI',
                    color: 'primary',
                    key: 'match-results',
                },
            ],
            actions: [
                { label: 'Zobacz więcej', icon: <Visibility fontSize="small" /> },
                { label: 'Statystyki', icon: <Assessment fontSize="small" /> },
            ],
        },
        {
            id: 'spacer-trending',
            separator: {
                title: 'Most Popular Today',
                color: 'primary',
                icon: <People fontSize="small" />,
            },
        },
        {
            id: 4,
            title: 'Recenzja nowego iPhone 15',
            image: getImagePath(TestImage.APARTMENT, ImageSize.LARGE),
            fields: [
                { value: 'Dział Technologii' },
                { value: 'Pełna recenzja najnowszego smartfona Apple' },
                { value: '6 godzin temu' },
            ],
            statusLabels: [
                {
                    label: 'RECENZJA',
                    color: 'info',
                    key: 'review-content',
                },
                {
                    label: 'OCENA: 8/10',
                    color: 'success',
                    key: 'rating',
                    showOnHover: true,
                },
            ],
            actions: [
                { label: 'Czytaj więcej', icon: <ReadMore fontSize="small" /> },
                { label: 'Porównaj', icon: <Compare fontSize="small" /> },
            ],
        },
        {
            id: 5,
            title: 'Kulisy nagrywania serialu',
            image: getImagePath(TestImage.LIVING_ROOM, ImageSize.MEDIUM),
            fields: [
                { value: 'Magazyn Kulturalny' },
                { value: 'Ekskluzywne zdjęcia z planu najnowszego serialu' },
                { value: '8 godzin temu' },
            ],
            statusLabels: [
                {
                    label: 'EKSKLUZYWNE',
                    color: 'secondary',
                    key: 'exclusive-content',
                },
            ],
        },
        {
            id: 6,
            title: 'Prognoza pogody na weekend',
            image: getImagePath(TestImage.MOUNTAINS, ImageSize.MEDIUM),
            fields: [
                { value: 'Meteorologia' },
                { value: 'Słoneczny weekend z temperaturą do 25°C' },
                { value: '1 dzień temu' },
            ],
            statusLabels: [
                {
                    label: 'POGODA',
                    color: 'info',
                    key: 'weather-forecast',
                },
            ],
        },
        {
            id: 7,
            title: 'Nowe trendy w modzie 2024',
            image: getImagePath(TestImage.PEOPLE_2, ImageSize.MEDIUM),
            fields: [
                { value: 'Lifestyle & Moda' },
                { value: 'Co będzie modne w nadchodzącym sezonie?' },
                { value: '1 dzień temu' },
            ],
            statusLabels: [
                {
                    label: 'TRENDY',
                    color: 'warning',
                    key: 'fashion-trends',
                },
            ],
            actions: [
                { label: 'Galeria', icon: <PhotoLibrary fontSize="small" /> },
                { label: 'Kup teraz', icon: <ShoppingCart fontSize="small" /> },
            ],
        },
        {
            id: 8,
            title: 'Poradnik inwestycyjny',
            image: getImagePath(TestImage.FARM, ImageSize.MEDIUM),
            fields: [
                { value: 'Finanse Osobiste' },
                { value: 'Jak bezpiecznie inwestować w 2024 roku' },
                { value: '2 dni temu' },
            ],
            statusLabels: [
                {
                    label: 'PORADNIK',
                    color: 'success',
                    key: 'financial-guide',
                },
                {
                    label: 'SPRAWDZONE',
                    color: 'primary',
                    key: 'verified-content',
                    showOnHover: true,
                },
            ],
        },
        {
            id: 9,
            title: 'Premiera filmu "Dune 3"',
            image: getImagePath(TestImage.DESERT, ImageSize.MEDIUM),
            fields: [
                { value: 'Kino i Film' },
                { value: 'Długo wyczekiwana kontynuacja sagi science-fiction' },
                { value: '3 dni temu' },
            ],
            statusLabels: [
                {
                    label: 'PREMIERA',
                    color: 'error',
                    key: 'movie-premiere',
                },
            ],
            actions: [
                { label: 'Zwiastun', icon: <PlayArrow fontSize="small" /> },
                { label: 'Kup bilety', icon: <LocalMovies fontSize="small" /> },
            ],
        },
        {
            id: 10,
            title: 'Przepis na domową pizzę',
            image: getImagePath(TestImage.KITCHEN, ImageSize.MEDIUM),
            fields: [
                { value: 'Kuchnia & Przepisy' },
                { value: 'Krok po kroku do idealnej pizzy w domu' },
                { value: '4 dni temu' },
            ],
            statusLabels: [
                {
                    label: 'PRZEPIS',
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
                onClick: (item: Record<string, unknown>, apiRef: BottomBarContextState['apiRef']): void => {
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
