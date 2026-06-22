import { SxProps, Theme } from '@mui/material';
import { PropsWithChildren } from 'react';

export interface WithDataTestIdSuffix {
    /**
     * Optional suffix added to data-testid attributes.
     */
    dataTestIdSuffix?: string;
}

export interface CommonComponentProps extends PropsWithChildren, WithDataTestIdSuffix {
    /**
     * Custom styles
     */
    sx?: SxProps<Theme>;
    /**
     * CSS additional class
     */
    className?: string;
}

// Re-export the canonical enum from the theme to avoid drift.
export { CommonLanguages } from '@ringpublishing/mui-theme';
