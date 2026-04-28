import { useEffect, useRef } from 'react';
import { Virtualizer } from '@tanstack/react-virtual';

export interface InfiniteScrollOptions {
    /** Callback triggered when the user approaches the end of the list */
    onLoadMore?: () => void | Promise<void>;
    /** Whether data is currently being loaded */
    loading?: boolean;
    /** Whether there is more data to load */
    hasMore?: boolean;
}

export const useInfiniteScroll = (
    virtualizer: Virtualizer<Element, Element> | null,
    options: InfiniteScrollOptions,
    items: ReadonlyArray<Record<string, unknown>>,
): void => {
    const { onLoadMore, loading = false, hasMore = true } = options;

    const lastLoadedIndexRef = useRef<number>(-1);
    const lastItemsLengthRef = useRef<number>(items.length);

    useEffect(() => {
        if (items.length !== lastItemsLengthRef.current) {
            lastLoadedIndexRef.current = -1;
            lastItemsLengthRef.current = items.length;
        }
    }, [items.length]);

    useEffect(() => {
        if (!virtualizer) {
            return;
        }

        const virtualItems = virtualizer.getVirtualItems();

        if (virtualItems.length === 0) {
            return;
        }

        const maxVisibleIndex = Math.max(...virtualItems.map((item) => item.index));

        if (!maxVisibleIndex) {
            return;
        }

        const hasNotLoadedForThisIndex = maxVisibleIndex > lastLoadedIndexRef.current;

        if (maxVisibleIndex >= virtualizer.options.count - 1 && hasNotLoadedForThisIndex && hasMore && !loading) {
            lastLoadedIndexRef.current = maxVisibleIndex;
            onLoadMore?.();
        }
    }, [virtualizer, virtualizer?.getVirtualItems(), loading, hasMore, onLoadMore]);
};
