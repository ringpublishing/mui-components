import React from 'react';
import { Stack } from '@mui/material';
import { Autocomplete, SearchBox, TextField } from '@ringpublishing/mui-components';

const contentTypes = [
    { label: 'Article', id: 1 },
    { label: 'Gallery', id: 2 },
    { label: 'Video', id: 3 },
];

export default function SizesExample(): React.JSX.Element {
    return (
        <Stack spacing={3}>
            {(['small', 'medium'] as const).map((size) => (
                <Stack key={size} direction="row" alignItems="center" spacing={2}>
                    <SearchBox
                        defaultValue=""
                        searchFunc={(query: string): void => console.info('Search', query)}
                        withClearButton={true}
                        size={size}
                        labels={{
                            placeholder: 'Search',
                            clear: 'Clear',
                        }}
                        sx={{ width: 240 }}
                    />
                    <TextField size={size} placeholder="Title" sx={{ width: 200 }} />
                    <Autocomplete
                        size={size}
                        options={contentTypes}
                        labels={{ title: '', inputPlaceholder: 'Content type' }}
                        sx={{ width: 200 }}
                    />
                </Stack>
            ))}
        </Stack>
    );
}
