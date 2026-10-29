import React from 'react';
import { IconButton } from '@mui/material';
import { ListFilter, EllipsisVertical } from 'lucide-react';
import { DEFAULT_LUCIDE_ICON_SIZE, RingLucideIcon, SearchBar } from '@ringpublishing/mui-components';

export default function ClassSelectorChildrenStackExample(): React.JSX.Element {
    return (
        <SearchBar
            defaultValue=""
            searchFunc={(): null => null}
            sx={{
                width: '450px',
                border: 1,
                borderColor: 'divider',
                '.ring-search-bar-children-stack': {
                    justifyContent: 'space-between',
                    width: '50%',
                },
            }}
        >
            <IconButton key={0}>
                <RingLucideIcon icon={ListFilter} sx={{ fontSize: DEFAULT_LUCIDE_ICON_SIZE, color: 'primary.main' }} />
            </IconButton>
            <IconButton key={1}>
                <EllipsisVertical />
            </IconButton>
        </SearchBar>
    );
}
