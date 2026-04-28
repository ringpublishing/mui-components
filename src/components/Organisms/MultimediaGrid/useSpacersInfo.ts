import { useMemo } from 'react';
import { isSpacerItem } from './gridHelpers.js';

interface SpacersInfo {
    /**
     * Indicates if the first item in the collection is a spacer
     */
    isFirstItemSpacer: boolean;
    /**
     * Total number of spacers in the collection
     */
    spacersCount: number;
}

/**
 * Hook that returns information about spacers in the MultimediaGrid items collection
 *
 * @param items Collection of items to analyze
 * @returns Object containing information about spacers
 */
export const useSpacersInfo = (items: ReadonlyArray<unknown>): SpacersInfo => {
    return useMemo((): SpacersInfo => {
        if (!items || items.length === 0) {
            return {
                isFirstItemSpacer: false,
                spacersCount: 0,
            };
        }

        const isFirstItemSpacer = isSpacerItem(items[0]);

        const spacersCount = items.reduce((count: number, item) => {
            return isSpacerItem(item) ? count + 1 : count;
        }, 0);

        return {
            isFirstItemSpacer,
            spacersCount,
        };
    }, [items]);
};
