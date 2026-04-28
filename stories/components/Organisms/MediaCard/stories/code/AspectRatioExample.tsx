import React from 'react';
import { MediaCard } from '@ringpublishing/mui-components';
import { getImagePath, TestImage, ImageSize } from 'RingDemoImages';

export default function AspectRatioExample(): React.JSX.Element {
    const fields = [{ value: 'Source / Author' }];

    return (
        <MediaCard
            sx={{ width: '300px' }}
            title="Title / name"
            fields={fields}
            image={getImagePath(TestImage.STREET_3, ImageSize.MEDIUM)}
            objectFit="contain"
            ratio="4/3"
        />
    );
}
