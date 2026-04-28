import React, { useState } from 'react';
import { MediaCard } from '@ringpublishing/mui-components';
import { getImagePath, TestImage, ImageSize } from 'RingDemoImages';

export default function CheckboxExample(): React.JSX.Element {
    const [checked, setChecked] = useState(false);
    const handleCheckboxChange = (event: React.MouseEvent): void => {
        setChecked(!checked);
        event.stopPropagation();
    };

    return (
        <MediaCard
            sx={{ width: '300px' }}
            title="Title / name"
            image={getImagePath(TestImage.ISLAND, ImageSize.MEDIUM)}
            ratio="16/9"
            objectFit="fill"
            slotProps={{
                checkbox: {
                    checked,
                    onClick: handleCheckboxChange,
                    showOnHover: !checked,
                },
            }}
        />
    );
}
