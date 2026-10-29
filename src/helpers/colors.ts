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

const RGB_COLOR = /^rgba?\(\s*([\d.]+)\s*[,\s]\s*([\d.]+)\s*[,\s]\s*([\d.]+)\s*(?:[,/]\s*([\d.]+)\s*)?\)$/i;

const toChannel = (value: string): number => Math.min(255, Math.max(0, Number(value)));

function parseCssColor(color: string): { r: number; g: number; b: number; a: number } | null {
    const rgbResult = RGB_COLOR.exec(color);

    if (rgbResult) {
        return {
            r: toChannel(rgbResult[1]),
            g: toChannel(rgbResult[2]),
            b: toChannel(rgbResult[3]),
            a: rgbResult[4] === undefined ? 1 : Number(rgbResult[4]),
        };
    }

    const hex = hexToRgb(color);

    return hex ? { ...hex, a: 1 } : null;
}

export function determineTextColorBasedOnBackground(backgroundColor: string): string {
    const rgb = parseCssColor(backgroundColor);

    // A translucent colour renders as itself blended with whatever sits behind it, and that
    // backdrop is unknown here — so it takes the same safe default as an unparseable colour
    // rather than a contrast computed from the base channels alone.
    if (!rgb || rgb.a < 1) {
        return themeDark.palette.primary.contrastText;
    }

    const luminance = (0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b) / 255;

    return luminance > 0.5 ? themeDark.palette.primary.contrastText : themeLight.palette.primary.contrastText;
}
