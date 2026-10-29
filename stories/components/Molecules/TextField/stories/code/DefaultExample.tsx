import React from 'react';
import { TextField } from '@ringpublishing/mui-components';
import { Settings } from 'lucide-react';

export default function DefaultExample(): React.JSX.Element {
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
            ]}
        />
    );
}
