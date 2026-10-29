import React from 'react';
import { Stack, Typography } from '@mui/material';
import { FileText } from 'lucide-react';
import { FeaturedIcon } from '@ringpublishing/mui-components';

export default function EmptyStateExample(): React.JSX.Element {
    return (
        <Stack spacing={2} sx={{ alignItems: 'center', textAlign: 'center', maxWidth: 320 }}>
            <FeaturedIcon icon={FileText} size="large" />
            <Typography variant="h6">No articles yet</Typography>
            <Typography variant="body2" color="text.secondary">
                Articles you add to this list will appear here.
            </Typography>
        </Stack>
    );
}
