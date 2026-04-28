import React, { useState } from 'react';
import {
    DataView,
    MultimediaGrid,
    useGridApiRef,
    useActiveCardChange,
    Detail,
    SplitButton,
    type MediaGridItemsProps,
    type MediaGridItemProps,
    type DetailProps,
} from '@ringpublishing/mui-components';
import type { GridRowId, GridRowSelectionModel } from '@mui/x-data-grid-pro';
import { getImagePath, TestImage, ImageSize } from 'RingDemoImages';

export default function WithBottomBarSelectionExample(): React.JSX.Element {
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
        },
    ];

    const [detailProps, setDetailProps] = useState<DetailProps | null>(null);
    const [detailOpen, setDetailOpen] = useState(false);
    const externalApiRef = useGridApiRef();
    const [rowSelectionModel, setRowSelectionModel] = useState<GridRowSelectionModel>({
        type: 'include',
        ids: new Set(),
    });

    useActiveCardChange(externalApiRef, ({ activeCardId }) => {
        if (activeCardId === null) {
            setDetailProps(null);
            return;
        }

        const item = externalApiRef.current?.getItem(activeCardId);
        setDetailProps({
            main: {
                title: { value: item?.title ?? '' },
                mediaProps: {
                    image: item?.image ?? '',
                    objectFit: 'cover',
                },
            },
        });
    });

    const selectableItems = items.filter((item): item is MediaGridItemProps => !('separator' in item));
    const selectableItemIds = selectableItems.map((item) => item.id as GridRowId);
    const isAllSelected = selectableItemIds.length > 0 && rowSelectionModel.ids.size === selectableItemIds.length;

    const handleSelectAll = (): void => {
        if (!externalApiRef.current) return;
        const selectionModel: GridRowSelectionModel = {
            type: 'include',
            ids: new Set(selectableItemIds),
        };
        externalApiRef.current.setSelectionModel(selectionModel);
        setRowSelectionModel(selectionModel);
    };

    const handleClearSelection = (): void => {
        if (!externalApiRef.current) return;
        externalApiRef.current.clearSelection();
        setRowSelectionModel({ type: 'include', ids: new Set() });
    };

    const detail = <Detail empty={detailProps === null} {...detailProps} />;

    return (
        <DataView
            sx={{ height: 'calc(100vh - 38px)' }}
            slots={{
                main: (
                    <MultimediaGrid
                        onSelectionModelChange={(newSelection) => setRowSelectionModel(newSelection)}
                        selectionModel={rowSelectionModel}
                        apiRef={externalApiRef}
                        items={items}
                        totalRowCount={items.length}
                        checkboxSelection={true}
                        disableSelectionOnClick={true}
                        slotProps={{
                            mediaCard: {
                                slotProps: {
                                    checkbox: { showOnHover: true },
                                },
                            },
                        }}
                    />
                ),
                right: detail,
            }}
            slotProps={{
                top: {
                    defaultValue: '',
                    searchFunc: (): void => {
                        /* noop */
                    },
                    openSlotsOnMobileLabels: {
                        rightSlot: 'Detail',
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
                    ],
                },
                bottom: {
                    labels: {
                        selected: 'selected',
                    },
                    showVisibilityToggle: true,
                    showImagePlaceholder: true,
                    fieldMap: {
                        name: 'title',
                        image: 'image',
                    },
                },
            }}
            rightSlotOpen={detailOpen}
            setRightSlotOpen={setDetailOpen}
        />
    );
}
