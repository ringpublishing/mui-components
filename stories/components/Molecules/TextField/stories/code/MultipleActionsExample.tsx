import React from 'react';
import { TextField } from '@ringpublishing/mui-components';
import { Info, Settings } from 'lucide-react';

export default function MultipleActionsExample(): React.JSX.Element {
    return (
        <TextField
            label="Search"
            sx={{ minWidth: '180px' }}
            actions={[
                {
                    icon: <Settings />,
                    onClick: () => {},
                    label: 'Settings',
                },
                {
                    icon: <Info />,
                    onClick: () => {},
                    label: 'Info',
                },
            ]}
        />
    );
}
