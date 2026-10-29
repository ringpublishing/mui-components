import React from 'react';
import { IconButton } from '@mui/material';
import { EllipsisVertical } from 'lucide-react';
import { SearchBar } from '@ringpublishing/mui-components';

export default function ControlledSearchBarExample(): React.JSX.Element {
    const [value, setValue] = React.useState('');

    return (
        <SearchBar value={value} onChange={setValue} sx={{ border: 1, borderColor: 'divider', width: '450px' }}>
            <IconButton key={1}>
                <EllipsisVertical />
            </IconButton>
        </SearchBar>
    );
}
