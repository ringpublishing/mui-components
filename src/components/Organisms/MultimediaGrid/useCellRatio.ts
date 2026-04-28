import { ResponsiveValue, BreakpointValue } from './multimediaGrid.types.js';
import { resolveResponsiveValue } from './useSpacing.js';

export const DEFAULT_CELL_RATIO = {
    xs: '4/5',
    sm: '3/4',
    md: '3/4',
    lg: '4/5',
};

export function useCellRatio(
    cellRatio: ResponsiveValue<string> | undefined,
    currentBreakpoint: BreakpointValue,
): number {
    const cellRatioString =
        cellRatio === undefined
            ? DEFAULT_CELL_RATIO[currentBreakpoint]
            : resolveResponsiveValue(cellRatio, currentBreakpoint, DEFAULT_CELL_RATIO[currentBreakpoint]);

    const [width, height] = cellRatioString.split('/').map(Number);

    if (isNaN(width) || isNaN(height) || width === 0) {
        console.warn(`Invalid cell ratio: ${cellRatioString}, using default 1/1`);

        return 1; // 1/1 aspect ratio
    }

    return height / width;
}
