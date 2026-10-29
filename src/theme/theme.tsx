// Thin wrapper around `@ringpublishing/mui-theme` that adds the MUI X integration (Ring DataGrid
// overrides and locale bundles from the theme's `/mui-x` sub-entry); the theme's `ThemeConfig` mounts
// `RingIconDefaults`. Apps that do not need MUI X can import `ThemeConfig` from `@ringpublishing/mui-theme` directly.

import React from 'react';
import { PaletteMode } from '@mui/material';

// Local mirror of Ring's MUI sub-module augmentations — see file for context.
import './muiAugmentation.js';

import {
    CommonLanguages,
    GetThemeOptions,
    Theme,
    ThemeConfig as CoreThemeConfig,
    ThemeConfigProps as CoreThemeConfigProps,
    ThemeVersion,
    getTheme,
} from '@ringpublishing/mui-theme';
import { getMuiXLocales, ringDataGridOverrides } from '@ringpublishing/mui-theme/mui-x';

// LightBox and helpers/colors.ts build their own theme with this default and ignore a `version` passed to
// ThemeConfig.
const DEFAULT_THEME_VERSION: ThemeVersion = 'next';

// The public types leave out `version`, yet both functions below still forward one passed from JavaScript; the
// library's tests and Storybook pass it to ThemeConfig through `internalTheme.ts`.
export type ThemeConfigProps = Omit<CoreThemeConfigProps, 'version'>;
export type GetCreatedThemeOptions = Omit<GetThemeOptions, 'version'>;

export function getCreatedTheme(mode: PaletteMode | string, options?: GetCreatedThemeOptions): Theme {
    const {
        language = CommonLanguages.enUS,
        themeOverrides,
        externalLocales,
        version,
        ...rest
    }: GetThemeOptions = options ?? {};

    return getTheme(mode, {
        ...rest,
        language,
        version: version ?? DEFAULT_THEME_VERSION,
        themeOverrides: {
            ...themeOverrides,
            components: {
                ...ringDataGridOverrides,
                ...themeOverrides?.components,
            },
        },
        externalLocales: [...getMuiXLocales(language), ...(externalLocales ?? [])],
    });
}

export const ThemeConfig = (props: ThemeConfigProps): React.ReactNode[] | React.ReactNode => {
    const { children, language, themeOverrides, externalLocales, version, ...rest }: CoreThemeConfigProps = props;
    // Ring MUI X defaults sit underneath consumer-provided values (consumer wins on collision).
    const mergedThemeOverrides = {
        ...themeOverrides,
        components: {
            ...ringDataGridOverrides,
            ...themeOverrides?.components,
        },
    };
    const mergedLocales = [...getMuiXLocales(language), ...(externalLocales ?? [])];

    return (
        <CoreThemeConfig
            {...rest}
            language={language}
            version={version ?? DEFAULT_THEME_VERSION}
            themeOverrides={mergedThemeOverrides}
            externalLocales={mergedLocales}
        >
            {children}
        </CoreThemeConfig>
    );
};
