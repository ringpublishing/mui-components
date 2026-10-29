import { useMemo } from 'react';

/**
 * A single `data-testid` segment. Nullish and `false` segments are dropped, so
 * optional values can be passed straight through without a guard at the call site.
 */
export type RingDataTestIdSegment = string | number | null | undefined | false;

/**
 * Builds a `ring-<component>[-<segment>]...` test id, dropping any nullish or empty
 * segment. Use this outside of React components (render callbacks, cell renderers);
 * inside a component prefer {@link useRingDataTestId}.
 */
export function buildRingDataTestId(componentName: string, ...segments: RingDataTestIdSegment[]): string {
    const parts = [componentName, ...segments]
        .filter((segment) => segment !== null && segment !== undefined && segment !== false && segment !== '')
        .map((segment) => String(segment).toLowerCase());

    return `ring-${parts.join('-')}`;
}

export function useRingDataTestId(componentName: string, ...segments: RingDataTestIdSegment[]): string {
    return useMemo(
        () => buildRingDataTestId(componentName, ...segments),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [componentName, ...segments],
    );
}
