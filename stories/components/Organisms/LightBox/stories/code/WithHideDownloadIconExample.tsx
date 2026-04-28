import React from 'react';
import { Button } from '@mui/material';
import { LightBox } from '@ringpublishing/mui-components';
import { getImagePath, TestImage, ImageSize } from 'RingDemoImages';

export default function WithHideDownloadIconExample(): React.JSX.Element {
    const [open, setOpen] = React.useState(false);
    const images = [
        {
            src: getImagePath(TestImage.MOUNTAINS, ImageSize.LARGE),
            thumbnailSrc: getImagePath(TestImage.MOUNTAINS, ImageSize.LARGE),
            title: TestImage.MOUNTAINS,
        },
        {
            src: getImagePath(TestImage.STAIRS, ImageSize.LARGE),
            thumbnailSrc: getImagePath(TestImage.STAIRS, ImageSize.LARGE),
            title: TestImage.STAIRS,
        },
        {
            src: getImagePath(TestImage.ISLAND, ImageSize.SMALL),
            thumbnailSrc: getImagePath(TestImage.ISLAND, ImageSize.SMALL),
            title: TestImage.ISLAND,
        },
        {
            src: getImagePath(TestImage.RIVER, ImageSize.LARGE),
            thumbnailSrc: getImagePath(TestImage.RIVER, ImageSize.LARGE),
            title: TestImage.RIVER,
        },
    ];

    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <Button variant="outlined" color="primary" disableRipple={true} onClick={(): void => setOpen(true)}>
                Click me!
            </Button>
            <LightBox images={images} enableDownloadIcon={false} onClose={(): void => setOpen(false)} open={open} />
        </div>
    );
}
