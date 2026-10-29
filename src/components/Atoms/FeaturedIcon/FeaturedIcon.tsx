import React, { isValidElement, type ReactElement } from 'react';
import { Box, alpha, type SxProps, type Theme } from '@mui/material';
import classNames from 'classnames';
import type { LucideIcon } from 'lucide-react';

import { CommonComponentProps } from '../../../helpers/commonTypes.js';
import { RingLucideIcon } from '../../../helpers/RingLucideIcon.js';
import { useRingDataTestId } from '../../../helpers/hooks/useRingDataTestId.js';
import { WithRootDataTestIdOverride, resolveRootDataTestId } from '../../../helpers/dataTestId.js';

export type FeaturedIconSize = 'small' | 'medium' | 'large' | 'inherit';

export type FeaturedIconColor = 'default' | 'primary' | 'info' | 'success' | 'warning' | 'error';

interface FeaturedIconMetrics {
    sizes: { small: number; medium: number; large: number };
    plateMin: number;
    plateMax: number;
    platePerShorterSide: number;
    glyphPerPlate: number;
    thinStrokeBelow: number;
    thinStroke: number;
}

// A theme without `theme.featuredIcon`, such as a plain MUI one, gets the same rule from here.
const DEFAULT_METRICS: FeaturedIconMetrics = {
    sizes: { small: 40, medium: 60, large: 80 },
    plateMin: 40,
    plateMax: 120,
    platePerShorterSide: 0.5,
    glyphPerPlate: 0.4,
    thinStrokeBelow: 24,
    thinStroke: 1,
};

function metricsOf(theme: Theme): FeaturedIconMetrics {
    const { featuredIcon } = theme as Theme & { featuredIcon?: Partial<FeaturedIconMetrics> };

    return { ...DEFAULT_METRICS, ...featuredIcon, sizes: { ...DEFAULT_METRICS.sizes, ...featuredIcon?.sizes } };
}

// When the theme has no `palette.components.featuredIcon` fills, each falls back to its colour at the hover
// opacity.
function plateColor(theme: Theme, color: FeaturedIconColor): string {
    const components = theme.palette.components as
        { featuredIcon?: Partial<Record<`${FeaturedIconColor}Fill`, string>> } | undefined;
    const fill = components?.featuredIcon?.[`${color}Fill`];

    if (fill) {
        return fill;
    }

    const main = paletteMain(theme, color);

    return main ? alpha(main, theme.palette.action.hoverOpacity) : theme.palette.action.hover;
}

function glyphColor(theme: Theme, color: FeaturedIconColor): string {
    return paletteMain(theme, color) ?? theme.palette.action.active;
}

// A `color` the palette lacks (plain JavaScript, a Storybook control) falls back to the default colours.
function paletteMain(theme: Theme, color: FeaturedIconColor): string | undefined {
    if (color === 'default') {
        return undefined;
    }

    return (theme.palette as unknown as Partial<Record<string, { main?: string }>>)[color]?.main;
}

export interface FeaturedIconSlotProps {
    /** The circle behind the glyph. */
    plate?: { sx?: SxProps<Theme> };
}

export interface FeaturedIconProps extends Omit<CommonComponentProps, 'children'>, WithRootDataTestIdOverride {
    /**
     * The glyph: a lucide icon, as `RingLucideIcon` takes it, or a ready element such as an MUI icon.
     * The component sizes it; leave its size unset.
     */
    icon: LucideIcon | ReactElement;
    /**
     * `small`, `medium` and `large` are fixed plates of 40, 60 and 80 px, for an icon in a layout such as an empty
     * state or an upload area. `inherit` fills its parent, with a plate of half the parent's shorter side (40–120 px).
     * @default 'medium'
     */
    size?: FeaturedIconSize;
    /**
     * Colour of the plate and the glyph.
     * @default 'default'
     */
    color?: FeaturedIconColor;
    /** Props of the inner elements. */
    slotProps?: FeaturedIconSlotProps;
}

/**
 * A glyph centred on a circular plate for places where content is missing, such as an empty media frame, an empty
 * state or a drop area; the glyph is 40% of the plate and drawn with a 1 px stroke under 24 px, overriding a
 * `strokeWidth` set on an `icon` element. With `size="inherit"` the plate is half of the parent's shorter side
 * (40–120 px), so give the parent a width and a height; without them the plate stays at 40 px.
 */
export function FeaturedIcon(props: FeaturedIconProps): React.JSX.Element {
    const {
        icon,
        size = 'medium',
        color = 'default',
        slotProps,
        className,
        sx,
        dataTestIdSuffix,
        dataTestId: dataTestIdOverride,
        'data-testid': dataTestIdAttribute,
    } = props;
    const generatedDataTestId = useRingDataTestId('FeaturedIcon', dataTestIdSuffix);
    const dataTestId = resolveRootDataTestId(
        { dataTestId: dataTestIdOverride, 'data-testid': dataTestIdAttribute },
        generatedDataTestId,
    );
    // A missing icon (plain JavaScript, a cleared Storybook control) leaves an empty plate instead of failing the
    // whole tree in `RingLucideIcon`.
    const glyph = isValidElement(icon) ? icon : icon ? <RingLucideIcon icon={icon} fontSize="inherit" /> : null;
    const plateSx = slotProps?.plate?.sx;
    const fixedSize = size === 'inherit' ? undefined : size;

    return (
        <Box
            data-testid={dataTestId}
            className={classNames('ring-featuredicon', className)}
            sx={[
                (theme: Theme): object => {
                    const { sizes, plateMin } = metricsOf(theme);

                    return {
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        ...(fixedSize === undefined
                            ? {
                                  // The box the icon fills is the size container the plate is measured against.
                                  containerType: 'size',
                                  width: '100%',
                                  height: '100%',
                                  // A parent without a height would collapse a size container to nothing.
                                  minWidth: plateMin,
                                  minHeight: plateMin,
                              }
                            : { width: sizes[fixedSize], height: sizes[fixedSize], flexShrink: 0 }),
                    };
                },
                ...(Array.isArray(sx) ? sx : sx ? [sx] : []),
            ]}
        >
            <Box
                aria-hidden={true}
                sx={[
                    (theme: Theme): object => {
                        const {
                            sizes,
                            plateMin,
                            plateMax,
                            platePerShorterSide,
                            glyphPerPlate,
                            thinStrokeBelow,
                            thinStroke,
                        } = metricsOf(theme);
                        const fixedGlyph = fixedSize === undefined ? undefined : sizes[fixedSize] * glyphPerPlate;
                        const thinStrokeWidth = `${thinStroke}px`;
                        // The glyph is `platePerShorterSide × glyphPerPlate` of the shorter side, so it drops
                        // below `thinStrokeBelow` exactly when the shorter side drops below this.
                        const thinBelowSide = thinStrokeBelow / (platePerShorterSide * glyphPerPlate);

                        return {
                            fontSize:
                                fixedGlyph !== undefined
                                    ? `${fixedGlyph}px`
                                    : `clamp(${plateMin * glyphPerPlate}px, ${platePerShorterSide * glyphPerPlate * 100}cqmin, ${plateMax * glyphPerPlate}px)`,
                            width: `${1 / glyphPerPlate}em`,
                            height: `${1 / glyphPerPlate}em`,
                            flexShrink: 0,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            borderRadius: '50%',
                            backgroundColor: plateColor(theme, color),
                            color: glyphColor(theme, color),
                            lineHeight: 0,
                            // `font-size: inherit` sizes a `RingLucideIcon` wrapper (24 px by default) and an MUI
                            // icon alike; the hidden gradient-definition svg next to the glyph stays 0 × 0.
                            '& > .ring-lucide-icon': { fontSize: 'inherit' },
                            '& svg:not(.ring-gradient-definition)': {
                                width: '1em',
                                height: '1em',
                                fontSize: 'inherit',
                                flexShrink: 0,
                                ...(fixedGlyph !== undefined && fixedGlyph < thinStrokeBelow
                                    ? { strokeWidth: thinStrokeWidth }
                                    : {}),
                            },
                            ...(fixedGlyph === undefined && {
                                [`@container (max-width: ${thinBelowSide - 0.02}px) or (max-height: ${thinBelowSide - 0.02}px)`]:
                                    { '& svg:not(.ring-gradient-definition)': { strokeWidth: thinStrokeWidth } },
                            }),
                        };
                    },
                    ...(Array.isArray(plateSx) ? plateSx : plateSx ? [plateSx] : []),
                ]}
            >
                {glyph}
            </Box>
        </Box>
    );
}
