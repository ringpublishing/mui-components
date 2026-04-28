import { useMemo } from 'react';

export function useRingDataTestId(componentName: string, suffix?: string): string {
    return useMemo(
        () => `ring-${componentName.toLowerCase()}${suffix ? `-${suffix.toLowerCase()}` : ''}`,
        [componentName, suffix],
    );
}
