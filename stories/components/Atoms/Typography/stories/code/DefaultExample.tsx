import React from 'react';
import { Typography } from '@ringpublishing/mui-components';
import { Box } from '@mui/material';

export default function DefaultExample(): React.JSX.Element {
    return (
        <>
            <Box sx={{ width: '300px', border: '1px solid #ccc', padding: 2, mb: 4 }}>
                <Typography variant="body1">
                    This is a very long text that will be wrapped within the container without overflow.
                </Typography>
            </Box>
            <Box sx={{ width: '300px', border: '1px solid #ccc', padding: 2 }}>
                <Typography variant="body1" enableOverflow={true}>
                    This is a very long text that will overflow and show ellipsis. Hover over it to see the full text in
                    a tooltip.
                </Typography>
            </Box>
        </>
    );
}
