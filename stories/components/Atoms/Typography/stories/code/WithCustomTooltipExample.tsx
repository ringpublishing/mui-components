import React from 'react';
import { Typography } from '@ringpublishing/mui-components';
import { Box } from '@mui/material';

export default function WithCustomTooltipExample(): React.JSX.Element {
    return (
        <Box sx={{ width: '320px', border: '1px solid #ccc', padding: 2 }}>
            {/*
             * `enableOverflow` handles the ellipsis truncation; `alwaysShowTooltip` renders
             * the tooltip on hover regardless of overflow. `tooltipTitle` is a ReactNode, so
             * it can be multiline / custom content different from the row text.
             */}
            <Typography
                enableOverflow={true}
                alwaysShowTooltip={true}
                tooltipTitle={
                    <>
                        John Doe
                        <br />
                        Senior Photographer
                        <br />
                        New York, USA
                    </>
                }
            >
                This row truncates with an ellipsis and always shows a custom tooltip on hover
            </Typography>
        </Box>
    );
}
