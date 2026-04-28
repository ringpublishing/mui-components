import { getCreatedTheme } from '../theme/index.js';

const themeLight = getCreatedTheme('light');
const themeDark = getCreatedTheme('dark');

export function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);

    return result
        ? {
              r: parseInt(result[1], 16),
              g: parseInt(result[2], 16),
              b: parseInt(result[3], 16),
          }
        : null;
}

export function determineTextColorBasedOnBackground(hexColor: string): string {
    const rgb = hexToRgb(hexColor);

    if (!rgb) {
        return themeDark.palette.primary.contrastText;
    }

    const luminance = (0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b) / 255;

    return luminance > 0.5 ? themeDark.palette.primary.contrastText : themeLight.palette.primary.contrastText;
}
