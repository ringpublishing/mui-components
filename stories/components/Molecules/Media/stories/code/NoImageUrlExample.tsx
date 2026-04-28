import React from 'react';
import { AccessAlarm } from '@mui/icons-material';
import { Media } from '@ringpublishing/mui-components';

export default function NoImageUrlExample(): React.JSX.Element {
    return (
        <Media
            title="No image title"
            type="Image type name"
            ratio="16/9"
            statusLabels={[{ label: 'Label 1', color: 'primary', icon: <AccessAlarm /> }]}
        />
    );
}
