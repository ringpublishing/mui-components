// Thin wrapper around `@ringpublishing/mui-theme`.
//
// The underlying theme package owns:
//   - ThemeConfig (version/language/typographyMode/overrides)
//   - getTheme (4-layer builder)
//   - MUI augmentations (Typography/Paper/Button/IconButton variants)
//   - basicGrey100 / basicGrey200 re-exports
//
// Ring UI components adds:
//   - Opinionated MUI X integration (Ring DataGrid overrides + locale
//     bundles sourced from the theme's `/mui-x` sub-entry).
//
// Apps that don't need MUI X should import `ThemeConfig` directly from
// `@ringpublishing/mui-theme` — doing so pulls zero MUI X code.

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

export { basicGrey100, basicGrey200 } from '@ringpublishing/mui-theme';

const DEFAULT_THEME_VERSION: ThemeVersion = 'reference';

export type ThemeConfigProps = CoreThemeConfigProps;
export type GetCreatedThemeOptions = GetThemeOptions;

export function getCreatedTheme(mode: PaletteMode | string, options?: GetCreatedThemeOptions): Theme {
    const { language = CommonLanguages.enUS, themeOverrides, externalLocales, version, ...rest } = options ?? {};

    return getTheme(mode, {
        ...rest,
        language,
        // Defensive pin: callers opt into the upcoming Ring DS via `version: 'next'`.
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

export const ThemeConfig = ({
    children,
    language,
    themeOverrides,
    externalLocales,
    version,
    ...rest
}: ThemeConfigProps): React.ReactNode[] | React.ReactNode => {
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
