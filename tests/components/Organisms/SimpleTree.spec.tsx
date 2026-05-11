import { act } from 'react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { ThemeProvider } from '@mui/material';
import { render, fireEvent, waitFor, RenderOptions, RenderResult } from '@testing-library/react';

import { getCreatedTheme, SimpleTree, SimpleTreeProps } from '../../../src/index.js';

describe('Component: SimpleTree', () => {
    function renderSimpleTree(props: SimpleTreeProps, options: RenderOptions = {}): RenderResult {
        const theme = getCreatedTheme('light');

        return render(
            <ThemeProvider theme={theme}>
                <SimpleTree {...props} />
            </ThemeProvider>,
            options,
        );
    }

    // ── Render ─────────────────────────────────────────────────────────────

    it('renders all top-level items as treeitem elements', () => {
        const { getAllByRole } = renderSimpleTree({
            items: [
                { itemId: '1', label: 'Alpha' },
                { itemId: '2', label: 'Beta' },
                { itemId: '3', label: 'Gamma' },
            ],
        });

        expect(getAllByRole('treeitem')).toHaveLength(3);
    });

    it('renders nested children when parent is expanded', () => {
        const { getByText } = renderSimpleTree({
            items: [
                {
                    itemId: 'parent',
                    label: 'Parent',
                    expanded: true,
                    items: [{ itemId: 'child', label: 'Child Item' }],
                },
            ],
        });

        expect(getByText('Child Item')).toBeTruthy();
    });

    it('does not render nested children when parent is collapsed', () => {
        const { queryByText } = renderSimpleTree({
            items: [
                {
                    itemId: 'parent',
                    label: 'Parent',
                    expanded: false,
                    items: [{ itemId: 'child', label: 'Hidden Child' }],
                },
            ],
        });

        expect(queryByText('Hidden Child')).toBeNull();
    });

    // ── Search ─────────────────────────────────────────────────────────────

    it('shows a search input when withSearch is true', () => {
        const { getByRole } = renderSimpleTree({
            items: [{ itemId: '1', label: 'Item 1' }],
            withSearch: true,
        });

        expect(getByRole('textbox')).toBeTruthy();
    });

    it('does not show a search input when withSearch is false', () => {
        const { queryByRole } = renderSimpleTree({
            items: [{ itemId: '1', label: 'Item 1' }],
            withSearch: false,
        });

        expect(queryByRole('textbox')).toBeNull();
    });

    it('filters out non-matching items when search query is entered', async () => {
        const { getByRole, queryByText, getByText } = renderSimpleTree({
            items: [
                { itemId: '1', label: 'Apple' },
                { itemId: '2', label: 'Banana' },
            ],
            withSearch: true,
            searchDebounceTime: 0,
        });

        act(() => {
            fireEvent.change(getByRole('textbox'), { target: { value: 'Apple' } });
        });

        await waitFor(() => {
            expect(queryByText('Banana')).toBeNull();
        });

        expect(getByText('Apple')).toBeTruthy();
    });

    it('expands parent nodes to reveal matching children when searching', async () => {
        const { getByRole, getAllByRole } = renderSimpleTree({
            items: [
                {
                    itemId: 'parent',
                    label: 'Parent Node',
                    expanded: false,
                    items: [{ itemId: 'child', label: 'Deep Result' }],
                },
                { itemId: 'other', label: 'Unrelated' },
            ],
            withSearch: true,
            searchDebounceTime: 0,
        });

        act(() => {
            fireEvent.change(getByRole('textbox'), { target: { value: 'Deep' } });
        });

        // After search, label is split into spans — check textContent on tree items instead
        await waitFor(() => {
            const treeItems = getAllByRole('treeitem');
            const match = treeItems.find((el) => el.textContent?.includes('Deep Result'));
            expect(match).toBeTruthy();
        });
    });

    it('restores pre-search collapsed state when search is cleared', async () => {
        const { getByRole, getAllByRole, queryAllByRole } = renderSimpleTree({
            items: [
                {
                    itemId: 'parent',
                    label: 'Parent Node',
                    expanded: false,
                    items: [{ itemId: 'child', label: 'Nested Child' }],
                },
            ],
            withSearch: true,
            searchDebounceTime: 0,
        });

        const input = getByRole('textbox');

        act(() => {
            fireEvent.change(input, { target: { value: 'Nested' } });
        });

        // Child should appear (label is split by highlight span — use textContent check)
        await waitFor(() => {
            const treeItems = getAllByRole('treeitem');
            const match = treeItems.find((el) => el.textContent?.includes('Nested Child'));
            expect(match).toBeTruthy();
        });

        act(() => {
            fireEvent.change(input, { target: { value: '' } });
        });

        // Child should be hidden again — collapsed parent means child treeitem not in DOM
        await waitFor(() => {
            const treeItems = queryAllByRole('treeitem');
            const match = treeItems.find((el) => el.textContent?.includes('Nested Child'));
            expect(match).toBeUndefined();
        });
    });

    // ── onExpand ────────────────────────────────────────────────────────────

    it('calls onExpand with the itemId when the expand icon is clicked', async () => {
        const onExpand = vi.fn();
        const { getByTestId } = renderSimpleTree({
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
            fireEvent.click(getByTestId('ring-simpletree-test-item-parent-expand'));
        });

        await waitFor(() => {
            expect(onExpand).toHaveBeenCalledWith('parent');
        });
    });

    // ── onClickRow ──────────────────────────────────────────────────────────

    it('calls onClickRow with the itemId when a row label is clicked', async () => {
        const onClickRow = vi.fn();
        const { getByText } = renderSimpleTree({
            items: [{ itemId: 'row-1', label: 'Clickable Row' }],
            onClickRow,
        });

        act(() => {
            fireEvent.click(getByText('Clickable Row'));
        });

        await waitFor(() => {
            expect(onClickRow).toHaveBeenCalledWith('row-1');
        });
    });

    // ── Controlled selectedItems ────────────────────────────────────────────

    it('applies the Mui-selected class to the controlled selected item', () => {
        const { container } = renderSimpleTree({
            items: [
                { itemId: '1', label: 'First' },
                { itemId: '2', label: 'Second' },
            ],
            selectedItems: ['2'],
        });

        // MUI marks selected tree items with Mui-selected on the content div
        const selectedContent = container.querySelector('.MuiTreeItem-content.Mui-selected');

        expect(selectedContent).toBeTruthy();
        expect(selectedContent?.textContent).toContain('Second');
    });

    // ── onSelectedItemsChange ───────────────────────────────────────────────

    it('calls onSelectedItemsChange with the itemId array when an item is clicked', async () => {
        const onSelectedItemsChange = vi.fn();
        const { getByText } = renderSimpleTree({
            items: [{ itemId: 'select-me', label: 'Select Me' }],
            onSelectedItemsChange,
        });

        act(() => {
            fireEvent.click(getByText('Select Me'));
        });

        await waitFor(() => {
            expect(onSelectedItemsChange).toHaveBeenCalledWith(['select-me']);
        });
    });

    // ── Search with regex metacharacters ────────────────────────────────────

    describe('search with regex metacharacters', () => {
        it.each(['(', '[', '*', '+', '?', '{', '\\'])(
            'does not throw when query contains "%s" and a label contains the same character',
            async (special) => {
                const { getByRole } = renderSimpleTree({
                    items: [{ itemId: '1', label: `Folder ${special}draft${special}` }],
                    withSearch: true,
                    searchDebounceTime: 0,
                });

                await waitFor(() => {
                    expect(() => {
                        fireEvent.change(getByRole('textbox'), { target: { value: special } });
                    }).not.toThrow();
                });
            },
        );

        it('highlights matches around the literal metacharacter', async () => {
            const { getByRole, container } = renderSimpleTree({
                items: [{ itemId: '1', label: 'Apple (red)' }],
                withSearch: true,
                searchDebounceTime: 0,
            });

            act(() => {
                fireEvent.change(getByRole('textbox'), { target: { value: '(' } });
            });

            await waitFor(() => {
                expect(container.querySelector('span.Ring-TreeView-matchedLabel')).not.toBeNull();
            });
        });
    });

    // ── Label sanitization (XSS) ────────────────────────────────────────────

    describe('label sanitization', () => {
        it('strips disallowed HTML from labels', () => {
            const { container, queryByText } = renderSimpleTree({
                items: [{ itemId: 'xss', label: '<img src=x onerror=alert(1)>Safe' }],
            });

            expect(container.querySelector('img[src="x"]')).toBeNull();
            expect(queryByText('Safe')).toBeTruthy();
        });

        it('removes <script> tags from labels', () => {
            const { container } = renderSimpleTree({
                items: [{ itemId: 'xss', label: 'Hi<script>window.__pwned=true</script>' }],
            });

            expect(container.querySelector('script')).toBeNull();
        });

        it('preserves <span> tags (used by built-in search highlighting)', () => {
            const { container } = renderSimpleTree({
                items: [{ itemId: 'span', label: 'Hello <span class="hl">world</span>' }],
            });

            expect(container.querySelector('span.hl')).not.toBeNull();
        });
    });

    // ── localStorage persistence ────────────────────────────────────────────

    describe('persistence', () => {
        beforeEach(() => localStorage.clear());
        afterEach(() => localStorage.clear());

        it('restores expanded items from localStorage on mount', () => {
            localStorage.setItem(
                'ring-tree-state-my-tree',
                JSON.stringify({ selectedItemId: null, expandedItems: ['parent'] }),
            );

            const { queryByText } = renderSimpleTree({
                items: [
                    {
                        itemId: 'parent',
                        label: 'Parent',
                        expanded: false,
                        items: [{ itemId: 'child', label: 'Persisted Child' }],
                    },
                ],
                persistence: { cacheKey: 'my-tree', restoreExpandedItems: true },
            });

            expect(queryByText('Persisted Child')).toBeTruthy();
        });
    });
});
