import React, { useId } from 'react';
import { Box, type SvgIconProps, type SxProps, type Theme, useTheme } from '@mui/material';
import { alpha, decomposeColor } from '@mui/material/styles';
import classNames from 'classnames';
import { useLucideContext, type LucideIcon, type LucideProps } from 'lucide-react';
import { RING_LUCIDE_PALETTE_COLORS } from '@ringpublishing/mui-theme';
import { getAbsoluteStrokeWidth, getLucideFontSize } from './lucideSize.js';

/** Colours `RingLucideIcon` accepts: the MUI icon colours plus `ai`. */
export type RingLucideIconColor = SvgIconProps['color'] | 'ai';

export interface RingLucideIconProps extends Omit<React.HTMLAttributes<HTMLSpanElement>, 'color'> {
    icon: LucideIcon;
    color?: RingLucideIconColor;
    iconProps?: Omit<LucideProps, 'color' | 'size' | 'stroke'>;
    fontSize?: SvgIconProps['fontSize'];
    sx?: SxProps<Theme>;
    strokeWidth?: number;
    absoluteStrokeWidth?: boolean;
}

/** Resolves a dotted palette path such as `error.main`; anything else is returned as given. */
export function resolvePaletteColor(theme: Theme, color: string): string {
    const paletteColor = color
        .split('.')
        .reduce<unknown>((value, key) => (value as Record<string, unknown> | undefined)?.[key], theme.palette);

    return typeof paletteColor === 'string' ? paletteColor : color;
}

function getColorStyles(theme: Theme, color: string): { color: string; opacity?: number } {
    const resolvedColor = resolvePaletteColor(theme, color);

    try {
        const { type, values } = decomposeColor(resolvedColor);
        const alphaIndex = type.endsWith('a') ? values.length - 1 : -1;
        const opacity = alphaIndex === -1 ? 1 : Number(values[alphaIndex]);

        return opacity < 1 ? { color: alpha(resolvedColor, 1), opacity } : { color: resolvedColor };
    } catch {
        return { color: resolvedColor };
    }
}

export const RingLucideIcon = React.forwardRef<HTMLSpanElement, RingLucideIconProps>(
    (props, ref): React.JSX.Element => {
        const {
            icon: Icon,
            color = 'inherit',
            iconProps,
            fontSize = 'medium',
            sx,
            strokeWidth,
            absoluteStrokeWidth,
            className,
            ...otherProps
        } = props;
        const theme = useTheme();
        // This icon renders at `size="1em"` and is scaled with CSS, so lucide's `absoluteStrokeWidth`
        // cannot work on it: lucide computes it as `strokeWidth * 24 / Number(size)`, and
        // `Number('1em')` is `NaN`. The context is therefore read here and the final thickness is
        // handed to lucide as a plain number — see `getAbsoluteStrokeWidth`.
        const { strokeWidth: contextStrokeWidth = 2, absoluteStrokeWidth: contextAbsoluteStrokeWidth = false } =
            useLucideContext() ?? {};
        const resolvedStrokeWidth = Number(strokeWidth ?? contextStrokeWidth);
        const resolvedAbsoluteStrokeWidth = absoluteStrokeWidth ?? contextAbsoluteStrokeWidth;
        const renderedStrokeWidth = resolvedAbsoluteStrokeWidth
            ? getAbsoluteStrokeWidth(resolvedStrokeWidth, fontSize)
            : resolvedStrokeWidth;
        const gradientId = `ring-gradient-${useId().replace(/[^a-zA-Z0-9_-]/g, '')}`;
        const resolvedColor =
            color === 'inherit'
                ? 'inherit'
                : color === 'ai'
                  ? 'ai.main'
                  : (RING_LUCIDE_PALETTE_COLORS[color as keyof typeof RING_LUCIDE_PALETTE_COLORS] ?? color);
        const isAi = color === 'ai';
        const gradientDefinition = theme.palette.gradients?.ai;
        const isGradient = isAi;

        return (
            <Box
                ref={ref}
                component="span"
                className={classNames('ring-lucide-icon', className)}
                sx={[
                    {
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        lineHeight: 0,
                        verticalAlign: 'middle',
                        flexShrink: 0,
                        color: (theme) => getColorStyles(theme, resolvedColor).color,
                        fontSize: getLucideFontSize(fontSize),
                        opacity: (theme) => getColorStyles(theme, resolvedColor).opacity,
                        '& > svg:not(.ring-gradient-definition)': {
                            width: '1em',
                            height: '1em',
                            flexShrink: 0,
                            display: 'block',
                            fill: 'none',
                        },
                        '& > svg:not(.ring-gradient-definition) *': {
                            stroke: isGradient ? `url(#${gradientId}) !important` : 'currentColor',
                        },
                    },
                    ...(Array.isArray(sx) ? sx : sx ? [sx] : []),
                ]}
                {...otherProps}
            >
                {isGradient && (
                    <svg className="ring-gradient-definition" width="0" height="0" aria-hidden="true">
                        <defs>
                            <linearGradient
                                id={gradientId}
                                gradientUnits="userSpaceOnUse"
                                x1="0"
                                y1="0"
                                x2="24"
                                y2="24"
                            >
                                <stop offset="0%" stopColor={gradientDefinition?.stops.start} />
                                <stop offset="50%" stopColor={gradientDefinition?.stops.mid} />
                                <stop offset="100%" stopColor={gradientDefinition?.stops.end} />
                            </linearGradient>
                        </defs>
                    </svg>
                )}
                <Icon
                    size="1em"
                    color="currentColor"
                    strokeWidth={renderedStrokeWidth}
                    // Already compensated above; left on, lucide would redo the division against
                    // `size` and land on `NaN` whenever the context asks for an absolute stroke.
                    absoluteStrokeWidth={false}
                    // A caller asking for an absolute stroke has picked the other mechanism, so the
                    // pixel-pinned stroke from context is switched off rather than applied on top.
                    nonScalingStroke={resolvedAbsoluteStrokeWidth ? false : undefined}
                    {...iconProps}
                />
            </Box>
        );
    },
);

RingLucideIcon.displayName = 'RingLucideIcon';
