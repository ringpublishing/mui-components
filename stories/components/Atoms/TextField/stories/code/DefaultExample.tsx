import React from 'react';
import { TextField } from '@ringpublishing/mui-components';
import { ManageSearch } from '@mui/icons-material';

export default function DefaultExample(): React.JSX.Element {
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
            ]}
        />
    );
}
