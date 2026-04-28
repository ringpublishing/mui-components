import React, { useState } from 'react';
import {
    DataView,
    MultimediaGrid,
    Detail,
    useGridApiRef,
    useActiveCardChange,
    type MediaGridItemsProps,
    type DetailProps,
} from '@ringpublishing/mui-components';
import { getImagePath, TestImage, ImageSize } from 'RingDemoImages';

export default function WithMultimediaGridExample(): React.JSX.Element {
    const [detailProps, setDetailProps] = useState<DetailProps | null>(null);
    const externalApiRef = useGridApiRef();

    const items: MediaGridItemsProps = [
        {
            id: 0,
            title: 'Breaking News',
            image: getImagePath(TestImage.RIVER, ImageSize.LARGE),
            fields: [{ value: 'News' }, { value: '15 minutes ago' }],
        },
        {
            id: 1,
            title: 'Technology Review',
            image: getImagePath(TestImage.APARTMENT, ImageSize.MEDIUM),
            fields: [{ value: 'Tech' }, { value: '2 hours ago' }],
        },
        {
            id: 2,
            title: 'Sports Update',
            image: getImagePath(TestImage.CAMERA, ImageSize.MEDIUM),
            fields: [{ value: 'Sports' }, { value: '4 hours ago' }],
        },
    ];

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

    return (
        <DataView
            sx={{ height: 'calc(100vh - 38px)' }}
            slots={{
                main: (
                    <MultimediaGrid
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
                right: <Detail empty={detailProps === null} {...detailProps} />,
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
                },
            }}
            rightSlotOpen={false}
        />
    );
}
