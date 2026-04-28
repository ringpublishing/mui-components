import React from 'react';
import { Box } from '@mui/material';
import { ChipsInput, AutocompleteChip, ChipColor } from '@ringpublishing/mui-components';

export default function CustomColorsExample(): React.JSX.Element {
    return (
        <Box sx={{ width: '300px' }}>
            <ChipsInput
                labels={{
                    title: 'Email validation',
                    inputPlaceholder: 'Enter email address',
                    alreadyOnList: 'Email already added',
                }}
                validationFunction={(value: AutocompleteChip) => {
                    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

                    return emailRegex.test(value.label);
                }}
                chipsColors={{
                    default: ChipColor.SUCCESS,
                    error: ChipColor.WARNING,
                }}
                onChange={(value: AutocompleteChip[]) => console.log(value)}
            />
        </Box>
    );
}
