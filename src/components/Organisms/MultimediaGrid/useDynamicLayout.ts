import { useMemo } from 'react';
import { calculateOptimalRectangleLayout, RectangleLayout } from './calculateOptimalLayout.js';

export function useDynamicLayout(
    enabled: boolean,
    containerWidth: number,
    cardWidth = 200,
    cardHeight = 300,
    columnGap = 0,
): RectangleLayout | null {
    return useMemo(() => {
        if (!enabled || containerWidth === 0) {
            return null;
        }

        const validColumnGap = typeof columnGap === 'number' && !Number.isNaN(columnGap) ? columnGap : 0;

        if (validColumnGap !== columnGap) {
            console.warn('Dynamic layout: invalid columnGap, falling back to 0');
        }

        try {
            return calculateOptimalRectangleLayout(containerWidth, cardWidth, cardHeight, validColumnGap);
        } catch (error) {
            console.warn('Dynamic layout calculation failed:', error);

            return null;
        }
    }, [enabled, containerWidth, cardWidth, cardHeight, columnGap]);
}
