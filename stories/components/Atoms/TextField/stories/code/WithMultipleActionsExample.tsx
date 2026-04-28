import React from 'react';
import { TextField } from '@ringpublishing/mui-components';
import { InfoOutlined, ManageSearch } from '@mui/icons-material';

export default function WithMultipleActionsExample(): React.JSX.Element {
    return (
        <TextField
            label="Search"
            sx={{ minWidth: '180px' }}
            actions={[
                {
                    icon: <ManageSearch />,
                    onClick: () => {},
                    label: 'Settings',
                },
                {
                    icon: <InfoOutlined />,
                    onClick: () => {},
                    label: 'Info',
                },
            ]}
        />
    );
}
