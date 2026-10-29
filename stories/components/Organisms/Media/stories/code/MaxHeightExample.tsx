import React from 'react';
import { AlarmClock, Snowflake } from 'lucide-react';
import { Media } from '@ringpublishing/mui-components';
import { getImagePath, TestImage, ImageSize } from 'RingDemoImages';

export default function MaxHeightExample(): React.JSX.Element {
    const image = {
        src: getImagePath(TestImage.BEACH, ImageSize.LARGE),
        thumbnailSrc: getImagePath(TestImage.BEACH, ImageSize.SMALL),
        title: 'A person walking a dog on a rocky beach below white cliffs',
    };

    return (
        <Media
            sx={{ width: 400 }}
            image={image}
            type="Photo"
            title="A quiet beach in the early morning"
            description="Author / Source"
            ratio="3/2"
            height="200px"
            disableFullScreenPreview={true}
            statusLabels={[{ label: 'Main image', color: 'primary', icon: <AlarmClock /> }]}
            actions={[
                { label: 'Action 1', icon: <Snowflake /> },
                { label: 'Action 2', icon: <AlarmClock /> },
            ]}
        />
    );
}
