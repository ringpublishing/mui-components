import React from 'react';
import { Image, Snowflake, AlarmClock } from 'lucide-react';
import { Media } from '@ringpublishing/mui-components';
import { getImagePath, TestImage, ImageSize } from 'RingDemoImages';

export default function DefaultExample(): React.JSX.Element {
    const image = {
        src: getImagePath(TestImage.BEACH, ImageSize.LARGE),
        thumbnailSrc: getImagePath(TestImage.BEACH, ImageSize.SMALL),
        title: 'A person walking a dog on a rocky beach below white cliffs',
    };
    const statusLabels = [
        { label: 'Label 1', color: 'primary' as const, icon: <AlarmClock /> },
        { label: 'Label 2, with a longer text', color: 'error' as const, icon: <Image /> },
    ];
    const actions = [
        { label: 'Action 1', icon: <Snowflake /> },
        { label: 'Action 2', icon: <AlarmClock /> },
    ];
    const bottomTooltips = [
        { title: 'Tooltip text 1', icon: <Snowflake /> },
        { title: 'Tooltip text 2', icon: <AlarmClock /> },
    ];

    return (
        <Media
            sx={{ width: 400 }}
            image={image}
            type="Photo"
            title="A quiet beach in the early morning"
            description="Author / Source"
            ratio="3/2"
            statusLabels={statusLabels}
            actions={actions}
            bottomTooltips={bottomTooltips}
        />
    );
}
