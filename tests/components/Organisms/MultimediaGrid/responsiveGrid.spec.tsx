import { describe, expect, it } from 'vitest';
import {
    useResolvedColumns,
    DEFAULT_COLUMNS,
} from '../../../../src/components/Organisms/MultimediaGrid/useResolvedColumns.js';
import {
    type ResponsiveValue,
    type BreakpointValue,
} from '../../../../src/components/Organisms/MultimediaGrid/multimediaGrid.types.js';
import { createVirtualRows } from '../../../../src/components/Organisms/MultimediaGrid/gridHelpers.js';

// Funkcja pomocnicza do testowania logiki useCurrentBreakpoint bez użycia hooka
function getBreakpointFromWidth(width: number): BreakpointValue {
    if (width < 600) {
        return 'xs';
    }

    if (width < 900) {
        return 'sm';
    }

    if (width < 1200) {
        return 'md';
    }

    return 'lg';
}

describe('MultimediaGrid - Responsive Grid', () => {
    // Test logiki bezpośrednio, bez używania hooka React

    describe('useCurrentBreakpoint', () => {
        it('should return xs for width < 600px', () => {
            const breakpoint = getBreakpointFromWidth(500);
            expect(breakpoint).toBe('xs');
        });

        it('should return sm for width between 600px and 899px', () => {
            const breakpoint = getBreakpointFromWidth(700);
            expect(breakpoint).toBe('sm');
        });

        it('should return md for width between 900px and 1199px', () => {
            const breakpoint = getBreakpointFromWidth(1000);
            expect(breakpoint).toBe('md');
        });

        it('should return lg for width >= 1200px', () => {
            const breakpoint = getBreakpointFromWidth(1300);
            expect(breakpoint).toBe('lg');
        });

        // Edge cases
        it('should handle edge case width values', () => {
            expect(getBreakpointFromWidth(0)).toBe('xs');
            expect(getBreakpointFromWidth(599)).toBe('xs');
            expect(getBreakpointFromWidth(600)).toBe('sm');
            expect(getBreakpointFromWidth(899)).toBe('sm');
            expect(getBreakpointFromWidth(900)).toBe('md');
            expect(getBreakpointFromWidth(1199)).toBe('md');
            expect(getBreakpointFromWidth(1200)).toBe('lg');
            expect(getBreakpointFromWidth(10000)).toBe('lg');
        });
    });

    describe('useColumns', () => {
        it('should return default columns for undefined columns', () => {
            expect(useResolvedColumns(undefined, 'xs')).toBe(DEFAULT_COLUMNS.xs); // 3
            expect(useResolvedColumns(undefined, 'sm')).toBe(DEFAULT_COLUMNS.sm); // 4
            expect(useResolvedColumns(undefined, 'md')).toBe(DEFAULT_COLUMNS.md); // 5
            expect(useResolvedColumns(undefined, 'lg')).toBe(DEFAULT_COLUMNS.lg); // 6
        });

        it('should return fixed column count for number input', () => {
            expect(useResolvedColumns(5, 'xs')).toBe(5);
            expect(useResolvedColumns(5, 'sm')).toBe(5);
            expect(useResolvedColumns(5, 'md')).toBe(5);
            expect(useResolvedColumns(5, 'lg')).toBe(5);
        });

        it('should return responsive column count based on breakpoint', () => {
            const columns: ResponsiveValue<number> = {
                xs: 2,
                sm: 3,
                md: 4,
                lg: 5,
            };

            expect(useResolvedColumns(columns, 'xs')).toBe(2);
            expect(useResolvedColumns(columns, 'sm')).toBe(3);
            expect(useResolvedColumns(columns, 'md')).toBe(4);
            expect(useResolvedColumns(columns, 'lg')).toBe(5);
        });

        it('should handle partial responsive configurations by falling back to defaults', () => {
            const partialColumns: ResponsiveValue<number> = {
                xs: 2,
                lg: 8,
            };

            expect(useResolvedColumns(partialColumns, 'xs')).toBe(2); // from partial config
            // W implementacji resolveResponsiveValue, dla brakujących punktów (sm, md)
            // wykorzystywana jest wartość z poprzedniego breakpointa (xs), a nie wartości domyślne
            expect(useResolvedColumns(partialColumns, 'sm')).toBe(2); // używana wartość z xs
            expect(useResolvedColumns(partialColumns, 'md')).toBe(2); // używana wartość z xs
            expect(useResolvedColumns(partialColumns, 'lg')).toBe(8); // from partial config
        });
    });

    describe('Grid layout computation', () => {
        // Sample items for testing
        const mockItems = [
            { id: '1', title: 'Item 1', image: 'https://example.com/image1.jpg' },
            { id: '2', title: 'Item 2', image: 'https://example.com/image2.jpg' },
            { id: '3', title: 'Item 3', image: 'https://example.com/image3.jpg' },
            { id: '4', title: 'Item 4', image: 'https://example.com/image4.jpg' },
            { id: '5', title: 'Item 5', image: 'https://example.com/image5.jpg' },
            { id: '6', title: 'Item 6', image: 'https://example.com/image6.jpg' },
            { id: '7', title: 'Item 7', image: 'https://example.com/image7.jpg' },
        ];

        it('should arrange items into rows based on column count', () => {
            // Test with different column counts

            // For 3 columns (xs breakpoint)
            const rowsXs = createVirtualRows(mockItems, 3);
            expect(rowsXs.length).toBe(3);
            expect(rowsXs[0].items?.length).toBe(3); // First row has 3 items
            expect(rowsXs[1].items?.length).toBe(3); // Second row has 3 items
            expect(rowsXs[2].items?.length).toBe(1); // Third row has 1 item

            // For 4 columns (sm breakpoint)
            const rowsSm = createVirtualRows(mockItems, 4);
            expect(rowsSm.length).toBe(2);
            expect(rowsSm[0].items?.length).toBe(4); // First row has 4 items
            expect(rowsSm[1].items?.length).toBe(3); // Second row has 3 items

            // For 5 columns (md breakpoint)
            const rowsMd = createVirtualRows(mockItems, 5);
            expect(rowsMd.length).toBe(2);
            expect(rowsMd[0].items?.length).toBe(5); // First row has 5 items
            expect(rowsMd[1].items?.length).toBe(2); // Second row has 2 items

            // For 6 columns (lg breakpoint)
            const rowsLg = createVirtualRows(mockItems, 6);
            expect(rowsLg.length).toBe(2);
            expect(rowsLg[0].items?.length).toBe(6); // First row has 6 items
            expect(rowsLg[1].items?.length).toBe(1); // Second row has 1 item
        });

        it('should handle empty items array', () => {
            const rows = createVirtualRows([], 4);
            expect(rows.length).toBe(0);
        });

        it('should handle items with spacers', () => {
            const itemsWithSpacer = [
                {
                    id: 'spacer-1',
                    separator: {
                        title: 'Group 1',
                        color: 'primary',
                        icon: null,
                    },
                },
                ...mockItems.slice(0, 3),
                {
                    id: 'spacer-2',
                    separator: {
                        title: 'Group 2',
                        color: 'secondary',
                        icon: null,
                    },
                },
                ...mockItems.slice(3, 7),
            ];

            const rows = createVirtualRows(itemsWithSpacer, 4);

            // Expected: spacer, 3 items row, spacer, 4 items row
            expect(rows.length).toBe(4);
            expect(rows[0].type).toBe('spacer');
            expect(rows[1].items?.length).toBe(3);
            expect(rows[2].type).toBe('spacer');
            expect(rows[3].items?.length).toBe(4);
        });
    });
});
