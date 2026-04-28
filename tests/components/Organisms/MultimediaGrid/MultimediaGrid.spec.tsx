import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import { beforeAll, describe, expect, it, vi } from 'vitest';
import { MultimediaGrid } from '../../../../src/index.js';
import { GridRowSelectionModel } from '@mui/x-data-grid-pro';

// Mock ResizeObserver which is not available in JSDOM
class ResizeObserverMock {
    public observe(): void {
        /* do nothing */
    }

    public unobserve(): void {
        /* do nothing */
    }

    public disconnect(): void {
        /* do nothing */
    }
}

describe('MultimediaGrid', () => {
    beforeAll(() => {
        global.ResizeObserver = ResizeObserverMock;
    });

    it('should render correctly with empty items', () => {
        const { container } = render(<MultimediaGrid items={[]} />);
        expect(container).toMatchSnapshot();
    });

    it('should render correctly with media items', () => {
        // Sample items with different types of data
        const items = [
            {
                id: '1',
                title: 'Sample Image 1',
                image: 'https://example.com/image1.jpg',
                fields: [{ value: 'Field 1' }, { value: 'Field 2' }],
            },
            {
                id: '2',
                title: 'Sample Image 2',
                image: 'https://example.com/image2.jpg',
                fields: [{ value: 'Field 3' }],
            },
            {
                id: '3',
                title: 'Sample Image 3 - No image',
                fields: [{ value: 'Field 4' }, { value: 'Field 5' }, { value: 'Field 6' }],
            },
        ];

        const { container } = render(<MultimediaGrid items={items} />);
        expect(container).toMatchSnapshot();
    });

    it('should render correctly with a spacer item', () => {
        const spacerItem = {
            spacer: { separator: 'Sample Separator' },
            id: 'spacer-1',
            __grid_spacer__: true,
        };
        const items = [
            spacerItem,
            {
                id: '1',
                title: 'Sample Image 1',
                image: 'https://example.com/image1.jpg',
            },
            {
                id: '2',
                title: 'Sample Image 2',
                image: 'https://example.com/image2.jpg',
            },
        ];

        const { container } = render(<MultimediaGrid items={items} />);
        expect(container).toMatchSnapshot();
    });

    it('should render toolbar when showRingToolbar is true', () => {
        const items = [
            {
                id: '1',
                title: 'Sample Image 1',
                image: 'https://example.com/image1.jpg',
            },
            {
                id: '2',
                title: 'Sample Image 2',
                image: 'https://example.com/image2.jpg',
            },
        ];

        const { container } = render(
            <MultimediaGrid
                items={items}
                showRingToolbar={true}
                labels={{
                    results: 'Results',
                    refresh: 'Refresh',
                    enableAutoRefresh: 'Enable auto refresh',
                    disableAutoRefresh: 'Disable auto refresh',
                    selectAll: 'Select all',
                    deselectAll: 'Deselect all',
                }}
            />,
        );

        expect(container).toMatchSnapshot();
    });
});

describe('MultimediaGrid slots', () => {
    it('should render with a custom slot component', () => {
        const { container } = render(
            <MultimediaGrid
                items={[{ id: '1', title: 'Test Item' }]}
                slots={{
                    mediaCard: (): React.JSX.Element => <div data-testid="custom-slot" />,
                }}
            />,
        );

        expect(container).toMatchSnapshot();
    });
});

describe('MultimediaGrid with infinite scroll', () => {
    it('should render with infinite scroll props', () => {
        const mockOnLoadMore = vi.fn();

        const items = [
            { id: '1', title: 'Item 1' },
            { id: '2', title: 'Item 2' },
        ];

        const { container } = render(<MultimediaGrid items={items} hasMore={true} onLoadMore={mockOnLoadMore} />);

        expect(container).toMatchSnapshot();
    });
});

describe('MultimediaGrid sx function', () => {
    it('should render without crashing when sx is a function', () => {
        const sxFunction = (): { backgroundColor: string } => ({
            backgroundColor: 'red',
        });

        const items = [{ id: '1', title: 'Test Item' }];

        const { container } = render(
            <MultimediaGrid
                items={items}
                slotProps={{
                    mediaCard: {
                        sx: sxFunction,
                    },
                }}
            />,
        );

        // Test that component renders without throwing
        expect(container.firstChild).toBeTruthy();
    });

    it('should render without crashing when sx is an object', () => {
        const staticSx = {
            backgroundColor: 'blue',
            padding: 2,
        };

        const items = [{ id: '1', title: 'Test Item' }];

        const { container } = render(
            <MultimediaGrid
                items={items}
                slotProps={{
                    mediaCard: {
                        sx: staticSx,
                    },
                }}
            />,
        );

        // Test that component renders without throwing
        expect(container.firstChild).toBeTruthy();
    });

    it('should render without crashing when sx is undefined', () => {
        const items = [{ id: '1', title: 'Test Item' }];

        const { container } = render(
            <MultimediaGrid
                items={items}
                slotProps={{
                    mediaCard: {
                        // sx is undefined
                    },
                }}
            />,
        );

        // Test that component renders without throwing
        expect(container.firstChild).toBeTruthy();
    });
});

describe('MultimediaGrid empty and error states', () => {
    it('should render empty state when items array is empty and not loading', () => {
        const { container } = render(<MultimediaGrid items={[]} loading={false} />);

        expect(container).toMatchSnapshot();
    });

    it('should render error state when error prop is true', () => {
        const items = [
            { id: '1', title: 'Item 1' },
            { id: '2', title: 'Item 2' },
        ];

        const { container } = render(<MultimediaGrid items={items} error={true} />);

        expect(container).toMatchSnapshot();
    });

    it('should not render grid when error state is active', () => {
        const items = [
            { id: '1', title: 'Item 1' },
            { id: '2', title: 'Item 2' },
        ];

        const { container } = render(<MultimediaGrid items={items} error={true} />);

        // Grid should not be rendered in error state
        const gridElements = container.querySelectorAll('[data-testid="media-card"]');
        expect(gridElements).toHaveLength(0);
    });

    it('should not render empty state when loading is true', () => {
        const { container } = render(<MultimediaGrid items={[]} loading={true} />);

        expect(container).toMatchSnapshot();
    });

    it('should not render error state when loading is true even if error is true', () => {
        const { container } = render(<MultimediaGrid items={[]} loading={true} error={true} />);

        expect(container).toMatchSnapshot();
    });

    it('should prioritize error state over empty state when both conditions are met', () => {
        const { container } = render(<MultimediaGrid items={[]} error={true} loading={false} />);

        expect(container).toMatchSnapshot();
    });
});

describe('MultimediaGrid selection parameters', () => {
    it('should render without crashing with selectionModel', () => {
        const items = [
            { id: '1', title: 'Item 1' },
            { id: '2', title: 'Item 2' },
        ];

        const selectionModel: GridRowSelectionModel = { type: 'include', ids: new Set(['1']) };

        const { container } = render(<MultimediaGrid items={items} selectionModel={selectionModel} />);

        expect(container.firstChild).toBeTruthy();
    });

    it('should render without crashing with onSelectionModelChange callback', () => {
        const mockOnSelectionChange = vi.fn();

        const items = [
            { id: '1', title: 'Item 1' },
            { id: '2', title: 'Item 2' },
        ];

        const { container } = render(<MultimediaGrid items={items} onSelectionModelChange={mockOnSelectionChange} />);

        expect(container.firstChild).toBeTruthy();
    });

    it('should render without crashing with disableSelection', () => {
        const items = [
            { id: '1', title: 'Item 1' },
            { id: '2', title: 'Item 2' },
        ];

        const { container } = render(<MultimediaGrid items={items} disableSelection={true} />);

        expect(container.firstChild).toBeTruthy();
    });

    it('should render without crashing with disableSelectionOnClick', () => {
        const items = [
            { id: '1', title: 'Item 1' },
            { id: '2', title: 'Item 2' },
        ];

        const { container } = render(<MultimediaGrid items={items} disableSelectionOnClick={true} />);

        expect(container.firstChild).toBeTruthy();
    });

    it('should render without crashing with combined selection parameters', () => {
        const mockOnSelectionChange = vi.fn();
        const selectionModel: GridRowSelectionModel = { type: 'include', ids: new Set(['2']) };

        const items = [
            { id: '1', title: 'Item 1' },
            { id: '2', title: 'Item 2' },
            { id: '3', title: 'Item 3' },
        ];

        const { container } = render(
            <MultimediaGrid
                items={items}
                selectionModel={selectionModel}
                onSelectionModelChange={mockOnSelectionChange}
                disableSelectionOnClick={false}
            />,
        );

        expect(container.firstChild).toBeTruthy();
    });

    it.skip('should handle card click selection when disableSelectionOnClick is false', () => {
        const mockOnSelectionChange = vi.fn();
        const items = [
            { id: '1', title: 'Item 1' },
            { id: '2', title: 'Item 2' },
        ];
        const selectionModel: GridRowSelectionModel = { type: 'include', ids: new Set([]) };

        const { getAllByTestId } = render(
            <MultimediaGrid
                items={items}
                selectionModel={selectionModel}
                onSelectionModelChange={mockOnSelectionChange}
                disableSelectionOnClick={false}
                checkboxSelection={true}
            />,
        );

        // Card click should trigger selection
        const cards = getAllByTestId('media-card');
        fireEvent.click(cards[0]);

        expect(mockOnSelectionChange).toHaveBeenCalledWith(['1'], expect.any(Object));
    });

    it('should NOT render checkbox when checkboxSelection is false even with showOnHover', () => {
        const items = [
            { id: '1', title: 'Item 1' },
            { id: '2', title: 'Item 2' },
        ];

        const { container } = render(
            <MultimediaGrid
                items={items}
                checkboxSelection={false}
                sx={{ height: '600px' }}
                slotProps={{
                    mediaCard: {
                        slotProps: {
                            checkbox: {
                                showOnHover: true,
                            },
                        },
                    },
                }}
            />,
        );

        // Checkbox should not be rendered when checkboxSelection is false
        const checkboxes = container.querySelectorAll('input[type="checkbox"]');
        expect(checkboxes).toHaveLength(0);
    });

    it.skip('should NOT handle card click selection when disableSelectionOnClick is true', () => {
        const mockOnSelectionChange = vi.fn();
        const items = [
            { id: '1', title: 'Item 1' },
            { id: '2', title: 'Item 2' },
        ];
        const selectionModel: GridRowSelectionModel = { type: 'include', ids: new Set([]) };

        const { getAllByTestId } = render(
            <MultimediaGrid
                items={items}
                selectionModel={selectionModel}
                onSelectionModelChange={mockOnSelectionChange}
                disableSelectionOnClick={true}
                checkboxSelection={true}
            />,
        );

        // Card click should NOT trigger selection
        const cards = getAllByTestId('media-card');
        fireEvent.click(cards[0]);

        expect(mockOnSelectionChange).not.toHaveBeenCalled();
    });

    it.skip('should handle checkbox click selection regardless of disableSelectionOnClick', () => {
        const mockOnSelectionChange = vi.fn();
        const items = [
            { id: '1', title: 'Item 1' },
            { id: '2', title: 'Item 2' },
        ];
        const selectionModel: GridRowSelectionModel = { type: 'include', ids: new Set([]) };

        const { container } = render(
            <MultimediaGrid
                items={items}
                selectionModel={selectionModel}
                onSelectionModelChange={mockOnSelectionChange}
                disableSelectionOnClick={true}
                checkboxSelection={true}
            />,
        );

        // Checkbox click should always work
        const checkboxes = container.querySelectorAll('input[type="checkbox"]');
        expect(checkboxes).toHaveLength(2); // Should have checkboxes for both items
        fireEvent.click(checkboxes[0]);

        expect(mockOnSelectionChange).toHaveBeenCalledWith(['1'], expect.any(Object));
    });
});
