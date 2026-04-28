import React from 'react';
import { Box, Button } from '@mui/material';
import { FeatureTooltip } from '@ringpublishing/mui-components';

export default function WithNoActionsExample(): React.JSX.Element {
    const clearTooltipData = (): void => {
        try {
            localStorage.removeItem('FeatureTooltips');
            location.reload();
        } catch (error) {
            console.warn(error);
        }
    };

    return (
        <Box sx={{ width: '80%' }}>
            <FeatureTooltip
                id="ring-feature-tooltip-3"
                title="Tooltip with no actions"
                message="There are many variations of passages of Lorem Ipsum available, but the majority have suffered alteration in some form"
                endDate="2026-06-24T10:49:20.823Z"
            >
                <div style={{ width: '200px' }}>Tooltip without action buttons</div>
            </FeatureTooltip>

            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mt: 2 }}>
                If you do not see tooltip:
                <Button onClick={clearTooltipData} variant="outlined" color="primary" sx={{ ml: 1 }}>
                    Clear tooltip data
                </Button>
            </Box>
        </Box>
    );
}
