import { useMemo } from 'react';
import { useTheme } from '@mui/material/styles';
import { ResponsiveValue, BreakpointValue } from './multimediaGrid.types.js';
import { pixelsToNumber } from './gridHelpers.js';

export function resolveResponsiveValue<T>(
    value: ResponsiveValue<T> | undefined,
    currentBreakpoint: BreakpointValue,
    defaultValue: T,
): T {
    if (value === undefined) {
        return defaultValue;
    }

    if (typeof value !== 'object' || value === null) {
        return value as T;
    }

    const breakpointOrder: BreakpointValue[] = ['xs', 'sm', 'md', 'lg'];
    const currentIndex = breakpointOrder.indexOf(currentBreakpoint);

    for (let i = currentIndex; i >= 0; i--) {
        const bp = breakpointOrder[i];
        const responsiveObj = value as Partial<Record<BreakpointValue, T>>;

        if (responsiveObj[bp] !== undefined) {
            return responsiveObj[bp] as T;
        }
    }

    return defaultValue;
}

export function resolveSpacing(
    spacing: ResponsiveValue<number> | undefined,
    rowSpacing: ResponsiveValue<number> | undefined,
    columnSpacing: ResponsiveValue<number> | undefined,
    currentBreakpoint: BreakpointValue,
    defaultSpacing = 1,
): { row: number; column: number } {
    const resolvedSpacing = resolveResponsiveValue(spacing, currentBreakpoint, defaultSpacing);
    const resolvedRowSpacing = resolveResponsiveValue(rowSpacing, currentBreakpoint, resolvedSpacing);
    const resolvedColumnSpacing = resolveResponsiveValue(columnSpacing, currentBreakpoint, resolvedSpacing);

    return {
        row: resolvedRowSpacing,
        column: resolvedColumnSpacing,
    };
}

export function useSpacing(
    spacing: ResponsiveValue<number> | undefined,
    rowSpacing: ResponsiveValue<number> | undefined,
    columnSpacing: ResponsiveValue<number> | undefined,
    currentBreakpoint: BreakpointValue,
): { row: number; column: number } {
    const theme = useTheme();

    return useMemo(() => {
        const defaultSpacing = 1;
        const resolved = resolveSpacing(spacing, rowSpacing, columnSpacing, currentBreakpoint, defaultSpacing);
        const themeRowSpacing = theme.spacing(resolved.row);
        const themeColumnSpacing = theme.spacing(resolved.column);

        return {
            row: typeof themeRowSpacing === 'number' ? themeRowSpacing : pixelsToNumber(themeRowSpacing),
            column: typeof themeColumnSpacing === 'number' ? themeColumnSpacing : pixelsToNumber(themeColumnSpacing),
        };
    }, [spacing, rowSpacing, columnSpacing, currentBreakpoint, theme]);
}
