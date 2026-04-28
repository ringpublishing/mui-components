import { describe, expect, it } from 'vitest';
import { ButtonOwnProps, createTheme } from '@mui/material';
import {
    filtersWrapperThemeCreator,
    SizeEnum,
    VariantEnum,
} from '../../../../src/components/Organisms/Filters/FiltersWrapper/filtersWrapperTheme.js';

describe('filtersWrapperThemeCreator', () => {
    const buttonStyle: Pick<ButtonOwnProps, 'size' | 'variant'> = {
        size: 'small',
        variant: 'outlined',
    };

    it('creates a theme with the correct default props for small size and outlined variant', () => {
        const theme = filtersWrapperThemeCreator(SizeEnum.SMALL, VariantEnum.OUTLINE, buttonStyle, createTheme());

        const expectedComponents = {
            MuiAutocomplete: { defaultProps: { size: 'small' } },
            MuiTextField: { defaultProps: { size: 'small', variant: 'outlined', fullWidth: true } },
            MuiButton: { defaultProps: { size: 'small', variant: 'outlined' } },
            MuiInputLabel: { defaultProps: { size: 'small', variant: 'outlined' } },
        };

        expect(theme.components).toMatchObject(expectedComponents);
    });

    it('creates a theme with the correct default props for medium size and filled variant', () => {
        const theme = filtersWrapperThemeCreator(SizeEnum.MEDIUM, VariantEnum.FILLED, buttonStyle, createTheme());

        const expectedComponents = {
            MuiAutocomplete: { defaultProps: { size: 'medium' } },
            MuiTextField: { defaultProps: { size: 'medium', variant: 'filled', fullWidth: true } },
            MuiButton: { defaultProps: { size: 'small', variant: 'outlined' } },
            MuiInputLabel: { defaultProps: { size: 'medium', variant: 'filled' } },
        };
        expect(theme.components).toMatchObject(expectedComponents);
    });

    it('creates a theme with the correct default props for different button style', () => {
        const buttonStyle: Pick<ButtonOwnProps, 'size' | 'variant'> = {
            size: 'large',
            variant: 'text',
        };
        const theme = filtersWrapperThemeCreator(SizeEnum.SMALL, VariantEnum.OUTLINE, buttonStyle, createTheme());

        expect(theme.components?.MuiButton?.defaultProps?.size).toEqual('large');
        expect(theme.components?.MuiButton?.defaultProps?.variant).toEqual('text');
    });
});
