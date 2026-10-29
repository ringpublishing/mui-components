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
                { value: 'Politics Desk' },
                { value: 'Key results of the 2024 local elections' },
                { value: '15 minutes ago' },
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
                        onSelectionModelChange={(newSelection): void => setRowSelectionModel(newSelection)}
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
                    // custom multiline tooltip per selected item; falls back to the label when omitted
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
                            </>
                        );
                    },
                },
            }}
            rightSlotOpen={detailOpen}
            setRightSlotOpen={setDetailOpen}
        />
    );
}
