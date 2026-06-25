import React, { useState } from 'react';
import { Media } from '@ringpublishing/mui-components';
import { getImagePath, TestImage, ImageSize } from 'RingDemoImages';

export default function WithEditableCaptionExample(): React.JSX.Element {
    const [title, setTitle] = useState('The Cat Takes a Long and Peaceful Nap in a Warm Patch of Afternoon Sunlight.');
    const [description, setDescription] = useState('(James Veysey / Shutterstock)');

    const handleTitleSubmit = (value: string): Promise<boolean> => {
        setTitle(value);

        return Promise.resolve(true);
    };

    const handleDescriptionSubmit = (value: string): Promise<boolean> => {
        setDescription(value);

        return Promise.resolve(true);
    };

    return (
        <Media
            image={{
                src: getImagePath(TestImage.BEACH, ImageSize.LARGE),
                thumbnailSrc: getImagePath(TestImage.BEACH, ImageSize.LARGE),
                title: TestImage.BEACH,
            }}
            type="Image Type Title"
            ratio="4/3"
            disableFullScreenPreview={true}
            title={title}
            description={description}
            onTitleSubmit={handleTitleSubmit}
            onDescriptionSubmit={handleDescriptionSubmit}
        />
    );
}
