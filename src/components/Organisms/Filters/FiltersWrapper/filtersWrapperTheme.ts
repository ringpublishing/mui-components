import { ButtonOwnProps, Components, Theme } from '@mui/material';

export enum VariantEnum {
    OUTLINE = 'outlined',
    FILLED = 'filled',
    STANDARD = 'standard',
}

export enum SizeEnum {
    SMALL = 'small',
    MEDIUM = 'medium',
}

/**
 * Per-component `defaultProps` slice used by `FiltersWrapper` to enforce
 * a consistent `size` / `variant` across all MUI controls inside the
 * filter subtree. Returned shape matches `theme.components` (and
 * `themeOverrides.components` in `@ringpublishing/mui-theme`'s
 * `ThemeConfig`), so it plugs directly into `<ScopedThemeOverrides>`.
 */
export const filtersWrapperComponents = (
    size: SizeEnum,
    variant: VariantEnum,
    buttonStyle: Pick<ButtonOwnProps, 'size' | 'variant'>,
): Components<Omit<Theme, 'components'>> => ({
    MuiAutocomplete: {
        defaultProps: {
            size,
        },
    },
    MuiTextField: {
        defaultProps: {
            size,
            fullWidth: true,
            variant,
        },
    },
    MuiInputLabel: {
        defaultProps: {
            size,
            variant,
        },
    },
    MuiSelect: {
        defaultProps: {
            size,
            variant,
        },
    },
    MuiCheckbox: {
        defaultProps: {
            size,
        },
    },
    MuiSwitch: {
        defaultProps: {
            size,
        },
    },
    MuiRadio: {
        defaultProps: {
            size,
        },
    },
    MuiButton: {
        defaultProps: {
            size: buttonStyle.size,
            variant: buttonStyle.variant,
        },
    },
    MuiSlider: {
        defaultProps: {
            size,
        },
    },
});
