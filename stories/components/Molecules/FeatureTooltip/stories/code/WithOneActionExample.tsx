import React from 'react';
import { Box, Button } from '@mui/material';
import { FeatureTooltip } from '@ringpublishing/mui-components';

export default function WithOneActionExample(): React.JSX.Element {
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
                id="ring-feature-tooltip-2"
                title="Tooltip with one action"
                message="There are many variations of passages of Lorem Ipsum available, but the majority have suffered alteration in some form"
                actions={[{ label: 'Default action', href: 'https://ringpublishing.com/' }]}
                videoEmbed="https://www.youtube.com/embed/KRphOlc8tKg?si=xUR6gOpAPDcR74Dk"
                endDate="2026-06-24T10:49:20.823Z"
            >
                <div style={{ width: '200px' }}>Tooltip with one action and video embed</div>
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
