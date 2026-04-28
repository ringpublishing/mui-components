import React from 'react';
import { IconButton, MenuItem, Select } from '@mui/material';
import { List, MoreTime, RocketLaunch } from '@mui/icons-material';
import { SearchBar, SplitButton } from '@ringpublishing/mui-components';

function SelectExample(): React.JSX.Element {
    return (
        <Select
            key={0}
            defaultValue={1}
            labelId="demo-simple-select-label"
            id="demo-simple-select"
            label="Age"
            variant="standard"
            disableUnderline={true}
        >
            <MenuItem value={1}>Newest</MenuItem>
            <MenuItem value={2}>Oldest</MenuItem>
            <MenuItem value={3}>Most popular</MenuItem>
        </Select>
    );
}

export default function DefaultExample(): React.JSX.Element {
    return (
        <SearchBar
            defaultValue=""
            searchFunc={() => null}
            withClearButton={true}
            debounceTime={500}
            labels={{
                placeholder: 'Search',
                clear: 'Clear',
            }}
            className="custom-class-name"
            sx={{ border: '1px solid #d9d9d9' }}
        >
            <SelectExample key={0} />
            <SplitButton key={1} actions={[{ label: 'Main Action', onClick: () => null }]} sx={{ height: '36px' }} />
            <SplitButton
                key={2}
                variant="outlined"
                actions={[
                    { label: 'Main Action', onClick: () => null },
                    {
                        label: 'Additional Action 1',
                        onClick: () => null,
                        icon: <RocketLaunch />,
                    },
                    {
                        label: 'Additional Action 2',
                        onClick: () => null,
                        icon: <MoreTime />,
                    },
                ]}
                sx={{ height: '36px' }}
            />
            <IconButton key={3}>
                <List />
            </IconButton>
        </SearchBar>
    );
}
