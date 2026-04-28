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

    it('should return light text color for invalid hex color', () => {
        const result = determineTextColorBasedOnBackground('#ZZZZZZ');
        expect(result).toBe(themeDark.palette.primary.contrastText);
    });
});
