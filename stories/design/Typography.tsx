import { ReactNode } from 'react';
import { Box, Typography } from '@mui/material';

// Pure presentational — theme comes from the global decorator in preview.tsx, no local <ThemeConfig> needed.
export const TypographyExample = (): ReactNode => {
    return (
        <Box
            sx={{
                display: 'flex',
                gap: '24px',
                alignItems: 'center',
                flexDirection: 'column',
                bgcolor: 'background.default',
                color: 'text.primary',
                padding: '24px',
            }}
        >
            <Typography variant={'h1'}>Header 1</Typography>
            <Typography variant={'h2'}>Header 2</Typography>
            <Typography variant={'h3'}>Header 3</Typography>
            <Typography variant={'h4'}>Header 4</Typography>
            <Typography variant={'h5'}>Header 5</Typography>
            <Typography variant={'h6'}>Header 6</Typography>

            <Typography variant={'subtitle1'}>Subtitle 1</Typography>
            <Typography variant={'subtitle2'}>Subtitle 2</Typography>

            <Typography variant={'body1'}>Body 1</Typography>
            <Typography variant={'body2'}>Body 2</Typography>

            <Typography variant={'caption'}>Caption</Typography>
            <Typography variant={'overline'}>Overline</Typography>
        </Box>
    );
};
