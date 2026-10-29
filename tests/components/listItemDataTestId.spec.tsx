import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import React from 'react';
import { render } from '../test-utils/customRenderer.js';

import { RingDataGrid } from '../../src/components/Organisms/DataGrid/RingDataGrid.js';
import { renderActionCell } from '../../src/components/Organisms/DataGrid/renderActionCell.js';
import { renderLinkCell } from '../../src/components/Organisms/DataGrid/renderLinkCell.js';
import { createSpacerItem } from '../../src/components/internal/spacer.js';
import { MultimediaGrid } from '../../src/components/Organisms/MultimediaGrid/MultimediaGrid.js';
import { useGridApiRef } from '../../src/components/Organisms/MultimediaGrid/gridApi.js';
import { SimpleTree } from '../../src/components/Organisms/SimpleTree/SimpleTree.js';
import { DataTree } from '../../src/components/Organisms/DataTree/DataTree.js';
import { TreeView } from '../../src/components/Organisms/TreeView/TreeView.js';
import { ContentList } from '../../src/components/Organisms/ContentList/ContentList.js';
import { SortableList } from '../../src/components/Organisms/SortableList/SortableList.js';

const noop = (): void => undefined;

/*
 * MultimediaGrid virtualizes off `ResizeObserver` and the measured size of its scroll element
 * (`clientWidth` / `clientHeight` and `offsetWidth` / `offsetHeight`), which jsdom lacks (every
 * size reads 0, so no rows would mount). These stubs patch shared globals,
 * so they are installed for this file only and restored afterwards.
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

    if (originalOffsetWidth) {
        Object.defineProperty(HTMLElement.prototype, 'offsetWidth', originalOffsetWidth);
    }

    if (originalOffsetHeight) {
        Object.defineProperty(HTMLElement.prototype, 'offsetHeight', originalOffsetHeight);
    }

    if (originalClientWidth) {
        Object.defineProperty(Element.prototype, 'clientWidth', originalClientWidth);
    }

    if (originalClientHeight) {
        Object.defineProperty(Element.prototype, 'clientHeight', originalClientHeight);
    }
});

const testIds = (container: HTMLElement): string[] =>
    Array.from(container.querySelectorAll('[data-testid]')).map(
        (element) => element.getAttribute('data-testid') as string,
    );

const MultimediaGridHarness: React.FC<{ dataTestIdSuffix?: string }> = ({ dataTestIdSuffix }) => {
    const apiRef = useGridApiRef();

    return (
        <MultimediaGrid
            apiRef={apiRef}
            columns={3}
            dataTestIdSuffix={dataTestIdSuffix}
            items={[
                { id: 'a1', title: 'A' },
                { id: 'b2', title: 'B', dataTestId: 'my-hero-card' },
                { id: 'c3', title: 'C', itemDataTestIdSuffix: 'featured' },
            ]}
        />
    );
};

const MultimediaGridCardControlsHarness: React.FC = () => {
    const apiRef = useGridApiRef();

    return (
        <MultimediaGrid
            apiRef={apiRef}
            columns={3}
            checkboxSelection={true}
            dataTestIdSuffix="gallery"
            items={[
                { id: 'a1', title: 'A', actions: [{ label: 'Edit' }, { label: 'Delete' }] },
                { id: 'b2', title: 'B', actions: [{ label: 'Edit' }, { label: 'Delete' }] },
            ]}
        />
    );
};

/**
 * Every list component must key item test ids off the item's own identity — not its
 * position — and let a caller override any single item. See `helpers/dataTestId.ts`.
 */
describe('list item data-testid', () => {
    it('MultimediaGrid: root, per-item, and both override levels', () => {
        const ids = testIds(render(<MultimediaGridHarness dataTestIdSuffix="gallery" />).container);

        expect(ids).toContain('ring-multimediagrid-gallery');
        expect(ids).toContain('ring-multimediagrid-gallery-item-a1');
        expect(ids).toContain('my-hero-card');
        expect(ids).toContain('ring-multimediagrid-gallery-featured');
    });

    it("MultimediaGrid: each card's controls are namespaced to that card, not shared", () => {
        // MUI's own icon test ids legitimately repeat across cards; only ours must be unique.
        const ids = testIds(render(<MultimediaGridCardControlsHarness />).container).filter((id) => !/Icon$/.test(id));
        const duplicates = [...new Set(ids.filter((id, index) => ids.indexOf(id) !== index))];

        expect(duplicates).toEqual([]);
        expect(ids).toContain('ring-multimediagrid-gallery-item-a1-actions');
        expect(ids).toContain('ring-multimediagrid-gallery-item-a1-checkbox');
        expect(ids).toContain('ring-multimediagrid-gallery-item-b2-actions');
        expect(ids).toContain('ring-multimediagrid-gallery-item-b2-checkbox');
    });

    it('MultimediaGrid: getItemDataTestId receives the item index, not the row index', () => {
        const items = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'].map((id) => ({ id, title: id }));

        const Harness: React.FC<{ columns: number }> = ({ columns }) => {
            const apiRef = useGridApiRef();

            return (
                <MultimediaGrid
                    apiRef={apiRef}
                    columns={columns}
                    items={items}
                    getItemDataTestId={(item, index): string => `cb-${index}`}
                />
            );
        };

        // Cards in one row would otherwise all share the row's index.
        for (const columns of [4, 2]) {
            const ids = testIds(render(<Harness columns={columns} />).container).filter((id) => id.startsWith('cb-'));

            // An empty grid has no duplicates either; without this the check passes on nothing.
            expect(ids).not.toHaveLength(0);
            expect([...new Set(ids)]).toHaveLength(ids.length);
        }
    });

    it('RingDataGrid: root, per-row, and both override levels', () => {
        const ids = testIds(
            render(
                <RingDataGrid
                    totalRowCount={3}
                    columns={[{ field: 'name' }]}
                    dataTestIdSuffix="results"
                    rows={[
                        { id: 1, name: 'One' },
                        { id: 2, name: 'Two', dataTestId: 'row-custom' },
                        { id: 3, name: 'Three', itemDataTestIdSuffix: 'featured' },
                    ]}
                />,
            ).container,
        );

        expect(ids).toContain('ring-datagrid-results');
        expect(ids).toContain('ring-datagrid-results-item-1');
        expect(ids).toContain('row-custom');
        expect(ids).toContain('ring-datagrid-results-featured');
    });

    it('RingDataGrid: getRowDataTestId overrides every row', () => {
        const ids = testIds(
            render(
                <RingDataGrid
                    totalRowCount={2}
                    columns={[{ field: 'name' }]}
                    rows={[
                        { id: 1, name: 'One' },
                        { id: 2, name: 'Two', dataTestId: 'ignored' },
                    ]}
                    getRowDataTestId={(row): string => `fn-row-${row.name as string}`}
                />,
            ).container,
        );

        expect(ids).toContain('fn-row-One');
        expect(ids).toContain('fn-row-Two');
        expect(ids).not.toContain('ignored');
    });

    it('RingDataGrid: toolbar controls and cell contents are addressable', () => {
        const ids = testIds(
            render(
                <RingDataGrid
                    totalRowCount={2}
                    dataTestIdSuffix="results"
                    showRingToolbar={true}
                    labels={{ results: 'Results', refresh: 'Refresh' }}
                    refreshItems={(): void => undefined}
                    autoRefresh={true}
                    sortableFields={[{ name: 'Name', key: 'name', onSortingChange: (): void => undefined }]}
                    columns={[
                        { field: 'name' },
                        { field: 'link', renderCell: renderLinkCell },
                        { field: 'actions', renderCell: renderActionCell },
                    ]}
                    rows={[
                        { id: 1, name: 'One', link: { href: 'https://a' }, actions: [{ label: 'Edit' }] },
                        { id: 2, name: 'Two', link: { href: 'https://b' }, actions: [{ label: 'Edit' }] },
                    ]}
                />,
            ).container,
        );

        expect(ids).toContain('ring-datatoolbar-results-refresh');
        expect(ids).toContain('ring-datatoolbar-results-sort-select');
        expect(ids).toContain('ring-datatoolbar-results-auto-refresh');
        expect(ids).toContain('ring-datagrid-results-item-1-link');
        expect(ids).toContain('ring-datagrid-results-item-1-actions');
        expect(ids).toContain('ring-datagrid-results-item-2-actions');
    });

    it('RingDataGrid: spacer rows still render as separators alongside tagged rows', () => {
        // The row slot is overridden to stamp per-row ids; it must still delegate to
        // `CustomGridRow`, which turns a spacer row into a separator instead of a data row.
        const { container } = render(
            <RingDataGrid
                totalRowCount={2}
                dataTestIdSuffix="results"
                columns={[{ field: 'name' }]}
                rows={[createSpacerItem({ id: 1, title: 'In progress' }), { id: 2, name: 'One' }]}
            />,
        );
        const ids = testIds(container);

        expect(container.querySelector('[role="row"] [role="gridcell"]')).not.toBeNull();
        expect(container.textContent).toContain('In progress');
        expect(ids).toContain('ring-datagrid-results-item-2');
    });

    it('SimpleTree: root, per-item, and both override levels', () => {
        const ids = testIds(
            render(
                <SimpleTree
                    dataTestIdSuffix="nav"
                    items={[
                        { itemId: 'a', label: 'A' },
                        { itemId: 'b', label: 'B', dataTestId: 'my-custom-row' },
                        { itemId: 'c', label: 'C', itemDataTestIdSuffix: 'special' },
                    ]}
                />,
            ).container,
        );

        expect(ids).toContain('ring-simpletree-nav');
        expect(ids).toContain('ring-simpletree-nav-item-a');
        expect(ids).toContain('my-custom-row');
        expect(ids).toContain('ring-simpletree-nav-special');
    });

    it('DataTree: root and per-item', () => {
        const ids = testIds(
            render(
                <DataTree
                    dataTestIdSuffix="nav"
                    items={[
                        { itemId: 'a', label: 'A' },
                        { itemId: 'b', label: 'B', dataTestId: 'dt-custom' },
                    ]}
                />,
            ).container,
        );

        expect(ids).toContain('ring-datatree-nav');
        expect(ids).toContain('ring-datatree-nav-item-a');
        expect(ids).toContain('dt-custom');
    });

    it('TreeView: root and per-item', () => {
        const ids = testIds(
            render(
                <TreeView
                    variant="default"
                    items={[
                        { itemId: 'a', label: 'A' },
                        { itemId: 'b', label: 'B', itemDataTestIdSuffix: 'tv-special' },
                    ]}
                />,
            ).container,
        );

        expect(ids).toContain('ring-treeview');
        expect(ids).toContain('ring-treeview-item-a');
        expect(ids).toContain('ring-treeview-tv-special');
    });

    it('ContentList: root and per-item', () => {
        const ids = testIds(
            render(
                <ContentList
                    dataTestIdSuffix="docs"
                    inputData={[
                        { header: 'First', children: <div>one</div> },
                        { header: 'Second', children: <div>two</div>, dataTestId: 'cl-custom' },
                    ]}
                />,
            ).container,
        );

        expect(ids).toContain('ring-contentlist-docs');
        expect(ids).toContain('ring-contentlist-docs-item-0');
        expect(ids).toContain('cl-custom');
    });

    it('SortableList: root and per-item', () => {
        const ids = testIds(
            render(
                <SortableList
                    dataTestIdSuffix="order"
                    items={[{ id: 'x' }, { id: 'y', dataTestId: 'sl-custom' }]}
                    renderItem={(item): React.ReactNode => <div>{String(item.id)}</div>}
                    onChange={(): void => undefined}
                />,
            ).container,
        );

        expect(ids).toContain('ring-sortablelist-order');
        expect(ids).toContain('ring-sortablelist-order-item-x');
        expect(ids).toContain('sl-custom');
    });

    it('SortableList: an item id is lower-cased like every other list', () => {
        // Guards the `componentName` / `rootId` choice in SortableList's call to
        // `resolveItemDataTestId`: only the `componentName` branch sends the id through
        // `buildRingDataTestId`, which lower-cases every segment. Every other id in this file is
        // already lower case, so nothing else here would notice the branch being swapped.
        const ids = testIds(
            render(
                <SortableList
                    items={[{ id: 'Item-A' }]}
                    renderItem={(item): React.ReactNode => <div>{String(item.id)}</div>}
                    onChange={(): void => undefined}
                />,
            ).container,
        );

        expect(ids).toContain('ring-sortablelist-item-item-a');
        expect(ids).not.toContain('ring-sortablelist-item-Item-A');
    });

    it('item test ids follow the item, not its position, when the list is reordered', () => {
        const first = testIds(
            render(
                <SimpleTree
                    items={[
                        { itemId: 'a', label: 'A' },
                        { itemId: 'b', label: 'B' },
                    ]}
                />,
            ).container,
        );
        const reordered = testIds(
            render(
                <SimpleTree
                    items={[
                        { itemId: 'b', label: 'B' },
                        { itemId: 'a', label: 'A' },
                    ]}
                />,
            ).container,
        );

        expect(first.filter((id) => id.includes('-item-')).sort()).toEqual(
            reordered.filter((id) => id.includes('-item-')).sort(),
        );
    });
});
