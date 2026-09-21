import React from 'react';
import { Box } from '@mui/material';
import { Autocomplete } from '@ringpublishing/mui-components';

const options = [
    { id: 1, label: 'Onet' },
    { id: 2, label: 'Fakt' },
    { id: 3, label: 'Newsweek' },
];

export default function FilterDefaultExample(): React.JSX.Element {
    return (
        <Box width={240}>
            <Autocomplete
                variant="filter"
                labels={{ title: 'Publications', searchPlaceholder: 'Search publications' }}
                options={options}
                getOptionLabel={(option): string => (option as { label: string }).label}
                isOptionEqualToValue={(option, value): boolean => {
                    return (option as { id: number }).id === (value as { id: number }).id;
                }}
            />
        </Box>
    );
}
