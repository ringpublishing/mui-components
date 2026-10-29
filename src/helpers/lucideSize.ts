import type { ButtonGroupOwnProps, ButtonProps, IconButtonProps, SvgIconProps } from '@mui/material';

export type LucideMUIFontSize = NonNullable<SvgIconProps['fontSize']>;
export type LucideMuiComponentSize = NonNullable<
    ButtonProps['size'] | ButtonGroupOwnProps['size'] | IconButtonProps['size']
>;
export { DEFAULT_LUCIDE_ICON_SIZE, DEFAULT_LUCIDE_STROKE_WIDTH } from '@ringpublishing/mui-theme';

// Every lucide icon is drawn on a 24x24 viewBox, whatever it is rendered at.
const LUCIDE_VIEWBOX_SIZE = 24;

const lucideFontSizeMap: Record<LucideMUIFontSize, string> = {
    inherit: 'inherit',
    small: '1.25rem',
    medium: '1.5rem',
    large: '2rem',
};

const lucideFontPixelSizeMap: Record<Exclude<LucideMUIFontSize, 'inherit'>, number> = {
    small: 20,
    medium: 24,
    large: 32,
};

const lucideComponentSizeMap: Record<LucideMuiComponentSize, number> = {
    small: 18,
    medium: 20,
    large: 22,
};

export function getLucideFontSize(fontSize: LucideMUIFontSize = 'medium'): string {
    return lucideFontSizeMap[fontSize];
}

export function getLucideSizeFromFontSize(fontSize: LucideMUIFontSize = 'medium'): number | 'inherit' {
    if (fontSize === 'inherit') {
        return 'inherit';
    }

    return lucideFontPixelSizeMap[fontSize];
}

export function getLucideSizeFromComponentSize(size: LucideMuiComponentSize = 'medium'): number {
    return lucideComponentSizeMap[size];
}

/**
 * Stroke width to hand lucide for an icon rendered at a relative size such as `size="1em"`, where
 * lucide's own `absoluteStrokeWidth` arithmetic (`strokeWidth * 24 / Number(size)`) yields `NaN`;
 * the same arithmetic is done here against the pixel size behind the `fontSize` variant.
 * `fontSize="inherit"` has no known pixel size, so the stroke is returned unchanged.
 */
export function getAbsoluteStrokeWidth(strokeWidth: number, fontSize: LucideMUIFontSize = 'medium'): number {
    const pixelSize = getLucideSizeFromFontSize(fontSize);

    return typeof pixelSize === 'number' ? (strokeWidth * LUCIDE_VIEWBOX_SIZE) / pixelSize : strokeWidth;
}
