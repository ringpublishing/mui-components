import React, { useState } from 'react';
import { Media } from '@ringpublishing/mui-components';
import { getImagePath, TestImage, ImageSize } from 'RingDemoImages';

export default function EditableCaptionExample(): React.JSX.Element {
    const [title, setTitle] = useState('A quiet beach in the early morning');
    const [description, setDescription] = useState('Author / Source');

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
            sx={{ width: 400 }}
            image={{
                src: getImagePath(TestImage.BEACH, ImageSize.LARGE),
                thumbnailSrc: getImagePath(TestImage.BEACH, ImageSize.SMALL),
                title: 'A person walking a dog on a rocky beach below white cliffs',
            }}
            type="Photo"
            ratio="3/2"
            disableFullScreenPreview={true}
            title={title}
            description={description}
            onTitleSubmit={handleTitleSubmit}
            onDescriptionSubmit={handleDescriptionSubmit}
        />
    );
}
