import React from 'react';
import { Detail } from '@ringpublishing/mui-components';
import { Box } from '@mui/material';

export default function EmptyStateExample(): React.JSX.Element {
    return (
        <Box display={'flex'} justifyContent={'center'} height={600}>
            <Detail empty={true} />
        </Box>
    );
}
