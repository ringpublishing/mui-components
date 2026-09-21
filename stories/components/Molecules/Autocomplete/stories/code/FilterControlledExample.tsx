import React, { useState } from 'react';
import { Box } from '@mui/material';
import { Autocomplete } from '@ringpublishing/mui-components';

const options = [
    { id: 1, label: 'Onet' },
    { id: 2, label: 'Fakt' },
    { id: 3, label: 'Newsweek' },
];

export default function FilterControlledExample(): React.JSX.Element {
    const [inputValue, setInputValue] = useState('Fakt');
    const [open, setOpen] = useState(true);

    return (
        <Box width={240}>
            <Autocomplete
                variant="filter"
                labels={{ title: 'Publications', searchPlaceholder: 'Search publications' }}
                inputValue={inputValue}
                open={open}
                options={options}
                getOptionLabel={(option): string => (option as { label: string }).label}
                isOptionEqualToValue={(option, value): boolean => {
                    return (option as { id: number }).id === (value as { id: number }).id;
                }}
                onInputChange={(event, nextInputValue): void => {
                    void event;
                    setInputValue(nextInputValue);
                }}
                onClose={(event): void => {
                    void event;
                    setOpen(false);
                }}
                onOpen={(event): void => {
                    void event;
                    setOpen(true);
                }}
            />
        </Box>
    );
}
