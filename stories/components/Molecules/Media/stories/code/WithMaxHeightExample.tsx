import React from 'react';
import { AccessAlarm, AcUnit } from '@mui/icons-material';
import { Media } from '@ringpublishing/mui-components';
import { getImagePath, TestImage, ImageSize } from 'RingDemoImages';

export default function WithMaxHeightExample(): React.JSX.Element {
    const image = {
        src: getImagePath(TestImage.BEACH, ImageSize.LARGE),
        thumbnailSrc: getImagePath(TestImage.BEACH, ImageSize.LARGE),
        title: TestImage.BEACH,
    };

    return (
        <Media
            image={image}
            ratio="1/1"
            objectFit="cover"
            height="200px"
            title="Beach image"
            description="Sample description rendered below media area"
            disableFullScreenPreview={true}
            statusLabels={[{ label: 'Main Image', color: 'primary', icon: <AccessAlarm /> }]}
            actions={[
                { label: 'Action 1', icon: <AcUnit /> },
                { label: 'Action 2', icon: <AccessAlarm /> },
            ]}
        />
    );
}
