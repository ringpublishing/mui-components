import { ResponsiveValue, BreakpointValue } from './multimediaGrid.types.js';
import { resolveResponsiveValue } from './useSpacing.js';

export const DEFAULT_COLUMNS = {
    xs: 3,
    sm: 4,
    md: 5,
    lg: 6,
};

export function useResolvedColumns(
    columns: ResponsiveValue<number> | undefined,
    currentBreakpoint: BreakpointValue,
): number {
    if (columns === undefined) {
        return DEFAULT_COLUMNS[currentBreakpoint];
    }

    return resolveResponsiveValue(columns, currentBreakpoint, DEFAULT_COLUMNS[currentBreakpoint]);
}
