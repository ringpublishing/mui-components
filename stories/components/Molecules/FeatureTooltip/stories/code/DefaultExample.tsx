import { Box, Button } from '@mui/material';
import { FeatureTooltip, FeatureTooltipProps } from '@ringpublishing/mui-components';
import React from 'react';

const actions: FeatureTooltipProps['actions'] = [
    { label: 'Default action', href: 'https://ringpublishing.com/' },
    { label: 'Secondary action', onClick: (): void => console.log('Secondary action clicked') },
];

export default function DefaultExample(): React.JSX.Element {
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
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <FeatureTooltip
                    id="ring-feature-tooltip-1"
                    title="Standard tooltip"
                    message="There are many variations of passages of Lorem Ipsum available, but the majority have suffered alteration in some form"
                    actions={actions}
                    endDate="2026-06-24T10:49:20.823Z"
                >
                    <div style={{ width: '200px' }}>Tooltip shown only once, after closing not visible</div>
                </FeatureTooltip>

                <FeatureTooltip
                    id="ring-feature-tooltip-capping"
                    title="Tooltip with capping"
                    capping={3}
                    message=""
                    videoEmbed="https://www.youtube.com/embed/KRphOlc8tKg?si=xUR6gOpAPDcR74Dk"
                    actions={actions}
                    endDate="2026-06-24T10:49:20.823Z"
                >
                    <div style={{ width: '200px' }}>Tooltip with capping (should be visible 3 times)</div>
                </FeatureTooltip>
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mt: 2 }}>
                If you do not see tooltip:
                <Button onClick={clearTooltipData} variant="outlined" color="primary" sx={{ ml: 1 }}>
                    Clear tooltip data
                </Button>
            </Box>
        </Box>
    );
}
