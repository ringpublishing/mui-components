import React, { useState } from 'react';
import type { StoryObj } from '@storybook/react-vite';
import { Button } from '@mui/material';
import { createCodeStory } from '../../../../helpers.js';
import DefaultExampleCode from './code/DefaultExample.tsx?raw';
import { LightBox, LightBoxProps } from '../../../../../src/index.js';
import { Image } from '../../../../../src/types.js';
import {
    getImagePath,
    getRandomImage,
    getRandomImageSize,
    ImageSize,
    TestImage,
} from '../../../../../src/helpers/stories/imagesData.js';

type Story = StoryObj<typeof LightBox>;

interface LightBoxWrapperProps extends LightBoxProps {
    withInfiniteScroll?: boolean;
}

const LightBoxWrapper = (props: LightBoxWrapperProps): React.JSX.Element => {
    const [open, setOpen] = useState(false);

    const initialImages = [
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
    ];

    const [currentImages, setCurrentImages] = useState<Image[]>(
        initialImages.map((img, idx) => ({ ...img, id: `image-${idx + 1}` })),
    );

    const [moreImagesLoading, setMoreImagesLoading] = useState(false);

    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <Button variant="outlined" color="primary" disableRipple={true} onClick={(): void => setOpen(true)}>
                Click me!
            </Button>
            <LightBox
                {...props}
                images={props.images?.length > 0 ? props.images : currentImages}
                onClose={(): void => setOpen(false)}
                open={open}
                moreImagesLoading={moreImagesLoading}
                onImagesScrollEnd={(): void => {
                    if (props.withInfiniteScroll) {
                        setMoreImagesLoading(true);
                        setTimeout((): void => {
                            const newImages = generateImages(currentImages.length);
                            setCurrentImages([
                                ...currentImages,
                                ...newImages.map((img, idx) => ({
                                    ...img,
                                    id: `image-${idx + currentImages.length + 1}`,
                                })),
                            ]);
                            setMoreImagesLoading(false);
                        }, 1500);
                    }
                }}
            />
        </div>
    );
};

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

export { LightBoxWrapper, generateImages };

export const Default: Story = {
    render: (args, context) =>
        createCodeStory({
            context,
            customProps: args,
            example: <LightBoxWrapper {...(args as LightBoxProps)} />,
            customCode: DefaultExampleCode,
        }),
};
