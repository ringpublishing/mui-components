import React from 'react';
import { Autocomplete } from '@ringpublishing/mui-components';
import { Box, Typography } from '@mui/material';
import { InfoOutlined } from '@mui/icons-material';

interface Option {
    label: string;
    id: number;
}

export default function WithCustomisedRenderOptionExample(): React.JSX.Element {
    const options: Option[] = [
        { label: 'Onet', id: 1 },
        { label: 'Fakt', id: 2 },
        { label: 'Komputer świat', id: 3 },
        { label: 'Newsweek', id: 4 },
        { label: 'Forbes', id: 5 },
        { label: 'Business insider', id: 6 },
    ];

    return (
        <Autocomplete
            options={options}
            defaultValue={options[0]}
            labels={{ title: 'search by' }}
            sx={{ width: 300 }}
            renderOption={(props: React.HTMLAttributes<HTMLLIElement>, option: unknown): React.ReactNode => {
                const typedOption = option as Option;
                return (
                    <li {...props}>
                        <Box
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                width: '100%',
                                overflow: 'hidden',
                                wordBreak: 'break-all',
                            }}
                        >
                            <Typography>{typedOption.label}</Typography>
                            <InfoOutlined />
                        </Box>
                    </li>
                );
            }}
        />
    );
}
