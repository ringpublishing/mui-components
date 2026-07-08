import React from 'react';
import { MediaCard } from '@ringpublishing/mui-components';
import { getImagePath, TestImage, ImageSize } from 'RingDemoImages';

export default function CustomTooltipsExample(): React.JSX.Element {
    const fields = [
        // always-on tooltip; tooltip text = the row text
        { value: 'Source / Author', alwaysShowTooltip: true },
        // always-on tooltip with custom, multiline content different from the row
        {
            value: 'JD',
            alwaysShowTooltip: true,
            tooltipTitle: (
                <>
                    John Doe
                    <br />
                    Senior Photographer
                    <br />
                    New York, USA
                </>
            ),
        },
        // default: tooltip only when the row overflows and truncates
        { value: 'A long description that may overflow the card and truncate with an ellipsis' },
    ];

    return (
        <MediaCard
            sx={{ width: '300px' }}
            title="Title / name"
            fields={fields}
            image={getImagePath(TestImage.ISLAND, ImageSize.MEDIUM)}
            ratio="16/9"
            objectFit="fill"
        />
    );
}
