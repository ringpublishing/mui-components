import React from 'react';
import { ThemeProvider } from '@mui/material';
import { fireEvent, render } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

vi.mock('@dnd-kit/core', () => ({
    DndContext: ({
        children,
        onDragMove,
        onDragEnd,
    }: {
        children: React.ReactNode;
        onDragMove?: (event: object) => void;
        onDragEnd?: (event: object) => void;
    }) => (
        <div>
            {children}
            <button
                data-testid="mock-dnd-move"
                onClick={() => {
                    onDragMove?.({
                        active: { id: '1' },
                        collisions: [{ id: '2', data: { value: 0 } }],
                    });
                }}
            />
            <button
                data-testid="mock-dnd-end"
                onClick={() => {
                    onDragEnd?.({ active: { id: '1' } });
                }}
            />
        </div>
    ),
    KeyboardSensor: class KeyboardSensor {},
    PointerSensor: class PointerSensor {},
    useSensor: vi.fn(() => ({})),
    useSensors: vi.fn((...sensors: unknown[]) => sensors),
}));

vi.mock('@dnd-kit/sortable', () => ({
    SortableContext: ({ children }: { children: React.ReactNode }) => <>{children}</>,
    sortableKeyboardCoordinates: vi.fn(),
    useSortable: vi.fn((params: { id: string }) => ({
        attributes: { 'data-sortable-id': params.id },
        listeners: {},
        setNodeRef: vi.fn(),
        setActivatorNodeRef: vi.fn(),
        transform: null,
        transition: undefined,
        isDragging: false,
    })),
}));

import { TreeView, TreeViewProps, getCreatedTheme } from '../../../src/index.js';

describe('Component: TreeView DnD', () => {
    it('should call onDragAndDropEnd when drag and drop is completed', () => {
        const theme = getCreatedTheme('light');
        const onDragAndDropEndMock = vi.fn();
        const props: TreeViewProps = {
            variant: 'default',
            items: [
                { itemId: '1', label: 'Item 1' },
                { itemId: '2', label: 'Item 2' },
            ],
            onDragAndDropEnd: onDragAndDropEndMock,
            columns: [{ name: 'column1', width: 100, header: 'First Column' }],
            showColumnHeaders: false,
        };

        const { getByTestId } = render(
            <ThemeProvider theme={theme}>
                <TreeView {...props} />
            </ThemeProvider>,
        );

        fireEvent.click(getByTestId('mock-dnd-move'));
        fireEvent.click(getByTestId('mock-dnd-end'));

        expect(onDragAndDropEndMock).toHaveBeenCalledWith([0], [2]);
    });
});
