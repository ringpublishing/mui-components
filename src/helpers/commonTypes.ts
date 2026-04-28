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

export enum CommonLanguages {
    // Pick<SupportedLocales, 'plPL' | 'enUS'>
    /**
     * en translation
     */
    plPL = 'plPL',
    /**
     * pl translation
     */
    enUS = 'enUS',
}
