import { useEffect, useRef } from 'react';
import type { Virtualizer } from '@tanstack/react-virtual';
import { MediaGridApi } from './gridApi.js';
import { VirtualRow } from './gridHelpers.js';

/**
 * Hook to scroll to the active card when the container width changes.
 *
 * @param {MediaGridApi} apiRef - Reference to the MediaGrid API.
 * @param {number} containerWidth - Current width of the container.
 * @param {Array<VirtualRow>} virtualRows - Array of virtual rows in the grid.
 * @param {Virtualizer<HTMLElement, Element>} rowVirtualizer - Virtualizer instance for row virtualization.
 */
export function useScrollToActiveCard(
    apiRef: MediaGridApi,
    containerWidth: number,
    virtualRows: VirtualRow[],
    rowVirtualizer: Virtualizer<HTMLElement, Element>,
): void {
    const containerWidthRef = useRef<number>(containerWidth);
    const lastActiveCardOffsetRef = useRef<number | null>(null);
    const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        if (
            containerWidthRef.current === containerWidth ||
            !apiRef.current ||
            !rowVirtualizer ||
            virtualRows.length === 0
        ) {
            return;
        }

        containerWidthRef.current = containerWidth;

        const activeCardId = apiRef.current.getActiveCardId();

        if (activeCardId) {
            debounceTimeoutRef.current = setTimeout(() => {
                const rowIndex = virtualRows.findIndex(
                    (row) => row.type === 'item' && row.items?.some((item) => item.id === activeCardId),
                );

                if (rowIndex !== -1) {
                    const currentRowOffset = rowVirtualizer.getOffsetForIndex(rowIndex);

                    if (lastActiveCardOffsetRef.current !== currentRowOffset?.[0]) {
                        rowVirtualizer.scrollToIndex(rowIndex, { align: 'start', behavior: 'smooth' });
                        lastActiveCardOffsetRef.current = currentRowOffset?.[0] ?? null;
                    }
                }
            }, 600);
        }
    }, [apiRef, containerWidth, rowVirtualizer, virtualRows]);

    useEffect(() => {
        return () => {
            if (debounceTimeoutRef.current) {
                clearTimeout(debounceTimeoutRef.current);
                debounceTimeoutRef.current = null;
            }
        };
    }, []);
}
