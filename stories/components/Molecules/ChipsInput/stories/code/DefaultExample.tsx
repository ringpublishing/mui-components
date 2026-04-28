import React from 'react';
import { Box } from '@mui/material';
import { ChipsInput, AutocompleteChip } from '@ringpublishing/mui-components';

export default function DefaultExample(): React.JSX.Element {
    return (
        <Box sx={{ width: '300px' }}>
            <ChipsInput
                labels={{
                    title: 'Chips input',
                    inputPlaceholder: 'Insert value and press enter',
                    alreadyOnList: 'Already on list',
                }}
                validationFunction={(value: AutocompleteChip) => {
                    return !isNaN(parseInt(value.label));
                }}
                onChange={(value: AutocompleteChip[]) => console.log(value)}
            />
        </Box>
    );
}
