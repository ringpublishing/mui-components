import { Stack, Typography, type Theme } from '@mui/material';

export default function GradientTextExample(): React.JSX.Element {
    // `color="ai"` on Typography resolves to a flat purple — CSS `color` cannot
    // hold a gradient. `gradientText` returns the three properties that can.
    return (
        <Stack spacing={2} alignItems="flex-start">
            <Typography variant="h5" sx={(theme: Theme): ReturnType<Theme['gradientText']> => theme.gradientText('ai')}>
                Ask AI to rewrite this headline
            </Typography>

            <Typography variant="body1" color="ai.main">
                For a flat AI purple, use the palette colour instead.
            </Typography>
        </Stack>
    );
}
