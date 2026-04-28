import React from 'react';
import { IconButton } from '@mui/material';
import { FilterList, MoreVert } from '@mui/icons-material';
import { SearchBar } from '@ringpublishing/mui-components';

export default function ClassSelectorChildrenStackExample(): React.JSX.Element {
    return (
        <SearchBar
            defaultValue=""
            searchFunc={() => null}
            sx={{
                width: '450px',
                border: '1px solid #d9d9d9',
                '.ring-search-bar-children-stack': {
                    justifyContent: 'space-between',
                    width: '50%',
                },
            }}
        >
            <IconButton key={0}>
                <FilterList sx={{ color: 'primary.main' }} />
            </IconButton>
            <IconButton key={1}>
                <MoreVert />
            </IconButton>
        </SearchBar>
    );
}
