import React, { useState } from 'react';
import { DataView, MultimediaGrid, type MediaGridItemProps } from '@ringpublishing/mui-components';
import { getImagePath, TestImage, ImageSize } from 'RingDemoImages';

export default function WithSelectionModeExample(): React.JSX.Element {
    const [detailOpen, setDetailOpen] = useState(true);
    const [filterOpen, setFilterOpen] = useState(true);

    const items: MediaGridItemProps[] = [
        {
            id: '1',
            title: 'Sample Item 1',
            image: getImagePath(TestImage.ANIMAL, ImageSize.MEDIUM),
        },
        {
            id: '2',
            title: 'Sample Item 2',
            image: getImagePath(TestImage.BIRD, ImageSize.MEDIUM),
        },
        {
            id: '3',
            title: 'Sample Item 3',
            image: getImagePath(TestImage.FARM, ImageSize.MEDIUM),
        },
    ];

    const Filters = (): React.JSX.Element => (
        <div style={{ padding: '16px' }}>
            <h3>Filters</h3>
        </div>
    );

    const DetailPanel = (): React.JSX.Element => (
        <div style={{ padding: '16px' }}>
            <h3>Item Details</h3>
        </div>
    );

    return (
        <DataView
            sx={{ width: '100%', height: '500px' }}
            slots={{
                main: (
                    <MultimediaGrid
                        items={items}
                        totalRowCount={items.length}
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
                ),
                left: <Filters />,
                right: <DetailPanel />,
            }}
            slotProps={{
                top: {
                    defaultValue: '',
                    searchFunc: (): void => {
                        /* noop */
                    },
                    openSlotsOnMobileLabels: {
                        rightSlot: 'Detail',
                        leftSlot: 'Filters',
                    },
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
            leftSlotOpen={filterOpen}
            setLeftSlotOpen={setFilterOpen}
        />
    );
}
