import React from 'react';
import { Stack, Typography } from '@mui/material';
import { Inbox } from 'lucide-react';
import { FeaturedIcon } from '@ringpublishing/mui-components';

const SIZES = [
    { size: 'small', note: 'plate 40 · icon 16 · stroke 1' },
    { size: 'medium', note: 'plate 60 · icon 24 · stroke 1.5' },
    { size: 'large', note: 'plate 80 · icon 32 · stroke 1.5' },
] as const;

export default function SizesExample(): React.JSX.Element {
    return (
        <Stack direction="row" spacing={4} sx={{ alignItems: 'flex-end' }}>
            {SIZES.map(({ size, note }) => (
                <Stack key={size} spacing={1} sx={{ alignItems: 'center' }}>
                    <FeaturedIcon icon={Inbox} size={size} />
                    <Typography variant="caption" color="text.secondary">
                        {size} — {note}
                    </Typography>
                </Stack>
            ))}
        </Stack>
    );
}
