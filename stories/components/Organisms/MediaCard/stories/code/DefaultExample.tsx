import React, { useState } from 'react';
import { MediaCard } from '@ringpublishing/mui-components';
import { Download, Link } from '@mui/icons-material';
import { getImagePath, TestImage, ImageSize } from 'RingDemoImages';

export default function DefaultExample(): React.JSX.Element {
    const [active, setActive] = useState(false);
    const handleSelectChange = (): void => setActive(!active);
    const [checked, setChecked] = useState(false);
    const handleCheckboxChange = (event: React.MouseEvent): void => {
        setChecked(!checked);
        event.stopPropagation();
    };
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
            sx={{ width: '300px' }}
            title="Title / name"
            fields={fields}
            actions={actions}
            image={getImagePath(TestImage.ISLAND, ImageSize.MEDIUM)}
            ratio="16/9"
            objectFit="fill"
            hoverable={true}
            active={active}
            onClick={handleSelectChange}
            slotProps={{
                checkbox: {
                    checked,
                    onClick: handleCheckboxChange,
                },
            }}
            statusLabels={[
                {
                    label: 'downloaded',
                    color: 'success',
                    icon: <Download />,
                },
            ]}
        />
    );
}
