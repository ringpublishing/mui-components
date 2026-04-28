import { useRef, useCallback, useEffect } from 'react';
import { Virtualizer } from '@tanstack/react-virtual';
import { MediaGridItemsProps } from './gridApi.js';

export interface InfiniteScrollOptions {
    onLoadMore?: () => void | Promise<void>;
    loading?: boolean;
    hasMore?: boolean;
}

export type VirtualizerChangeHandler = (instance: Virtualizer<HTMLElement, Element>, sync: boolean) => void;

export interface VirtualizerOnChangeConfig {
    handlers: VirtualizerChangeHandler[];
    onlyWhenScrollingStopped?: boolean;
}

export const useVirtualizerOnChange = (
    config: VirtualizerOnChangeConfig,
): ((instance: Virtualizer<HTMLElement, Element>, sync: boolean) => void) => {
    const { handlers, onlyWhenScrollingStopped = false } = config;

    return useCallback(
        (instance: Virtualizer<HTMLElement, Element>, sync: boolean) => {
            if (onlyWhenScrollingStopped && sync) {
                return;
            }

            handlers.forEach((handler) => {
                try {
                    handler(instance, sync);
                } catch (error) {
                    console.error('Error in virtualizer onChange handler:', error);
                }
            });
        },
        [handlers, onlyWhenScrollingStopped],
    );
};

export const useInfiniteScrollHandler = (
    options: InfiniteScrollOptions,
    items: MediaGridItemsProps,
): VirtualizerChangeHandler => {
    const { onLoadMore, loading = false, hasMore = true } = options;

    const lastLoadedIndexRef = useRef<number>(-1);
    const lastItemsLengthRef = useRef<number>(items.length);

    useEffect(() => {
        if (items.length !== lastItemsLengthRef.current) {
            lastLoadedIndexRef.current = -1;
            lastItemsLengthRef.current = items.length;
        }
    }, [items.length]);

    return useCallback(
        (virtualizer: Virtualizer<HTMLElement, Element>) => {
            if (!hasMore || !virtualizer) {
                return;
            }

            const virtualItems = virtualizer.getVirtualItems();

            if (virtualItems.length === 0) {
                return;
            }

            const maxVisibleIndex = Math.max(...virtualItems.map((item) => item.index));

            if (maxVisibleIndex < 0) {
                return;
            }

            const hasNotLoadedForThisIndex = maxVisibleIndex > lastLoadedIndexRef.current;

            if (maxVisibleIndex >= virtualizer.options.count - 1 && hasNotLoadedForThisIndex && !loading) {
                lastLoadedIndexRef.current = maxVisibleIndex;
                onLoadMore?.();
            }
        },
        [hasMore, loading, onLoadMore],
    );
};
