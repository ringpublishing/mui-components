import { useMemo } from 'react';
import { BreakpointValue } from './multimediaGrid.types.js';

interface ContainerBreakpoints {
    xs: number;
    sm: number;
    md: number;
    lg: number;
}

const CONTAINER_BREAKPOINTS: ContainerBreakpoints = {
    xs: 0,
    sm: 600,
    md: 900,
    lg: 1200,
};

export function useCurrentBreakpoint(containerWidth: number): BreakpointValue {
    return useMemo(() => {
        const getBreakpointFromWidth = (width: number, breakpoints: ContainerBreakpoints): BreakpointValue => {
            if (width < breakpoints.sm) {
                return 'xs';
            }

            if (width < breakpoints.md) {
                return 'sm';
            }

            if (width < breakpoints.lg) {
                return 'md';
            }

            return 'lg';
        };

        return getBreakpointFromWidth(containerWidth, CONTAINER_BREAKPOINTS);
    }, [containerWidth]);
}
