import React from 'react';
import { ImageRounded, AcUnit, AccessAlarm } from '@mui/icons-material';
import { Media } from '@ringpublishing/mui-components';
import { getImagePath, TestImage, ImageSize } from 'RingDemoImages';

export default function DefaultExample(): React.JSX.Element {
    const image = {
        src: getImagePath(TestImage.BEACH, ImageSize.LARGE),
        thumbnailSrc: getImagePath(TestImage.BEACH, ImageSize.LARGE),
        title: TestImage.BEACH,
    };
    const title = 'The Cat Takes a Long and Peaceful Nap in a Warm Patch of Afternoon Sunlight.';
    const description = '(James Veysey / Shutterstock)';
    const type = 'Image Type Title';
    const ratio = '4/3';
    const statusLabels = [
        {
            label: 'Label 1',
            color: 'primary' as const,
            icon: <AccessAlarm />,
        },
        {
            label: 'Label 2, with a longer text',
            color: 'error' as const,
            icon: <ImageRounded />,
        },
    ];
    const actions = [
        {
            label: 'Action 1',
            icon: <AcUnit />,
        },
        {
            label: 'Action 2',
            icon: <AccessAlarm />,
        },
    ];
    const bottomTooltips = [
        {
            title: 'Tooltip text 1',
            icon: <AcUnit />,
        },
        {
            title: 'Tooltip text 2',
            icon: <AccessAlarm />,
        },
    ];

    return (
        <Media
            image={image}
            title={title}
            description={description}
            type={type}
            ratio={ratio}
            statusLabels={statusLabels}
            actions={actions}
            bottomTooltips={bottomTooltips}
        />
    );
}
