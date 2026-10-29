import { useEffect, useRef, useState } from 'react';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, waitFor } from '@testing-library/react';
import { GridRowSelectionModel } from '@mui/x-data-grid-pro';

import { ThemeConfig } from '../../../src/index.js';
import BottomBarContainer from '../../../src/components/internal/BottomBar/BottomBarContainer.js';
import { BottomBarProvider, useBottomBarContext } from '../../../src/components/internal/BottomBar/BottomBarContext.js';
import { MultimediaGrid } from '../../../src/components/Organisms/MultimediaGrid/MultimediaGrid.js';
import { useGridApiRef } from '../../../src/components/Organisms/MultimediaGrid/gridApi.js';
import { RingDataGrid } from '../../../src/components/Organisms/DataGrid/RingDataGrid.js';

// A media grid selection of two items without images, as DataView hands it to the bar.
function SelectTwoItems(): null {
    const { setBottomBarState } = useBottomBarContext();
    // The provider hands out a new setter on every render, so the selection is set once rather than per setter.
    const selected = useRef(false);

    useEffect(() => {
        if (selected.current) {
            return;
        }

        selected.current = true;
        setBottomBarState({
            isSelectionModeEnabled: true,
            allSelected: false,
            rowSelectionModel: { type: 'include', ids: new Set(['Item-A', 'b2']) },
            items: [
                { id: 'Item-A', title: 'No image A' },
                { id: 'b2', title: 'No image B' },
            ],
            apiRef: {
                current: { mode: 'media', subscribeEvent: () => () => undefined, setSelectionModel: () => undefined },
            } as never,
        });
    });

    return null;
}

describe('BottomBar', () => {
    it('hangs each tile placeholder off the bar id, with the row id lower-cased like other list items', async () => {
        const { container } = render(
            <ThemeConfig mode="light">
                <BottomBarProvider>
                    <SelectTwoItems />
                    <BottomBarContainer dataTestId="ring-dataview-bottom-bar" />
                </BottomBarProvider>
            </ThemeConfig>,
        );

        await waitFor(() => {
            expect(
                container.querySelector('[data-testid="ring-dataview-bottom-bar-item-item-a-placeholder-icon"]'),
            ).not.toBeNull();
        });
        expect(
            container.querySelector('[data-testid="ring-dataview-bottom-bar-item-b2-placeholder-icon"]'),
        ).not.toBeNull();
        expect(container.querySelector('[data-testid*="Item-A"]')).toBeNull();
    });
});

const noop = (): void => undefined;

const mediaItems = [
    { id: 'a1', title: 'A' },
    { id: 'b2', title: 'B' },
];

type SelectionChange = (model: GridRowSelectionModel, details?: unknown) => void;

function MediaGridWithBar({ onSelectionModelChange }: { onSelectionModelChange?: SelectionChange }): React.JSX.Element {
    const apiRef = useGridApiRef();
    const [selectionModel, setSelectionModel] = useState<GridRowSelectionModel>({ type: 'include', ids: new Set() });
    const controlledProps = onSelectionModelChange
        ? {
              selectionModel,
              onSelectionModelChange: (model: GridRowSelectionModel, details?: unknown): void => {
                  onSelectionModelChange(model, details);
                  setSelectionModel(model);
              },
          }
        : {};

    return (
        <ThemeConfig mode="light">
            <BottomBarProvider>
                <MultimediaGrid
                    apiRef={apiRef}
                    columns={2}
                    checkboxSelection={true}
                    items={mediaItems}
                    {...controlledProps}
                />
                <BottomBarContainer dataTestId="ring-dataview-bottom-bar" />
            </BottomBarProvider>
        </ThemeConfig>
    );
}

function RingDataGridWithBar({
    onRowSelectionModelChange,
}: {
    onRowSelectionModelChange: SelectionChange;
}): React.JSX.Element {
    const [rowSelectionModel, setRowSelectionModel] = useState<GridRowSelectionModel>({
        type: 'include',
        ids: new Set(),
    });

    return (
        <ThemeConfig mode="light">
            <BottomBarProvider>
                <RingDataGrid
                    totalRowCount={2}
                    columns={[{ field: 'name' }]}
                    rows={[
                        { id: 1, name: 'One' },
                        { id: 2, name: 'Two' },
                    ]}
                    checkboxSelection={true}
                    rowSelectionModel={rowSelectionModel}
                    onRowSelectionModelChange={(model: GridRowSelectionModel): void => {
                        onRowSelectionModelChange(model);
                        setRowSelectionModel(model);
                    }}
                />
                <BottomBarContainer dataTestId="ring-dataview-bottom-bar" />
            </BottomBarProvider>
        </ThemeConfig>
    );
}

function barTiles(container: HTMLElement): Element[] {
    return Array.from(container.querySelectorAll('[data-testid^="ring-dataview-bottom-bar-item-"]'));
}

function removeFromBar(container: HTMLElement, label: string): void {
    const removeButton = container.querySelector(`[aria-label="${label}"] .delete-button`);

    expect(removeButton).not.toBeNull();
    fireEvent.click(removeButton as Element);
}

describe('BottomBar removing an item', () => {
    /*
     * MultimediaGrid virtualizes off `ResizeObserver` and the measured size of its scroll element, which jsdom
     * reports as 0, so no card would mount. The stubs patch shared globals and are restored afterwards.
     */
    const originalResizeObserver = globalThis.ResizeObserver;
    const originalOffsetWidth = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'offsetWidth');
    const originalOffsetHeight = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'offsetHeight');
    const originalClientWidth = Object.getOwnPropertyDescriptor(Element.prototype, 'clientWidth');
    const originalClientHeight = Object.getOwnPropertyDescriptor(Element.prototype, 'clientHeight');

    beforeAll(() => {
        globalThis.ResizeObserver = class {
            public observe = noop;

            public unobserve = noop;

            public disconnect = noop;
        } as unknown as typeof ResizeObserver;

        Object.defineProperty(HTMLElement.prototype, 'offsetWidth', { configurable: true, value: 800 });
        Object.defineProperty(HTMLElement.prototype, 'offsetHeight', { configurable: true, value: 600 });
        Object.defineProperty(Element.prototype, 'clientWidth', { configurable: true, value: 800 });
        Object.defineProperty(Element.prototype, 'clientHeight', { configurable: true, value: 600 });
    });

    afterAll(() => {
        globalThis.ResizeObserver = originalResizeObserver;

        for (const [target, name, descriptor] of [
            [HTMLElement.prototype, 'offsetWidth', originalOffsetWidth],
            [HTMLElement.prototype, 'offsetHeight', originalOffsetHeight],
            [Element.prototype, 'clientWidth', originalClientWidth],
            [Element.prototype, 'clientHeight', originalClientHeight],
        ] as const) {
            if (descriptor) {
                Object.defineProperty(target, name, descriptor);
            }
        }
    });

    it('reports the remaining MultimediaGrid selection to a controlled parent', async () => {
        const onSelectionModelChange = vi.fn();
        const { container, getByTestId } = render(<MediaGridWithBar onSelectionModelChange={onSelectionModelChange} />);

        fireEvent.click(getByTestId('ring-multimediagrid-item-a1-checkbox'));
        fireEvent.click(getByTestId('ring-multimediagrid-item-b2-checkbox'));
        await waitFor(() => expect(barTiles(container)).toHaveLength(2));
        onSelectionModelChange.mockClear();

        removeFromBar(container, 'A');

        expect(onSelectionModelChange).toHaveBeenCalledTimes(1);
        expect([...onSelectionModelChange.mock.calls[0][0].ids]).toEqual(['b2']);
        expect(onSelectionModelChange.mock.calls[0][1]).toEqual({ reason: 'toggleItem' });
        await waitFor(() => expect(barTiles(container)).toHaveLength(1));
        expect((getByTestId('ring-multimediagrid-item-a1-checkbox') as HTMLInputElement).checked).toBe(false);
        expect((getByTestId('ring-multimediagrid-item-b2-checkbox') as HTMLInputElement).checked).toBe(true);
    });

    it('deselects the removed item in an uncontrolled MultimediaGrid', async () => {
        const { container, getByTestId } = render(<MediaGridWithBar />);

        fireEvent.click(getByTestId('ring-multimediagrid-item-a1-checkbox'));
        fireEvent.click(getByTestId('ring-multimediagrid-item-b2-checkbox'));
        await waitFor(() => expect(barTiles(container)).toHaveLength(2));

        removeFromBar(container, 'A');

        await waitFor(() => expect(barTiles(container)).toHaveLength(1));
        expect((getByTestId('ring-multimediagrid-item-a1-checkbox') as HTMLInputElement).checked).toBe(false);
        expect((getByTestId('ring-multimediagrid-item-b2-checkbox') as HTMLInputElement).checked).toBe(true);
    });

    it('reports the remaining RingDataGrid selection to a controlled parent', async () => {
        const onRowSelectionModelChange = vi.fn();
        const { container, getAllByRole } = render(
            <RingDataGridWithBar onRowSelectionModelChange={onRowSelectionModelChange} />,
        );

        const [, firstRow, secondRow] = getAllByRole('checkbox');
        fireEvent.click(firstRow);
        fireEvent.click(secondRow);
        await waitFor(() => expect(container.querySelectorAll('.MuiChip-deleteIcon')).toHaveLength(2));
        onRowSelectionModelChange.mockClear();

        fireEvent.click(container.querySelectorAll('.MuiChip-deleteIcon')[0]);

        expect(onRowSelectionModelChange).toHaveBeenCalledTimes(1);
        expect([...onRowSelectionModelChange.mock.calls[0][0].ids]).toEqual([2]);
        await waitFor(() => expect(container.querySelectorAll('.MuiChip-deleteIcon')).toHaveLength(1));
    });
});
