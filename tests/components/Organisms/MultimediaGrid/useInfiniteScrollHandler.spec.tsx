import { renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { useInfiniteScrollHandler } from '../../../../src/components/Organisms/MultimediaGrid/useVirtualizerHandlers.js';

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const createMockVirtualizer = (count: number, maxVisibleIndex: number) => ({
    options: { count },
    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    getVirtualItems: () => [{ index: maxVisibleIndex }],
});

describe('useInfiniteScrollHandler - infinite scroll reset after filtering bug', () => {
    it('should reset lastLoadedIndex when items array changes (filtering scenario)', () => {
        const onLoadMore = vi.fn();
        const initialItems = Array.from({ length: 100 }, (unused, i) => ({ id: i }));

        const { result, rerender } = renderHook(
            ({ items }) =>
                useInfiniteScrollHandler(
                    {
                        onLoadMore,
                        hasMore: true,
                        loading: false,
                    },
                    items,
                ),
            { initialProps: { items: initialItems } },
        );

        // User scrolls to end and triggers load more
        const virtualizer = createMockVirtualizer(100, 99);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        result.current(virtualizer as any, false);

        expect(onLoadMore).toHaveBeenCalledTimes(1);
        onLoadMore.mockClear();

        // User applies filter - gets new, smaller dataset (the bug scenario)
        const filteredItems = Array.from({ length: 20 }, (unused, i) => ({ id: i + 1000 }));
        rerender({ items: filteredItems });

        // After filtering, infinite scroll should work again (this was the bug)
        const filteredVirtualizer = createMockVirtualizer(20, 19);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        result.current(filteredVirtualizer as any, false);

        expect(onLoadMore).toHaveBeenCalledTimes(1);
    });

    it('should call onLoadMore when reaching end of list (basic functionality)', () => {
        const onLoadMore = vi.fn();
        const items = Array.from({ length: 10 }, (unused, i) => ({ id: i }));

        const { result } = renderHook(() =>
            useInfiniteScrollHandler(
                {
                    onLoadMore,
                    hasMore: true,
                    loading: false,
                },
                items,
            ),
        );

        const virtualizer = createMockVirtualizer(10, 9);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        result.current(virtualizer as any, false);

        expect(onLoadMore).toHaveBeenCalledTimes(1);
    });

    it('should not call onLoadMore when loading or hasMore is false', () => {
        const onLoadMore = vi.fn();
        const items = Array.from({ length: 10 }, (unused, i) => ({ id: i }));

        const { result: resultLoading } = renderHook(() =>
            useInfiniteScrollHandler(
                {
                    onLoadMore,
                    hasMore: true,
                    loading: true,
                },
                items,
            ),
        );

        const virtualizer = createMockVirtualizer(10, 9);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        resultLoading.current(virtualizer as any, false);
        expect(onLoadMore).not.toHaveBeenCalled();

        const { result: resultNoMore } = renderHook(() =>
            useInfiniteScrollHandler(
                {
                    onLoadMore,
                    hasMore: false,
                    loading: false,
                },
                items,
            ),
        );

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        resultNoMore.current(virtualizer as any, false);
        expect(onLoadMore).not.toHaveBeenCalled();
    });
});
