import React from 'react';
import { Box, Stack, Typography } from '@mui/material';
import { Image } from 'lucide-react';
import { FeaturedIcon } from '@ringpublishing/mui-components';

const BOXES = [
    { width: 427, height: 240 },
    { width: 298, height: 168 },
    { width: 213, height: 120 },
    { width: 120, height: 213 },
    { width: 142, height: 80 },
    { width: 85, height: 48 },
];

export default function SizedByItsBoxExample(): React.JSX.Element {
    return (
        <Stack direction="row" sx={{ flexWrap: 'wrap', gap: 3, alignItems: 'flex-end' }}>
            {BOXES.map(({ width, height }) => (
                <Stack key={`${width}x${height}`} spacing={0.5}>
                    <Box sx={{ width, height, bgcolor: 'components.media.backgroundFill' }}>
                        <FeaturedIcon icon={Image} size="inherit" />
                    </Box>
                    <Typography variant="caption" color="text.secondary">
                        {width} × {height}
                    </Typography>
                </Stack>
            ))}
        </Stack>
    );
}
