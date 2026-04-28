import { Box } from '@mui/material';
import { ChipsInput, AutocompleteChip } from '@ringpublishing/mui-components';
import React from 'react';

export default function NoValidationExample(): React.JSX.Element {
    return (
        <Box sx={{ width: '300px' }}>
            <ChipsInput
                labels={{
                    title: 'Tags',
                    inputPlaceholder: 'Add any tag',
                    alreadyOnList: 'Tag already exists',
                }}
                onChange={(value: AutocompleteChip[]) => console.log(value)}
            />
        </Box>
    );
}
