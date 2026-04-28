import React from 'react';
import { Button } from '@mui/material';
import { LightBox } from '@ringpublishing/mui-components';
import { getImagePath, TestImage, ImageSize } from 'RingDemoImages';

export default function WithInitialImageIdExample(): React.JSX.Element {
    const [open, setOpen] = React.useState(false);
    const images = [
        {
            id: 'image-1',
            src: getImagePath(TestImage.MOUNTAINS, ImageSize.LARGE),
            thumbnailSrc: getImagePath(TestImage.MOUNTAINS, ImageSize.LARGE),
            title: TestImage.MOUNTAINS,
        },
        {
            id: 'image-2',
            src: getImagePath(TestImage.STAIRS, ImageSize.LARGE),
            thumbnailSrc: getImagePath(TestImage.STAIRS, ImageSize.LARGE),
            title: TestImage.STAIRS,
        },
        {
            id: 'image-3',
            src: getImagePath(TestImage.ISLAND, ImageSize.SMALL),
            thumbnailSrc: getImagePath(TestImage.ISLAND, ImageSize.SMALL),
            title: TestImage.ISLAND,
        },
        {
            id: 'image-4',
            src: getImagePath(TestImage.RIVER, ImageSize.LARGE),
            thumbnailSrc: getImagePath(TestImage.RIVER, ImageSize.LARGE),
            title: TestImage.RIVER,
        },
        {
            id: 'image-5',
            src: getImagePath(TestImage.FOREST_2, ImageSize.LARGE),
            thumbnailSrc: getImagePath(TestImage.FOREST_2, ImageSize.LARGE),
            title: TestImage.FOREST_2,
        },
        {
            id: 'image-6',
            src: getImagePath(TestImage.APARTMENT, ImageSize.MEDIUM),
            thumbnailSrc: getImagePath(TestImage.APARTMENT, ImageSize.MEDIUM),
            title: TestImage.APARTMENT,
        },
        {
            id: 'image-7',
            src: getImagePath(TestImage.CAR, ImageSize.LARGE),
            thumbnailSrc: getImagePath(TestImage.CAR, ImageSize.LARGE),
            title: TestImage.CAR,
        },
        {
            id: 'image-8',
            src: getImagePath(TestImage.ORCHARD, ImageSize.LARGE),
            thumbnailSrc: getImagePath(TestImage.ORCHARD, ImageSize.LARGE),
            title: TestImage.ORCHARD,
        },
    ];

    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <Button variant="outlined" color="primary" disableRipple={true} onClick={(): void => setOpen(true)}>
                Click me!
            </Button>
            <LightBox images={images} onClose={(): void => setOpen(false)} open={open} initialImageId="image-5" />
        </div>
    );
}
