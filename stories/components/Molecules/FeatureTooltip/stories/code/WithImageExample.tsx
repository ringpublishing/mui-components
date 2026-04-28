import { Box, Button } from '@mui/material';
import { FeatureTooltip, FeatureTooltipProps } from '@ringpublishing/mui-components';
import React from 'react';

const IMAGE_URL = 'https://design.ringpublishing.com/images/sea_large.jpg';

const actions: FeatureTooltipProps['actions'] = [
    { label: 'Default action', href: 'https://ringpublishing.com/' },
    { label: 'Secondary action', onClick: (): void => console.log('Secondary action clicked') },
];

export default function WithImageExample(): React.JSX.Element {
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
                    id="ring-feature-tooltip-4"
                    title="Tooltip with image and actions"
                    message=""
                    image={IMAGE_URL}
                    actions={actions}
                    endDate="2026-06-24T10:49:20.823Z"
                >
                    <div style={{ width: '200px' }}>Tooltip with image and two actions</div>
                </FeatureTooltip>

                <FeatureTooltip
                    id="ring-feature-tooltip-4b"
                    title="Tooltip with image, no actions"
                    message=""
                    image={IMAGE_URL}
                    endDate="2026-06-24T10:49:20.823Z"
                >
                    <div style={{ width: '200px' }}>Tooltip with image and no actions</div>
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
