import React from 'react';
import { Typography } from '@ringpublishing/mui-components';
import { Box } from '@mui/material';

export default function WithOverflowAndTooltipExample(): React.JSX.Element {
    return (
        <Box sx={{ width: '300px', border: '1px solid #ccc', padding: 2 }}>
            <Typography enableOverflow={true}>
                This is a very long text that will overflow and show ellipsis. Hover over it to see the full text in a
                tooltip.
            </Typography>
        </Box>
    );
}
