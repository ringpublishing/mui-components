import React from 'react';
import { Button } from '@mui/material';
import { LightBox, Image } from '@ringpublishing/mui-components';
import { getImagePath, TestImage, ImageSize, getRandomImage, getRandomImageSize } from 'RingDemoImages';

function generateImages(count: number): Image[] {
    return Array.from({ length: count }, (): Image => {
        const image = getRandomImage();
        const size = getRandomImageSize();

        return {
            src: getImagePath(image, size),
            thumbnailSrc: getImagePath(image, size),
            title: image,
        };
    });
}

export default function WithInfiniteScrollExample(): React.JSX.Element {
    const [open, setOpen] = React.useState(false);
    const [currentImages, setCurrentImages] = React.useState<Image[]>([
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
        {
            src: getImagePath(TestImage.FOREST_2, ImageSize.LARGE),
            thumbnailSrc: getImagePath(TestImage.FOREST_2, ImageSize.LARGE),
            title: TestImage.FOREST_2,
        },
        {
            src: getImagePath(TestImage.APARTMENT, ImageSize.MEDIUM),
            thumbnailSrc: getImagePath(TestImage.APARTMENT, ImageSize.MEDIUM),
            title: TestImage.APARTMENT,
        },
        {
            src: getImagePath(TestImage.CAR, ImageSize.LARGE),
            thumbnailSrc: getImagePath(TestImage.CAR, ImageSize.LARGE),
            title: TestImage.CAR,
        },
        {
            src: getImagePath(TestImage.ORCHARD, ImageSize.LARGE),
            thumbnailSrc: getImagePath(TestImage.ORCHARD, ImageSize.LARGE),
            title: TestImage.ORCHARD,
        },
    ]);
    const [moreImagesLoading, setMoreImagesLoading] = React.useState(false);

    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <Button variant="outlined" color="primary" disableRipple={true} onClick={(): void => setOpen(true)}>
                Click me!
            </Button>
            <LightBox
                images={currentImages}
                onClose={(): void => setOpen(false)}
                open={open}
                moreImagesLoading={moreImagesLoading}
                onImagesScrollEnd={(): void => {
                    setMoreImagesLoading(true);
                    setTimeout((): void => {
                        const newImages = generateImages(currentImages.length);
                        setCurrentImages([...currentImages, ...newImages]);
                        setMoreImagesLoading(false);
                    }, 1500);
                }}
            />
        </div>
    );
}
