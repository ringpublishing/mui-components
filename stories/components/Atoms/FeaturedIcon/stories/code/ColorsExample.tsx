import React from 'react';
import { Stack, Typography } from '@mui/material';
import { Image } from 'lucide-react';
import { FeaturedIcon } from '@ringpublishing/mui-components';

const COLORS = ['default', 'primary', 'info', 'success', 'warning', 'error'] as const;

export default function ColorsExample(): React.JSX.Element {
    return (
        <Stack direction="row" spacing={3}>
            {COLORS.map((color) => (
                <Stack key={color} spacing={1} sx={{ alignItems: 'center' }}>
                    <FeaturedIcon icon={Image} color={color} />
                    <Typography variant="caption" color="text.secondary">
                        {color}
                    </Typography>
                </Stack>
            ))}
        </Stack>
    );
}
