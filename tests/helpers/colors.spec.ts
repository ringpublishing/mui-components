import { describe, it, expect } from 'vitest';
import { hexToRgb, determineTextColorBasedOnBackground } from '../../src/helpers/colors.js';
import { getCreatedTheme } from '../../src/index.js';

const themeLight = getCreatedTheme('light');
const themeDark = getCreatedTheme('dark');

describe('hexToRgb', () => {
    it('should return correct RGB object for given hex color', () => {
        const result = hexToRgb('#FFFFFF');
        expect(result).toEqual({ r: 255, g: 255, b: 255 });
    });

    it('should return null for invalid hex color', () => {
        const result = hexToRgb('#ZZZZZZ');
        expect(result).toBe(null);
    });
});

describe('determineTextColorBasedOnBackground', () => {
    it('should return light text color for dark background', () => {
        const result = determineTextColorBasedOnBackground('#000000');
        expect(result).toBe(themeLight.palette.primary.contrastText);
    });

    it('should return dark text color for light background', () => {
        const result = determineTextColorBasedOnBackground('#FFFFFF');
        expect(result).toBe(themeDark.palette.primary.contrastText);
    });

    it('should return dark text color for invalid hex color', () => {
        const result = determineTextColorBasedOnBackground('#ZZZZZZ');
        expect(result).toBe(themeDark.palette.primary.contrastText);
    });

    it('should return light text color for dark rgb() background', () => {
        const result = determineTextColorBasedOnBackground('rgb(0, 0, 0)');
        expect(result).toBe(themeLight.palette.primary.contrastText);
    });

    it('should return dark text color for light rgba() background (theme token format)', () => {
        const result = determineTextColorBasedOnBackground('rgba(255, 255, 255, 1)');
        expect(result).toBe(themeDark.palette.primary.contrastText);
    });

    it('should return dark text color for a translucent dark tint, which renders pale', () => {
        // the shape of palette state tokens, e.g. action.selected
        const result = determineTextColorBasedOnBackground('rgba(71, 85, 105, 0.08)');
        expect(result).toBe(themeDark.palette.primary.contrastText);
    });

    it('should return dark text color for a translucent black tint', () => {
        const result = determineTextColorBasedOnBackground('rgba(0, 0, 0, 0.1)');
        expect(result).toBe(themeDark.palette.primary.contrastText);
    });

    it('should clamp out-of-range channels instead of overshooting the luminance', () => {
        const result = determineTextColorBasedOnBackground('rgb(999, 999, 999)');
        expect(result).toBe(themeDark.palette.primary.contrastText);
    });
});
