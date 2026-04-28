import { ButtonOwnProps, createTheme, Theme } from '@mui/material';

export enum VariantEnum {
    OUTLINE = 'outlined',
    FILLED = 'filled',
    STANDARD = 'standard',
}

export enum SizeEnum {
    SMALL = 'small',
    MEDIUM = 'medium',
}

export const filtersWrapperThemeCreator = (
    size: SizeEnum,
    variant: VariantEnum,
    buttonStyle: Pick<ButtonOwnProps, 'size' | 'variant'>,
    theme: Theme,
): Theme => {
    return createTheme(theme, {
        components: {
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
        },
    });
};
