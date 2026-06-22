import { describe, expect, it } from 'vitest';
import { ButtonOwnProps } from '@mui/material';
import {
    filtersWrapperComponents,
    SizeEnum,
    VariantEnum,
} from '../../../../src/components/Organisms/Filters/FiltersWrapper/filtersWrapperTheme.js';

describe('filtersWrapperComponents', () => {
    const buttonStyle: Pick<ButtonOwnProps, 'size' | 'variant'> = {
        size: 'small',
        variant: 'outlined',
    };

    it('builds component overrides with the correct default props for small size and outlined variant', () => {
        const components = filtersWrapperComponents(SizeEnum.SMALL, VariantEnum.OUTLINE, buttonStyle);

        expect(components).toMatchObject({
            MuiAutocomplete: { defaultProps: { size: 'small' } },
            MuiTextField: { defaultProps: { size: 'small', variant: 'outlined', fullWidth: true } },
            MuiButton: { defaultProps: { size: 'small', variant: 'outlined' } },
            MuiInputLabel: { defaultProps: { size: 'small', variant: 'outlined' } },
        });
    });

    it('builds component overrides with the correct default props for medium size and filled variant', () => {
        const components = filtersWrapperComponents(SizeEnum.MEDIUM, VariantEnum.FILLED, buttonStyle);

        expect(components).toMatchObject({
            MuiAutocomplete: { defaultProps: { size: 'medium' } },
            MuiTextField: { defaultProps: { size: 'medium', variant: 'filled', fullWidth: true } },
            MuiButton: { defaultProps: { size: 'small', variant: 'outlined' } },
            MuiInputLabel: { defaultProps: { size: 'medium', variant: 'filled' } },
        });
    });

    it('builds component overrides with the correct default props for different button style', () => {
        const buttonStyle: Pick<ButtonOwnProps, 'size' | 'variant'> = {
            size: 'large',
            variant: 'text',
        };
        const components = filtersWrapperComponents(SizeEnum.SMALL, VariantEnum.OUTLINE, buttonStyle);

        expect(components.MuiButton?.defaultProps?.size).toEqual('large');
        expect(components.MuiButton?.defaultProps?.variant).toEqual('text');
    });
});
