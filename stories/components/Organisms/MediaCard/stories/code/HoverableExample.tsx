import React, { useState } from 'react';
import { MediaCard } from '@ringpublishing/mui-components';
import { Download, Link } from '@mui/icons-material';
import { getImagePath, TestImage, ImageSize } from 'RingDemoImages';

export default function HoverableExample(): React.JSX.Element {
    const [active, setActive] = useState(false);
    const handleSelectChange = (): void => setActive(!active);
    const actions = [
        {
            label: 'Action 1',
            icon: <Download />,
        },
        {
            label: 'Action 2',
            icon: <Link />,
        },
    ];
    const fields = [
        { value: 'Source / Author' },
        { value: 'Brief description or summary of the content' },
        { value: 'Space for comments or additional information that may take up more space' },
    ];

    return (
        <MediaCard
            hoverable={true}
            active={active}
            onClick={handleSelectChange}
            image={getImagePath(TestImage.ISLAND, ImageSize.MEDIUM)}
            ratio="16/9"
            objectFit="fill"
            sx={{ width: '300px' }}
            title="Title / name"
            fields={fields}
            actions={actions}
        />
    );
}
