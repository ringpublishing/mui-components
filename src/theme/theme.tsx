import React from 'react';
import { CssBaseline, PaletteMode, ThemeProvider } from '@mui/material';

import type {} from '@mui/x-data-grid/themeAugmentation';
import { plPL as xDataGridPl, enUS as xDataGridPlEn } from '@mui/x-data-grid-pro/locales';
import { plPL as corePL, enUS as coreUS } from '@mui/material/locale';
import { plPL as xDatePickersPl, enUS as xDatePickersEn } from '@mui/x-date-pickers/locales';

import { getTheme, CommonLanguages, Theme, TypographyMode } from '@ringpublishing/mui-theme';

declare module '@mui/material/Typography' {
    interface TypographyPropsVariantOverrides {
        label: true;
        headline1: true;
        headline2: true;
        headline3: true;
    }
}

declare module '@mui/material/Paper' {
    interface PaperPropsVariantOverrides {
        borderless: true;
    }
}

declare module '@mui/material/Button' {
    interface ButtonPropsColorOverrides {
        contrast: true;
    }
}

declare module '@mui/material/IconButton' {
    interface IconButtonPropsColorOverrides {
        contrast: true;
    }
}

const externalTheme = {
    MuiDataGrid: {
        defaultProps: {
            hideFooter: true,
        },
        styleOverrides: {
            root: ({ theme }: { theme: Theme }) => {
                return {
                    '& .MuiDataGrid-columnHeaderTitle': {
                        color: theme.palette.text.secondary,
                    },
                    '--unstable_DataGrid-headWeight': 600,
                    '--DataGrid-rowBorderColor': theme.palette.components.datagrid.border,
                    border: 'none',
                    '& .MuiDataGrid-cell:focus': {
                        outline: 'none',
                    },
                    '& .MuiDataGrid-cell:focus-within': {
                        outline: 'none',
                    },
                    '& .MuiDataGrid-columnHeader:focus': {
                        outline: 'none',
                    },
                    '& .MuiDataGrid-columnHeader:focus-within': {
                        outline: 'none',
                    },
                    '& .MuiDataGrid-row:hover': {
                        cursor: 'pointer',
                    },
                    '.MuiDataGrid-columnsManagement': {
                        background: 'red',
                    },
                    '.MuiDataGrid-columnsManagementHeader': {
                        background: 'green',
                    },
                };
            },
        },
    },
};

const getLocales = (language: CommonLanguages = CommonLanguages.enUS) => {
    const coreLocale = language === CommonLanguages.plPL ? corePL : coreUS;
    const xDataGridLocale = language === CommonLanguages.plPL ? xDataGridPl : xDataGridPlEn;
    const xDatePickersLocale = language === CommonLanguages.plPL ? xDatePickersPl : xDatePickersEn;

    return [coreLocale, xDataGridLocale, xDatePickersLocale];
};

interface ThemeConfigProps {
    mode: PaletteMode;
    children: React.ReactNode[] | React.ReactNode;
    language?: CommonLanguages;
    /**
     * Typography unit mode.
     *
     * - `'rem'` – modern rem-based values calibrated to browser default (1rem = 16px).
     *   No global font-size hack required.
     *
     * - `'deprecated-px'` – backwards-compatible mode for apps that set `html { font-size: 62.5% }`
     *   (1rem = 10px). Use this as a temporary bridge when migrating from the old component
     *   library that relied on that global hack. Remove once migration is complete.
     *
     * @default 'rem'
     * @deprecated `'deprecated-px'` is a temporary migration aid introduced in v1 and will be removed
     * in a future major release. Migrate your app to standard `html { font-size: 100% }` and
     * remove this prop to use the default `'rem'` mode.
     */
    typographyMode?: TypographyMode;
}

export interface GetCreatedThemeOptions {
    /** @default CommonLanguages.enUS */
    language?: CommonLanguages;
    /** Additional colors to merge into the theme palette. */
    externalColors?: object;
    /**
     * Typography unit mode.
     *
     * - `'rem'` – modern rem-based values calibrated to browser default (1rem = 16px).
     * - `'deprecated-px'` – backwards-compatible mode for apps that set `html { font-size: 62.5% }`.
     *
     * @default 'rem'
     */
    typographyMode?: TypographyMode;
}

export function getCreatedTheme(mode: PaletteMode | string, options?: GetCreatedThemeOptions): Theme {
    const { language = CommonLanguages.enUS, externalColors, typographyMode = 'rem' } = options ?? {};

    return getTheme(mode, {
        language,
        externalComponentsTheme: externalTheme,
        externalLocales: getLocales(language),
        externalColors,
        typographyMode,
    });
}

export const ThemeConfig = ({
    mode,
    children,
    language,
    typographyMode,
}: ThemeConfigProps): React.ReactNode[] | React.ReactNode => {
    return (
        <ThemeProvider theme={getCreatedTheme(mode, { language, typographyMode })}>
            <CssBaseline />
            {children}
        </ThemeProvider>
    );
};

export const basicGrey100 = '#D9D9D9';
export const basicGrey200 = '#7b7b7b';
