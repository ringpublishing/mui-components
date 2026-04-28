import { renderHook, act } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { useScrollToActiveCard } from '../../../../src/components/Organisms/MultimediaGrid/useScrollToActiveCard.js';
import type { VirtualRow } from '../../../../src/components/Organisms/MultimediaGrid/gridHelpers.js';

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const createMockApiRef = (activeCardId: string | number | null) => ({
    current: {
        getActiveCardId: vi.fn(() => activeCardId),
    },
});

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const createMockVirtualizer = () => ({
    getOffsetForIndex: vi.fn((index: number) => [index * 100]),
    scrollToIndex: vi.fn(),
});

const createMockVirtualRows = (itemsPerRow: Array<Array<{ id: string | number }>>): VirtualRow[] =>
    itemsPerRow.map((rowItems, index) => ({
        index,
        type: 'item' as const,
        items: rowItems.map((item) => ({ id: item.id })) as VirtualRow['items'],
        columns: rowItems.length,
    }));

describe('useScrollToActiveCard - scroll to active card on container width change', () => {
    beforeEach(() => {
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it('should scroll to active card after 600ms debounce when container width changes', () => {
        const activeCardId = 'card-5';
        const apiRef = createMockApiRef(activeCardId);
        const virtualizer = createMockVirtualizer();
        const virtualRows = createMockVirtualRows([
            [{ id: 'card-1' }, { id: 'card-2' }],
            [{ id: 'card-3' }, { id: 'card-4' }],
            [{ id: 'card-5' }, { id: 'card-6' }], // Active card is in row index 2
        ]);

        const { rerender } = renderHook(
            ({ containerWidth }) =>
                useScrollToActiveCard(
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    apiRef as any,
                    containerWidth,
                    virtualRows,
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    virtualizer as any,
                ),
            { initialProps: { containerWidth: 800 } },
        );

        // Change container width to trigger scroll
        rerender({ containerWidth: 1000 });

        // Before debounce timeout - scrollToIndex should not be called yet
        expect(virtualizer.scrollToIndex).not.toHaveBeenCalled();

        // Advance timers by 600ms (debounce delay)
        act(() => {
            vi.advanceTimersByTime(600);
        });

        // After debounce - scrollToIndex should be called with correct row index
        expect(virtualizer.scrollToIndex).toHaveBeenCalledTimes(1);
        expect(virtualizer.scrollToIndex).toHaveBeenCalledWith(2, { align: 'start', behavior: 'smooth' });
    });

    it('should NOT scroll when container width does not change', () => {
        const activeCardId = 'card-3';
        const apiRef = createMockApiRef(activeCardId);
        const virtualizer = createMockVirtualizer();
        const virtualRows = createMockVirtualRows([
            [{ id: 'card-1' }, { id: 'card-2' }],
            [{ id: 'card-3' }, { id: 'card-4' }],
        ]);

        const { rerender } = renderHook(
            ({ containerWidth }) =>
                useScrollToActiveCard(
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    apiRef as any,
                    containerWidth,
                    virtualRows,
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    virtualizer as any,
                ),
            { initialProps: { containerWidth: 800 } },
        );

        // Rerender with same width
        rerender({ containerWidth: 800 });

        act(() => {
            vi.advanceTimersByTime(600);
        });

        // scrollToIndex should not be called since width didn't change
        expect(virtualizer.scrollToIndex).not.toHaveBeenCalled();
    });

    it('should NOT scroll when there is no active card', () => {
        const apiRef = createMockApiRef(null); // No active card
        const virtualizer = createMockVirtualizer();
        const virtualRows = createMockVirtualRows([
            [{ id: 'card-1' }, { id: 'card-2' }],
            [{ id: 'card-3' }, { id: 'card-4' }],
        ]);

        const { rerender } = renderHook(
            ({ containerWidth }) =>
                useScrollToActiveCard(
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    apiRef as any,
                    containerWidth,
                    virtualRows,
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    virtualizer as any,
                ),
            { initialProps: { containerWidth: 800 } },
        );

        // Change container width
        rerender({ containerWidth: 1000 });

        act(() => {
            vi.advanceTimersByTime(600);
        });

        // scrollToIndex should not be called when no active card
        expect(virtualizer.scrollToIndex).not.toHaveBeenCalled();
    });

    it('should NOT scroll when virtualRows array is empty', () => {
        const activeCardId = 'card-1';
        const apiRef = createMockApiRef(activeCardId);
        const virtualizer = createMockVirtualizer();
        const virtualRows: VirtualRow[] = [];

        const { rerender } = renderHook(
            ({ containerWidth }) =>
                useScrollToActiveCard(
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    apiRef as any,
                    containerWidth,
                    virtualRows,
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    virtualizer as any,
                ),
            { initialProps: { containerWidth: 800 } },
        );

        rerender({ containerWidth: 1000 });

        act(() => {
            vi.advanceTimersByTime(600);
        });

        expect(virtualizer.scrollToIndex).not.toHaveBeenCalled();
    });

    it('should NOT scroll when apiRef.current is null', () => {
        const apiRef = { current: null };
        const virtualizer = createMockVirtualizer();
        const virtualRows = createMockVirtualRows([[{ id: 'card-1' }, { id: 'card-2' }]]);

        const { rerender } = renderHook(
            ({ containerWidth }) =>
                useScrollToActiveCard(
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    apiRef as any,
                    containerWidth,
                    virtualRows,
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    virtualizer as any,
                ),
            { initialProps: { containerWidth: 800 } },
        );

        rerender({ containerWidth: 1000 });

        act(() => {
            vi.advanceTimersByTime(600);
        });

        expect(virtualizer.scrollToIndex).not.toHaveBeenCalled();
    });

    it('should clear debounce timeout on unmount', () => {
        const clearTimeoutSpy = vi.spyOn(global, 'clearTimeout');
        const activeCardId = 'card-1';
        const apiRef = createMockApiRef(activeCardId);
        const virtualizer = createMockVirtualizer();
        const virtualRows = createMockVirtualRows([[{ id: 'card-1' }, { id: 'card-2' }]]);

        const { rerender, unmount } = renderHook(
            ({ containerWidth }) =>
                useScrollToActiveCard(
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    apiRef as any,
                    containerWidth,
                    virtualRows,
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    virtualizer as any,
                ),
            { initialProps: { containerWidth: 800 } },
        );

        // Trigger debounce by changing width
        rerender({ containerWidth: 1000 });

        // Unmount before debounce completes
        unmount();

        // clearTimeout should have been called during cleanup
        expect(clearTimeoutSpy).toHaveBeenCalled();

        clearTimeoutSpy.mockRestore();
    });

    it('should NOT scroll again if offset has not changed', () => {
        const activeCardId = 'card-3';
        const apiRef = createMockApiRef(activeCardId);
        const virtualizer = createMockVirtualizer();
        const virtualRows = createMockVirtualRows([
            [{ id: 'card-1' }, { id: 'card-2' }],
            [{ id: 'card-3' }, { id: 'card-4' }],
        ]);

        const { rerender } = renderHook(
            ({ containerWidth }) =>
                useScrollToActiveCard(
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    apiRef as any,
                    containerWidth,
                    virtualRows,
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    virtualizer as any,
                ),
            { initialProps: { containerWidth: 800 } },
        );

        // First width change
        rerender({ containerWidth: 1000 });
        act(() => {
            vi.advanceTimersByTime(600);
        });

        expect(virtualizer.scrollToIndex).toHaveBeenCalledTimes(1);

        // Second width change - same offset returned by getOffsetForIndex
        rerender({ containerWidth: 1200 });
        act(() => {
            vi.advanceTimersByTime(600);
        });

        // Should not scroll again since offset is the same
        expect(virtualizer.scrollToIndex).toHaveBeenCalledTimes(1);
    });

    it('should find active card in correct row when cards are spread across multiple rows', () => {
        const activeCardId = 'card-7';
        const apiRef = createMockApiRef(activeCardId);
        const virtualizer = createMockVirtualizer();
        const virtualRows = createMockVirtualRows([
            [{ id: 'card-1' }, { id: 'card-2' }, { id: 'card-3' }],
            [{ id: 'card-4' }, { id: 'card-5' }, { id: 'card-6' }],
            [{ id: 'card-7' }, { id: 'card-8' }, { id: 'card-9' }], // Active card in row 2
            [{ id: 'card-10' }],
        ]);

        const { rerender } = renderHook(
            ({ containerWidth }) =>
                useScrollToActiveCard(
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    apiRef as any,
                    containerWidth,
                    virtualRows,
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    virtualizer as any,
                ),
            { initialProps: { containerWidth: 800 } },
        );

        rerender({ containerWidth: 1000 });

        act(() => {
            vi.advanceTimersByTime(600);
        });

        // Should scroll to row index 2 where card-7 is located
        expect(virtualizer.scrollToIndex).toHaveBeenCalledWith(2, { align: 'start', behavior: 'smooth' });
    });
});
