import React from 'react';
import { Autocomplete, Action } from '@ringpublishing/mui-components';
import { ManageSearch, InfoOutlined } from '@mui/icons-material';

interface Option {
    label: string;
    id: number;
}

export default function WithMultipleDropdownActionsExample(): React.JSX.Element {
    const options: Option[] = [
        { label: 'Onet', id: 1 },
        { label: 'Fakt', id: 2 },
        { label: 'Komputer świat', id: 3 },
        { label: 'Newsweek', id: 4 },
        { label: 'Forbes', id: 5 },
        { label: 'Business insider', id: 6 },
    ];

    const actions: Action[] = [
        {
            icon: <ManageSearch />,
            onClick: () => console.log('Settings clicked'),
            label: 'Settings',
        },
        {
            icon: <InfoOutlined />,
            onClick: () => console.log('Info clicked'),
            label: 'Info',
        },
    ];

    return (
        <Autocomplete
            options={options}
            actions={actions}
            defaultValue={options[0]}
            labels={{ title: 'search by' }}
            sx={{ width: 300 }}
        />
    );
}
