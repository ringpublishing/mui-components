import { act } from 'react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { ThemeProvider } from '@mui/material';
import { render, fireEvent, waitFor, RenderOptions, RenderResult } from '@testing-library/react';

import { getCreatedTheme, DataTree, DataTreeProps, DataTreeItem } from '../../../src/index.js';
import { filterDataTreeItems } from '../../../src/components/Organisms/DataTree/DataTree.js';
import { loadLibrary } from './treeDynamicLoading/renderTree.js';

describe('Component: DataTree', () => {
    function renderDataTree(props: DataTreeProps, options: RenderOptions = {}): RenderResult {
        const theme = getCreatedTheme('light');

        return render(
            <ThemeProvider theme={theme}>
                <DataTree {...props} />
            </ThemeProvider>,
            options,
        );
    }

    /**
     * Items with `loadItems` need `enableTreeDynamicLoading()`, module state, so it runs on a copy of the library of
     * its own and the rest of this file renders without it. Tests using it get 60 s: loading the copy takes seconds
     * on a busy run, and findBy has to time out first to report what is missing.
     */
    async function renderDynamicDataTree(props: DataTreeProps): Promise<RenderResult> {
        const library = await loadLibrary({ withDynamicLoading: true });

        return render(
            <ThemeProvider theme={library.getCreatedTheme('light')}>
                <library.DataTree {...props} />
            </ThemeProvider>,
        );
    }

    // ── Render ─────────────────────────────────────────────────────────────

    it('renders all top-level items as treeitem elements', () => {
        const { getAllByRole } = renderDataTree({
            items: [
                { itemId: '1', label: 'Row One' },
                { itemId: '2', label: 'Row Two' },
                { itemId: '3', label: 'Row Three' },
            ],
        });

        expect(getAllByRole('treeitem')).toHaveLength(3);
    });

    it('renders column data for each item when columns are defined', () => {
        const { getByText } = renderDataTree({
            items: [{ itemId: '1', label: 'Item', status: 'Active' }],
            columns: [{ name: 'status', width: 100, header: 'Status' }],
        });

        expect(getByText('Active')).toBeTruthy();
    });

    // ── Column headers ──────────────────────────────────────────────────────

    it('shows column headers when showColumnHeaders is true', () => {
        const { getByText } = renderDataTree({
            items: [{ itemId: '1', label: 'Item' }],
            showColumnHeaders: true,
            itemsLabelColumnHeader: 'Name',
            columns: [{ name: 'col', width: 100, header: 'Status' }],
        });

        expect(getByText('Name')).toBeTruthy();
        expect(getByText('Status')).toBeTruthy();
    });

    it('does not show column headers when showColumnHeaders is false', () => {
        const { queryByText } = renderDataTree({
            items: [{ itemId: '1', label: 'Item' }],
            showColumnHeaders: false,
            itemsLabelColumnHeader: 'Name',
            columns: [{ name: 'col', width: 100, header: 'Status' }],
        });

        expect(queryByText('Name')).toBeNull();
        expect(queryByText('Status')).toBeNull();
    });

    // ── Checkboxes ──────────────────────────────────────────────────────────

    it('does not render checkboxes when onCheckboxChange is not provided', () => {
        const { queryByRole } = renderDataTree({
            items: [{ itemId: '1', label: 'Row', withCheckbox: true, checked: false }],
        });

        expect(queryByRole('checkbox')).toBeNull();
    });

    it('renders checkboxes when onCheckboxChange is provided', () => {
        const { getAllByRole } = renderDataTree({
            items: [
                { itemId: '1', label: 'Row One', withCheckbox: true, checked: false },
                { itemId: '2', label: 'Row Two', withCheckbox: true, checked: false },
            ],
            onCheckboxChange: vi.fn(),
        });

        expect(getAllByRole('checkbox').length).toBeGreaterThanOrEqual(2);
    });

    it('calls onCheckboxChange with itemId and true when an unchecked box is clicked', async () => {
        const onCheckboxChange = vi.fn();
        const { getAllByRole } = renderDataTree({
            items: [{ itemId: 'chk-1', label: 'Check Me', withCheckbox: true, checked: false }],
            onCheckboxChange,
        });

        act(() => {
            fireEvent.click(getAllByRole('checkbox')[0]);
        });

        await waitFor(() => {
            expect(onCheckboxChange).toHaveBeenCalledWith('chk-1', true);
        });
    });

    it('calls onCheckboxChange with itemId and false when a checked box is unchecked', async () => {
        const onCheckboxChange = vi.fn();
        const { getAllByRole } = renderDataTree({
            items: [{ itemId: 'chk-2', label: 'Uncheck Me', withCheckbox: true, checked: true }],
            onCheckboxChange,
        });

        act(() => {
            fireEvent.click(getAllByRole('checkbox')[0]);
        });

        await waitFor(() => {
            expect(onCheckboxChange).toHaveBeenCalledWith('chk-2', false);
        });
    });

    // ── Search ─────────────────────────────────────────────────────────────

    it('shows a search input when withSearch is true', () => {
        const { getByRole } = renderDataTree({
            items: [{ itemId: '1', label: 'Item' }],
            withSearch: true,
        });

        expect(getByRole('textbox')).toBeTruthy();
    });

    it('filters out non-matching items when a search query is entered', async () => {
        const { getByRole, queryByText, getByText } = renderDataTree({
            items: [
                { itemId: '1', label: 'Foxtrot' },
                { itemId: '2', label: 'Golf' },
            ],
            withSearch: true,
            searchDebounceTime: 0,
        });

        act(() => {
            fireEvent.change(getByRole('textbox'), { target: { value: 'Foxtrot' } });
        });

        await waitFor(() => {
            expect(queryByText('Golf')).toBeNull();
        });

        expect(getByText('Foxtrot')).toBeTruthy();
    });

    it('expands parent nodes to reveal matching children when searching', async () => {
        const { getByRole, getAllByRole } = renderDataTree({
            items: [
                {
                    itemId: 'parent',
                    label: 'Parent Node',
                    expanded: false,
                    items: [{ itemId: 'child', label: 'Matching Child' }],
                },
            ],
            withSearch: true,
            searchDebounceTime: 0,
        });

        act(() => {
            fireEvent.change(getByRole('textbox'), { target: { value: 'Matching' } });
        });

        // After search, matched text is split into spans — use textContent on tree items
        await waitFor(() => {
            const treeItems = getAllByRole('treeitem');
            const match = treeItems.find((el) => el.textContent?.includes('Matching Child'));
            expect(match).toBeTruthy();
        });
    });

    describe('row expansion while searching', () => {
        // `parent` starts collapsed and `second` expanded; both have a child matching "Nested".
        const searchItems: DataTreeItem[] = [
            {
                itemId: 'parent',
                label: 'Parent',
                expanded: false,
                items: [{ itemId: 'child', label: 'Nested Child' }],
            },
            {
                itemId: 'second',
                label: 'Second',
                expanded: true,
                items: [{ itemId: 'second-child', label: 'Nested Second' }],
            },
        ];

        beforeEach(() => localStorage.clear());
        afterEach(() => localStorage.clear());

        function renderSearchTree(props: Partial<DataTreeProps> = {}): RenderResult {
            return renderDataTree({
                items: searchItems,
                withSearch: true,
                searchDebounceTime: 0,
                dataTestIdSuffix: 'search',
                ...props,
            });
        }

        function getRow(view: RenderResult, itemId: string): HTMLElement {
            return view.getByTestId(`ring-datatree-search-item-${itemId}`);
        }

        async function typeQuery(view: RenderResult, value: string): Promise<void> {
            act(() => {
                fireEvent.change(view.getByRole('textbox'), { target: { value } });
            });

            await waitFor(() => {
                const highlight = view.container.querySelector('.Ring-DataTree-matchedLabel');
                expect(highlight !== null).toBe(value !== '');
            });

            if (value !== '') {
                await waitFor(() => {
                    expect(view.getByTestId('ring-datatree-search-item-child')).toBeTruthy();
                });
            }
        }

        function clickCollapse(view: RenderResult, itemId: string): void {
            act(() => {
                fireEvent.click(view.getByTestId(`ring-datatree-search-item-${itemId}-collapse`));
            });
        }

        it('collapses a matching row when its collapse icon is clicked', async () => {
            const view = renderSearchTree();

            await typeQuery(view, 'Nested');
            clickCollapse(view, 'parent');

            await waitFor(() => {
                expect(getRow(view, 'parent').getAttribute('aria-expanded')).toBe('false');
            });
            await waitFor(() => {
                expect(view.queryByTestId('ring-datatree-search-item-child')).toBeNull();
            });
            expect(getRow(view, 'second').getAttribute('aria-expanded')).toBe('true');
        });

        it('restores the expansion from before the search when the query is cleared', async () => {
            const view = renderSearchTree();

            await typeQuery(view, 'Nested');
            clickCollapse(view, 'parent');
            clickCollapse(view, 'second');
            await typeQuery(view, '');

            await waitFor(() => {
                expect(view.queryByTestId('ring-datatree-search-item-child')).toBeNull();
            });
            expect(getRow(view, 'parent').getAttribute('aria-expanded')).toBe('false');
            expect(getRow(view, 'second').getAttribute('aria-expanded')).toBe('true');
            expect(view.getByText('Nested Second')).toBeTruthy();
        });

        it('persists the expansion from before the search, not the rows toggled during it', async () => {
            const view = renderSearchTree({ persistence: { cacheKey: 'search-tree', restoreExpandedItems: true } });

            function storedExpandedItems(): string[] | undefined {
                return JSON.parse(localStorage.getItem('ring-tree-state-search-tree') ?? '{}').expandedItems;
            }

            await typeQuery(view, 'Nested');
            clickCollapse(view, 'parent');
            clickCollapse(view, 'second');

            expect(storedExpandedItems()).toEqual(['second']);

            await typeQuery(view, '');

            expect(storedExpandedItems()).toEqual(['second']);
        });
    });

    // ── onClickRow ──────────────────────────────────────────────────────────

    it('calls onClickRow with the itemId when a row label is clicked', async () => {
        const onClickRow = vi.fn();
        const { getByText } = renderDataTree({
            items: [{ itemId: 'dt-1', label: 'Clickable' }],
            onClickRow,
        });

        act(() => {
            fireEvent.click(getByText('Clickable'));
        });

        await waitFor(() => {
            expect(onClickRow).toHaveBeenCalledWith('dt-1');
        });
    });

    // ── onExpand ────────────────────────────────────────────────────────────

    it('calls onExpand with the itemId when the expand icon is clicked', async () => {
        const onExpand = vi.fn();
        const { getByTestId } = renderDataTree({
            items: [
                {
                    itemId: 'parent',
                    label: 'Parent',
                    expanded: false,
                    items: [{ itemId: 'child', label: 'Child' }],
                },
            ],
            onExpand,
            dataTestIdSuffix: 'test',
        });

        act(() => {
            fireEvent.click(getByTestId('ring-datatree-test-item-parent-expand'));
        });

        await waitFor(() => {
            expect(onExpand).toHaveBeenCalledWith('parent');
        });
    });

    // ── Controlled selectedItems ────────────────────────────────────────────

    it('calls onSelectedItemsChange when an item is selected', async () => {
        const onSelectedItemsChange = vi.fn();
        const { getByText } = renderDataTree({
            items: [{ itemId: 'sel-1', label: 'Select Me' }],
            onSelectedItemsChange,
            onClickRow: vi.fn(),
        });

        act(() => {
            fireEvent.click(getByText('Select Me'));
        });

        await waitFor(() => {
            expect(onSelectedItemsChange).toHaveBeenCalledWith(['sel-1']);
        });
    });

    // ── Label sanitization (XSS) ────────────────────────────────────────────

    describe('row actions button', () => {
        // The dynamic path is a lazily imported chunk; under a loaded test run it can take longer
        // than findBy's default 1s to resolve.
        const DYNAMIC_CHUNK_TIMEOUT = 5000;

        const items: DataTreeItem[] = [
            {
                itemId: '1',
                label: 'Item 1',
                expanded: true,
                rowActions: [{ label: 'Edit' }],
                items: [{ itemId: '1.1', label: 'Item 1.1', rowActions: [{ label: 'Edit' }] }],
            },
        ];

        it('is named "More actions" by default', () => {
            const { getByRole } = renderDataTree({ items: [{ ...items[0], items: undefined }] });

            expect(getByRole('button', { name: 'More actions' })).toBeTruthy();
        });

        it('takes its name from rowActionsAriaLabel on every nesting level', () => {
            const { getAllByRole, queryByRole } = renderDataTree({ items, rowActionsAriaLabel: 'Row options' });

            expect(getAllByRole('button', { name: 'Row options' })).toHaveLength(2);
            expect(queryByRole('button', { name: 'More actions' })).toBeNull();
        });

        it('falls back to "More actions" when rowActionsAriaLabel is blank', () => {
            const { getAllByRole } = renderDataTree({ items, rowActionsAriaLabel: '  ' });

            expect(getAllByRole('button', { name: 'More actions' })).toHaveLength(2);
        });

        it('is named on the dynamic path too, where an item has loadItems', async () => {
            const { findByRole } = await renderDynamicDataTree({
                items: [
                    {
                        itemId: '1',
                        label: 'Item 1',
                        rowActions: [{ label: 'Edit' }],
                        loadItems: (): DataTreeItem[] => [],
                    },
                ],
                rowActionsAriaLabel: 'Row options',
            });

            expect(
                await findByRole('button', { name: 'Row options' }, { timeout: DYNAMIC_CHUNK_TIMEOUT }),
            ).toBeTruthy();
        }, 60_000);

        it('falls back to "More actions" on the dynamic path', async () => {
            const { findByRole } = await renderDynamicDataTree({
                items: [
                    {
                        itemId: '1',
                        label: 'Item 1',
                        rowActions: [{ label: 'Edit' }],
                        loadItems: (): DataTreeItem[] => [],
                    },
                ],
            });

            expect(
                await findByRole('button', { name: 'More actions' }, { timeout: DYNAMIC_CHUNK_TIMEOUT }),
            ).toBeTruthy();
        }, 60_000);
    });

    describe('label sanitization', () => {
        it('strips disallowed HTML from labels', () => {
            const { container, queryByText } = renderDataTree({
                items: [{ itemId: 'xss', label: '<img src=x onerror=alert(1)>Safe' }],
            });

            expect(container.querySelector('img[src="x"]')).toBeNull();
            expect(queryByText('Safe')).toBeTruthy();
        });

        it('removes <script> tags from labels', () => {
            const { container } = renderDataTree({
                items: [{ itemId: 'xss', label: 'Hi<script>window.__pwned=true</script>' }],
            });

            expect(container.querySelector('script')).toBeNull();
        });

        it('preserves <span> tags (used by built-in search highlighting)', () => {
            const { container } = renderDataTree({
                items: [{ itemId: 'span', label: 'Hello <span class="hl">world</span>' }],
            });

            expect(container.querySelector('span.hl')).not.toBeNull();
        });
    });

    describe('row accessibility', () => {
        it('keeps the expand icon button out of the tab order and away from assistive technology', () => {
            const { getByTestId, queryAllByRole } = renderDataTree({
                items: [{ itemId: 'parent', label: 'Parent', items: [{ itemId: 'child', label: 'Child' }] }],
            });

            const expand = getByTestId('ring-datatree-item-parent-expand');

            expect(expand.getAttribute('tabindex')).toBe('-1');
            expect(expand.getAttribute('aria-hidden')).toBe('true');
            expect(queryAllByRole('button', { name: '' })).toHaveLength(0);
        });

        it('keeps the expand icon button decorative on the dynamic path too', async () => {
            const { findByTestId } = await renderDynamicDataTree({
                items: [{ itemId: 'lazy', label: 'Lazy', loadItems: (): DataTreeItem[] => [] }],
            });

            const expand = await findByTestId('ring-datatree-item-lazy-expand', {}, { timeout: 5000 });

            expect(expand.getAttribute('tabindex')).toBe('-1');
            expect(expand.getAttribute('aria-hidden')).toBe('true');
        }, 60_000);

        it('names each row checkbox after the text of its label, also while search highlights it', async () => {
            const { getByRole } = renderDataTree({
                items: [
                    { itemId: 'q3', label: 'Report Q3', checked: true },
                    { itemId: 'q4', label: 'Report Q4' },
                ],
                onCheckboxChange: vi.fn(),
                withSearch: true,
                searchDebounceTime: 0,
            });

            expect((getByRole('checkbox', { name: 'Report Q3' }) as HTMLInputElement).checked).toBe(true);

            act(() => {
                fireEvent.change(getByRole('textbox'), { target: { value: 'Q3' } });
            });

            await waitFor(() => {
                expect(document.querySelector('.Ring-DataTree-matchedLabel')).not.toBeNull();
            });
            expect(getByRole('checkbox', { name: 'Report Q3' })).toBeTruthy();
        });

        it('renders the drag-and-drop live region outside the tree', () => {
            renderDataTree({ items: [{ itemId: '1', label: 'Item 1' }], onDragAndDropEnd: vi.fn() });

            expect(document.querySelector('[role="tree"] [role="status"]')).toBeNull();
            expect(document.querySelector('[role="status"][aria-live]')).not.toBeNull();
        });
    });
});

// ── filterDataTreeItems — pure unit tests ──────────────────────────────────────

describe('filterDataTreeItems', () => {
    const items: DataTreeItem[] = [
        { itemId: '1', label: 'Apple' },
        { itemId: '2', label: 'Banana' },
        {
            itemId: '3',
            label: 'Fruit Bowl',
            items: [
                { itemId: '3.1', label: 'Cherry' },
                { itemId: '3.2', label: 'Date' },
            ],
        },
        { itemId: '4', label: 'Elderberry' },
    ];

    it('returns items whose label matches the query', () => {
        const result = filterDataTreeItems(items, 'Apple');

        expect(result).toHaveLength(1);
        expect(result[0].itemId).toBe('1');
    });

    it('is case-insensitive', () => {
        const result = filterDataTreeItems(items, 'apple');

        expect(result).toHaveLength(1);
        expect(result[0].itemId).toBe('1');
    });

    it('returns parent item (with only matching children) when a child label matches', () => {
        const result = filterDataTreeItems(items, 'Cherry');

        expect(result).toHaveLength(1);
        expect(result[0].itemId).toBe('3');
        expect(result[0].items).toHaveLength(1);
        expect(result[0].items?.[0].itemId).toBe('3.1');
    });

    it('excludes items and their parents when no label matches', () => {
        const result = filterDataTreeItems(items, 'Apple');
        const ids = result.map((i) => i.itemId);

        expect(ids).not.toContain('2');
        expect(ids).not.toContain('3');
        expect(ids).not.toContain('4');
    });

    it('wraps matched text in a highlight span', () => {
        const result = filterDataTreeItems(items, 'Apple');

        expect(result[0].label).toBe('<span class="Ring-DataTree-matchedLabel">Apple</span>');
    });

    it('requires all words in a multi-word query to match (AND logic)', () => {
        const multiItems: DataTreeItem[] = [
            { itemId: 'a', label: 'Quick brown fox' },
            { itemId: 'b', label: 'Quick silver' },
            { itemId: 'c', label: 'Brown bear' },
        ];

        const result = filterDataTreeItems(multiItems, 'quick fox');

        expect(result).toHaveLength(1);
        expect(result[0].itemId).toBe('a');
    });

    it('returns an empty array when nothing matches', () => {
        expect(filterDataTreeItems(items, 'xyznotfound')).toHaveLength(0);
    });

    describe('regex metacharacters in the query', () => {
        it('does not throw when the query contains "(" and the label also contains it', () => {
            const data: DataTreeItem[] = [{ itemId: '1', label: 'Apple (red)' }];

            expect(() => filterDataTreeItems(data, '(')).not.toThrow();

            const result = filterDataTreeItems(data, '(');

            expect(result).toHaveLength(1);
            expect(result[0].label).toContain('Ring-DataTree-matchedLabel');
        });

        it('does not throw on "[" / "*" / "+" / "?" / "{" / "\\\\"', () => {
            const data: DataTreeItem[] = [
                { itemId: '1', label: 'Item [draft]' },
                { itemId: '2', label: 'Note * important' },
                { itemId: '3', label: 'Path C:\\\\users' },
                { itemId: '4', label: 'Plus + sign' },
                { itemId: '5', label: 'Maybe ? value' },
                { itemId: '6', label: 'Brace { open' },
            ];

            for (const q of ['[', '*', '\\', '+', '?', '{']) {
                expect(() => filterDataTreeItems(data, q)).not.toThrow();
            }
        });
    });
});
