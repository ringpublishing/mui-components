// Declares the `MuiPickersTextField` slot key on `Components`. MUST stay `import type {}`:
// this file only needs the augmentation, and a side-effect import would pull MUI X into the
// runtime bundle of every consumer that imports `FiltersWrapper`.
import type {} from '@mui/x-date-pickers/themeAugmentation';

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

// These scoped overrides also reach a plain MUI theme (a consumer's own `createTheme()`, or none at all),
// which has no `getSpacing`.
function getSpacing(theme: Omit<Theme, 'components'>): Theme['getSpacing'] {
    return theme.getSpacing ?? theme.spacing;
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
    // Neutralises the theme's accordion card, which is meant for a full-width surface rather than
    // this sidebar. `variants` and function-valued `styleOverrides` are replaced rather than
    // merged, so both slots are restated in full.
    MuiAccordion: {
        variants: [
            {
                props: { variant: 'borderless' },
                style: {
                    boxShadow: 'none',
                    backgroundColor: 'transparent',
                },
            },
        ],
    },
    // The theme card's 16px side padding is designed for a full-width surface; in this
    // sidebar the fields run edge to edge instead.
    MuiAccordionDetails: {
        styleOverrides: {
            root: {
                paddingLeft: 0,
                paddingRight: 0,
            },
        },
    },
    MuiAccordionSummary: {
        styleOverrides: {
            root: ({ theme }) => ({
                padding: 0,
                minHeight: getSpacing(theme)(4),
                '& .MuiAccordionSummary-expandIconWrapper': {
                    color: theme.palette.action.active,
                },
                // No surface colour: dropping the card variant already restores MUI's own
                // disabled tint, and a second translucent layer would stack onto no token.
                '&.Mui-disabled': {
                    opacity: 1,
                    '& .MuiTypography-root': {
                        color: theme.palette.text.disabled,
                    },
                    '& .MuiAccordionSummary-expandIconWrapper': {
                        color: theme.palette.action.disabled,
                    },
                },
                '&.Mui-expanded': {
                    padding: 0,
                    minHeight: getSpacing(theme)(4),
                },
            }),
            content: ({ theme }) => ({
                margin: getSpacing(theme)(1, 0),
                '&.Mui-expanded': {
                    margin: getSpacing(theme)(1, 0),
                },
            }),
        },
    },
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
    // MUI X date/time fields are their own slot, so `MuiTextField` above never reaches them.
    MuiPickersTextField: {
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
