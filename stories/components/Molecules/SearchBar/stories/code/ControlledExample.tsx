import React from 'react';
import { IconButton } from '@mui/material';
import { MoreVert } from '@mui/icons-material';
import { SearchBar } from '@ringpublishing/mui-components';

export default function ControlledSearchBarExample(): React.JSX.Element {
    const [value, setValue] = React.useState('');

    return (
        <SearchBar value={value} onChange={setValue} sx={{ border: '1px solid #d9d9d9', width: '450px' }}>
            <IconButton key={1}>
                <MoreVert />
            </IconButton>
        </SearchBar>
    );
}
