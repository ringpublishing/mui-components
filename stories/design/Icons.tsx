import { ReactNode } from 'react';
import { Stack, Typography } from '@mui/material';
import { Unstyled } from '@storybook/addon-docs/blocks';
import { ThemeConfig } from '../../src/index.js';

/**
 * Live sample on the Icons page. The page is not attached to a story, so it gets neither the
 * Storybook decorator nor an exemption from the docs stylesheet: `ThemeConfig` supplies the theme
 * the icons are documented under, and `Unstyled` keeps the docs typography and button styles off
 * the MUI components inside.
 */
export const Live = ({ children }: { children: ReactNode }): ReactNode => (
    <Unstyled>
        <ThemeConfig mode="light">{children}</ThemeConfig>
    </Unstyled>
);

interface SpecimenProps {
    /** Caption under the sample, typically the props that produced it. */
    label: string;
    children: ReactNode;
}

/** One labelled icon sample on the Icons page. Samples of different sizes share one baseline. */
export const Specimen = ({ label, children }: SpecimenProps): ReactNode => (
    <Stack spacing={0.75} sx={{ alignItems: 'center', minWidth: 96 }}>
        <Stack sx={{ height: 40, justifyContent: 'center', alignItems: 'center' }}>{children}</Stack>
        <Typography variant="caption" sx={{ textAlign: 'center', whiteSpace: 'pre-line', color: 'text.secondary' }}>
            {label}
        </Typography>
    </Stack>
);

/** Wrapping row of `Specimen`s. */
export const SpecimenRow = ({ children }: { children: ReactNode }): ReactNode => (
    <Stack direction="row" spacing={3} useFlexGap={true} sx={{ flexWrap: 'wrap', alignItems: 'flex-start', my: 2 }}>
        {children}
    </Stack>
);
