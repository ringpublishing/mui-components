import { act, Component, ReactNode } from 'react';
import { vi, describe, it, expect } from 'vitest';
import { ThemeProvider } from '@mui/material';
import { Pencil } from 'lucide-react';
import { render, fireEvent, RenderOptions, RenderResult, waitFor } from '@testing-library/react';

import { getCreatedTheme, TreeView, TreeViewItem, TreeViewProps } from '../../../src/index.js';
import { filterItems } from '../../../src/components/Organisms/TreeView/TreeView.js';

class ErrorBoundary extends Component<{ children: ReactNode }, { error: Error | null }> {
    public static getDerivedStateFromError(error: Error): { error: Error } {
        return { error };
    }

    public state: { error: Error | null } = { error: null };

    public render(): ReactNode {
        return this.state.error ? <p role="alert">{this.state.error.message}</p> : this.props.children;
    }
}

describe('Component: TreeView', () => {
    function renderTreeView(mockProps: TreeViewProps, options: RenderOptions = {}): RenderResult {
        const theme = getCreatedTheme('light');

        return render(
            <ThemeProvider theme={theme}>
                <TreeView {...mockProps} />
            </ThemeProvider>,
            options,
        );
    }

    it('should render correctly with default props', () => {
        const mockProps: TreeViewProps = {
            variant: 'compact',
            items: [
                { itemId: '1', label: 'Item 1' },
                { itemId: '2', label: 'Item 2' },
            ],
        };

        const { container } = renderTreeView(mockProps);

        expect(container).toMatchSnapshot();
    });

    it('should render correctly with all props', () => {
        const mockProps: TreeViewProps = {
            variant: 'default',
            items: [
                {
                    itemId: '0',
                    label: 'Item 0',
                    column1: 'Column1 0',
                    column2: 'Column2 0',
                    expanded: true,
                    rowActions: [{ label: 'Edit', icon: <Pencil /> }],
                    checkboxDisabled: true,
                    items: [
                        {
                            itemId: '0.0',
                            label: 'Item 0.0',
                            column1: 'Column1 0.0',
                            column2: 'Column2 0.0',
                            checked: true,
                        },
                        {
                            itemId: '0.1',
                            label: 'Item 0.1',
                            column1: 'Column1 0.1',
                            column2: 'Column2 0.1',
                            checked: true,

                            items: [
                                {
                                    itemId: '0.1.0',
                                    label: 'Item 0.1.0',
                                    column1: 'Column1 0.1.0',
                                    column2: 'Column2 0.1.0',
                                },
                                {
                                    itemId: '0.1.1',
                                    label: 'Item 0.1.1',
                                    column1: 'Column1 0.1.1',
                                    column2: 'Column2 0.1.1',
                                },
                            ],
                        },
                        {
                            itemId: '0.2',
                            label: 'Item 0.2',
                            column1: 'Column1 0.2',
                            column2: 'Column2 0.2',
                            withCheckbox: false,
                        },
                        {
                            itemId: '0.3',
                            label: 'Item 0.3',
                            column1: 'Column1 0.3',
                            column2: 'Column2 0.3',
                            withCheckbox: false,
                        },
                    ],
                },
                {
                    itemId: '1',
                    label: 'Item 1',
                    column1: 'Column1 1',
                    column2: 'Column2 1',
                    rowActions: [{ label: 'Edit', icon: <Pencil /> }],

                    items: [
                        {
                            itemId: '1.0',
                            label: 'Item 1.0',
                            column1: 'Column1 1.0',
                            column2: 'Column2 1.0',
                        },
                        {
                            itemId: '1.1',
                            label: 'Item 1.1',
                            column1: 'Column1 1.1',
                            column2: 'Column2 1.1',
                        },
                    ],
                },
                {
                    itemId: '2',
                    label: 'Item 2',
                    column1: 'Column1 2',
                    column2: 'Column2 2',
                    items: [
                        {
                            itemId: '2.0',
                            label: 'Item 2.0',
                            column1: 'Column1 2.0',
                            column2: 'Column2 2.0',
                        },
                        {
                            itemId: '2.1',
                            label: 'Item 2.1',
                            column1: 'Column1 2.1',
                            column2: 'Column2 2.1',
                        },
                    ],
                },
                {
                    itemId: '3',
                    label: 'Item 3',
                    column1: 'Column1 3',
                    column2: 'Column2 3',
                    rowActions: [{ label: 'Edit', icon: <Pencil /> }],
                    checked: true,
                },
            ],
            showColumnHeaders: true,
            itemsLabelColumnHeader: 'Name',
            columns: [
                { name: 'column1', width: 100, header: 'First Column' },
                { name: 'column2', width: 100, header: 'Second Column' },
            ],
            onExpand: vi.fn(),
            onCheckboxChange: vi.fn(),
            withSearch: true,
            onClickRow: vi.fn(),
            onDragAndDropEnd: vi.fn(),
            dragAndDropTooltipPlacement: 'bottom',
            dragAndDropTooltipTitle: 'Drag and drop',
        };

        const { container } = renderTreeView(mockProps);

        expect(container).toMatchSnapshot();
    });

    it('should filter items based on search query', () => {
        const mockProps: TreeViewProps = {
            variant: 'default',
            items: [
                { itemId: '1', label: 'Item 1' },
                { itemId: '2', label: 'Another Item' },
            ],
            withSearch: true,
            columns: [{ name: 'column1', width: 100, header: 'First Column' }],
            showColumnHeaders: false,
        };

        const { getByPlaceholderText, queryByText } = renderTreeView(mockProps);

        fireEvent.change(getByPlaceholderText(''), { target: { value: 'Another' } });

        waitFor(() => {
            expect(queryByText('Item 1')).toBeNull();
            expect(queryByText('Another Item')).toBeDefined();
        });
    });

    it('should call onCheckboxChange when a checkbox is toggled', () => {
        const onCheckboxChangeMock = vi.fn();
        const mockProps: TreeViewProps = {
            variant: 'default',
            items: [{ itemId: '1', label: 'Item 1', withCheckbox: true, checked: false }],
            onCheckboxChange: onCheckboxChangeMock,
            columns: [{ name: 'column1', width: 100, header: 'First Column' }],
            showColumnHeaders: false,
        };

        const { getByRole } = renderTreeView(mockProps);

        fireEvent.click(getByRole('checkbox'));

        expect(onCheckboxChangeMock).toHaveBeenCalledWith('1', true);
    });

    describe('XSS / label sanitization', () => {
        it('should strip malicious HTML from item labels while preserving highlight spans', () => {
            const maliciousLabel = '<img src="x" onerror="alert(1)">safe text<script>alert(2)</script>';
            const mockProps: TreeViewProps = {
                variant: 'default',
                items: [{ itemId: 'xss-1', label: maliciousLabel }],
                columns: [],
                showColumnHeaders: false,
            };

            const { container } = renderTreeView(mockProps);

            expect(container.querySelector('script')).toBeNull();
            expect(container.querySelector('img[onerror]')).toBeNull();
            expect(container.innerHTML).not.toContain('onerror');
            expect(container.innerHTML).not.toContain('<script');
        });

        it('should strip malicious HTML from highlighted labels produced by search', async () => {
            const maliciousLabel = '<img src="x" onerror="alert(1)">safe text';
            const mockProps: TreeViewProps = {
                variant: 'default',
                items: [{ itemId: 'xss-2', label: maliciousLabel }],
                columns: [],
                showColumnHeaders: false,
                withSearch: true,
                searchPlaceholder: 'Search...',
            };

            const { getByPlaceholderText, container } = renderTreeView(mockProps);

            fireEvent.change(getByPlaceholderText('Search...'), { target: { value: 'safe' } });

            await waitFor(() => {
                expect(container.querySelector('.Ring-TreeView-matchedLabel')).not.toBeNull();
                expect(container.querySelector('img[onerror]')).toBeNull();
                expect(container.innerHTML).not.toContain('onerror');
                expect(container.innerHTML).not.toContain('<script');
            });
        });

        it('should allow only span tags – other HTML tags in labels must be stripped', () => {
            const labelWithTags = '<b>bold</b> and <a href="http://evil.com">link</a> text';
            const mockProps: TreeViewProps = {
                variant: 'default',
                items: [{ itemId: 'xss-3', label: labelWithTags }],
                columns: [],
                showColumnHeaders: false,
            };

            const { container } = renderTreeView(mockProps);

            expect(container.querySelector('b')).toBeNull();
            expect(container.querySelector('a')).toBeNull();
            expect(container.textContent).toContain('bold');
            expect(container.textContent).toContain('link');
        });
    });

    describe('Compact variant', () => {
        it('should handle item selection in compact variant', () => {
            const mockProps: TreeViewProps = {
                variant: 'compact',
                items: [
                    { itemId: '1', label: 'Item 1' },
                    { itemId: '2', label: 'Item 2' },
                    { itemId: '3', label: 'Item 3' },
                ],
            };

            const { getByText } = renderTreeView(mockProps);

            fireEvent.click(getByText('Item 2'));

            expect(getByText('Item 2')).toBeDefined();
        });

        it('should render compact variant without search when withSearch is false', () => {
            const mockProps: TreeViewProps = {
                variant: 'compact',
                items: [
                    { itemId: '1', label: 'Item 1' },
                    { itemId: '2', label: 'Item 2' },
                ],
                withSearch: false,
            };

            const { container } = renderTreeView(mockProps);

            expect(container.querySelector('input')).toBeNull();
            expect(container).toMatchSnapshot();
        });

        it('should filter and expands items during search in compact variant', () => {
            const mockProps: TreeViewProps = {
                variant: 'compact',
                items: [
                    {
                        itemId: '1',
                        label: 'Parent Item',
                        items: [
                            { itemId: '1.1', label: 'Target Child' },
                            { itemId: '1.2', label: 'Other Child' },
                        ],
                    },
                    { itemId: '2', label: 'Another Item' },
                ],
                withSearch: true,
                searchPlaceholder: 'Search items...',
            };

            const { getByPlaceholderText, queryByText } = renderTreeView(mockProps);

            const searchInput = getByPlaceholderText('Search items...');
            fireEvent.change(searchInput, { target: { value: 'Target' } });

            waitFor(() => {
                expect(queryByText('Target Child')).toBeDefined();
                expect(queryByText('Another Item')).toBeNull();
            });
        });

        it('should preserve expanded state when clearing search in compact variant', () => {
            const mockProps: TreeViewProps = {
                variant: 'compact',
                items: [
                    {
                        itemId: '1',
                        label: 'Parent Item',
                        expanded: true,
                        items: [{ itemId: '1.1', label: 'Child Item' }],
                    },
                ],
                withSearch: true,
            };

            const { getByPlaceholderText, queryByText } = renderTreeView(mockProps);

            const searchInput = getByPlaceholderText('');
            fireEvent.change(searchInput, { target: { value: 'test' } });
            fireEvent.change(searchInput, { target: { value: '' } });

            waitFor(() => {
                expect(queryByText('Child Item')).toBeDefined();
            });
        });
    });

    describe('row actions button', () => {
        const items: TreeViewItem[] = [
            {
                itemId: '1',
                label: 'Item 1',
                expanded: true,
                rowActions: [{ label: 'Edit' }],
                items: [{ itemId: '1.1', label: 'Item 1.1', rowActions: [{ label: 'Edit' }] }],
            },
        ];

        it('is named "More actions" by default', () => {
            const { getByRole } = renderTreeView({ variant: 'default', items: [{ ...items[0], items: undefined }] });

            expect(getByRole('button', { name: 'More actions' })).toBeTruthy();
        });

        it('takes its name from rowActionsAriaLabel on every nesting level', () => {
            const { getAllByRole, queryByRole } = renderTreeView({
                variant: 'default',
                items,
                rowActionsAriaLabel: 'Row options',
            });

            expect(getAllByRole('button', { name: 'Row options' })).toHaveLength(2);
            expect(queryByRole('button', { name: 'More actions' })).toBeNull();
        });

        it('falls back to "More actions" when rowActionsAriaLabel is blank', () => {
            const { getAllByRole } = renderTreeView({ variant: 'default', items, rowActionsAriaLabel: '  ' });

            expect(getAllByRole('button', { name: 'More actions' })).toHaveLength(2);
        });
    });

    describe('row accessibility', () => {
        it('keeps the expand icon button out of the tab order and away from assistive technology', () => {
            const { getByTestId, queryAllByRole } = renderTreeView({
                variant: 'default',
                items: [{ itemId: 'parent', label: 'Parent', items: [{ itemId: 'child', label: 'Child' }] }],
            });

            const expand = getByTestId('ring-treeview-item-parent-expand');

            expect(expand.getAttribute('tabindex')).toBe('-1');
            expect(expand.getAttribute('aria-hidden')).toBe('true');
            expect(queryAllByRole('button', { name: '' })).toHaveLength(0);
        });

        it('names each row checkbox after the text of its label', () => {
            const { getByRole } = renderTreeView({
                variant: 'default',
                items: [{ itemId: 'tj', label: 'Tom &amp; <span>Jerry</span>', checked: true }],
                onCheckboxChange: vi.fn(),
            });

            expect((getByRole('checkbox', { name: 'Tom & Jerry' }) as HTMLInputElement).checked).toBe(true);
        });

        it('renders the drag-and-drop live region outside the tree', () => {
            renderTreeView({
                variant: 'default',
                items: [{ itemId: '1', label: 'Item 1' }],
                onDragAndDropEnd: vi.fn(),
            });

            expect(document.querySelector('[role="tree"] [role="status"]')).toBeNull();
            expect(document.querySelector('[role="status"][aria-live]')).not.toBeNull();
        });

        it('loads a dynamic row expanded with the keyboard', async () => {
            const loadItems = vi.fn(() => [{ itemId: 'kbd-child', label: 'Loaded child' }]);
            const { getByRole, findByText } = renderTreeView({
                variant: 'default',
                items: [{ itemId: 'kbd-dynamic', label: 'Dynamic', loadItems }],
            });
            const row = getByRole('treeitem');

            act(() => {
                row.focus();
            });
            fireEvent.keyDown(row, { key: 'ArrowRight' });

            expect(await findByText('Loaded child')).toBeTruthy();
            expect(loadItems).toHaveBeenCalledTimes(1);
        });

        it('loads a dynamic row once when its icon is clicked', async () => {
            const loadItems = vi.fn(() => [{ itemId: 'click-child', label: 'Clicked child' }]);
            const { getByTestId, findByText } = renderTreeView({
                variant: 'default',
                items: [{ itemId: 'click-dynamic', label: 'Dynamic', loadItems }],
            });

            fireEvent.click(getByTestId('ring-treeview-item-click-dynamic-expand'));

            expect(await findByText('Clicked child')).toBeTruthy();
            expect(loadItems).toHaveBeenCalledTimes(1);
        });

        it('does not load a dynamic row that search expands by itself', async () => {
            const loadItems = vi.fn(() => [{ itemId: 'search-child', label: 'Child' }]);
            const { getByRole } = renderTreeView({
                variant: 'default',
                items: [{ itemId: 'search-dynamic', label: 'Dynamic folder', loadItems }],
                withSearch: true,
                searchDebounceTime: 0,
            });

            act(() => {
                fireEvent.change(getByRole('textbox'), { target: { value: 'Dynamic' } });
            });

            await waitFor(() => {
                expect(getByRole('treeitem').getAttribute('aria-expanded')).toBe('true');
            });
            expect(loadItems).not.toHaveBeenCalled();
        });
    });

    describe('dynamic rows', () => {
        it('loads the children again each time the row is expanded', async () => {
            const loadItems = vi
                .fn()
                .mockReturnValueOnce([{ itemId: 'reload-child-1', label: 'First load' }])
                .mockReturnValueOnce([{ itemId: 'reload-child-2', label: 'Second load' }]);
            const { getByTestId, findByTestId, findByText, queryByText } = renderTreeView({
                variant: 'default',
                items: [{ itemId: 'reload', label: 'Dynamic', loadItems }],
            });

            fireEvent.click(getByTestId('ring-treeview-item-reload-expand'));
            expect(await findByText('First load')).toBeTruthy();

            fireEvent.click(getByTestId('ring-treeview-item-reload-collapse'));
            fireEvent.click(await findByTestId('ring-treeview-item-reload-expand'));

            expect(await findByText('Second load')).toBeTruthy();
            expect(queryByText('First load')).toBeNull();
            expect(loadItems).toHaveBeenCalledTimes(2);
        });

        it('replaces the children of a row that loads the same itemIds on every expansion', async () => {
            const loadItems = vi
                .fn()
                .mockReturnValueOnce([
                    { itemId: 'same-1', label: 'First load 1' },
                    { itemId: 'same-2', label: 'First load 2' },
                ])
                .mockReturnValueOnce([
                    { itemId: 'same-1', label: 'Second load 1' },
                    { itemId: 'same-2', label: 'Second load 2' },
                ]);
            const { getByTestId, findByTestId, findByText, queryByText, getAllByRole, queryByRole } = renderTreeView({
                variant: 'default',
                items: [{ itemId: 'same', label: 'Dynamic', loadItems }],
            });

            fireEvent.click(getByTestId('ring-treeview-item-same-expand'));
            expect(await findByText('First load 2')).toBeTruthy();

            fireEvent.click(getByTestId('ring-treeview-item-same-collapse'));
            fireEvent.click(await findByTestId('ring-treeview-item-same-expand'));

            expect(await findByText('Second load 2')).toBeTruthy();
            expect(queryByText('First load 1')).toBeNull();
            expect(getAllByRole('treeitem')).toHaveLength(3);
            expect(queryByRole('progressbar')).toBeNull();
            expect(loadItems).toHaveBeenCalledTimes(2);
        });

        // Rows under a dynamic row inherit its loadItems, so a loadItems that ignores the row it gets loads the same
        // rows again for each of them. The label getter stops a tree that renders forever instead of hanging the run.
        function countedRow(itemId: string, label: string): TreeViewItem & { renders: () => number } {
            let renders = 0;

            return {
                itemId,
                get label(): string {
                    renders += 1;

                    if (renders > 200) {
                        throw new Error(`${itemId} was rendered inside itself forever`);
                    }

                    return label;
                },
                renders: (): number => renders,
            };
        }

        function renderInBoundary(items: TreeViewItem[]): RenderResult {
            return render(
                <ThemeProvider theme={getCreatedTheme('light')}>
                    <ErrorBoundary>
                        <TreeView variant="default" items={items} />
                    </ErrorBoundary>
                </ThemeProvider>,
            );
        }

        it('leaves out a row that loadItems returns inside itself or inside a row below it', async () => {
            const file = countedRow('cycle-file', 'File');
            const folderAgain = countedRow('cycle-folder', 'Folder again');
            const loadItems = vi.fn(() => [file, folderAgain]);
            const { getByTestId, findByTestId, getAllByRole, queryByRole, queryByText } = renderInBoundary([
                { itemId: 'cycle-folder', label: 'Folder', loadItems },
            ]);

            fireEvent.click(getByTestId('ring-treeview-item-cycle-folder-expand'));
            fireEvent.click(await findByTestId('ring-treeview-item-cycle-file-expand'));

            await waitFor(() => {
                expect(loadItems).toHaveBeenCalledTimes(2);
                expect(queryByRole('progressbar')).toBeNull();
            });
            expect(queryByRole('alert')).toBeNull();
            expect(queryByText('Folder again')).toBeNull();
            expect(getAllByRole('treeitem')).toHaveLength(2);
            expect(file.renders()).toBeLessThan(50);
        });

        it('fails with the duplicate itemId instead of freezing when loadItems returns rows already in the tree', async () => {
            const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined);
            const loadItems = vi.fn(() => [countedRow('same-file-1', 'File 1'), countedRow('same-file-2', 'File 2')]);
            const { getByTestId, findByTestId, findByRole } = renderInBoundary([
                { itemId: 'same-folder', label: 'Folder', loadItems },
            ]);

            fireEvent.click(getByTestId('ring-treeview-item-same-folder-expand'));
            fireEvent.click(await findByTestId('ring-treeview-item-same-file-1-expand'));

            expect((await findByRole('alert')).textContent).toMatch(/same id.*"same-file-2"/);
            consoleError.mockRestore();
        });

        it('loads the children of a row with its own loadItems when another tree used the same itemId', async () => {
            const firstLoadItems = vi.fn(() => [{ itemId: 'first-child', label: 'First tree child' }]);
            const secondLoadItems = vi.fn(() => [{ itemId: 'second-child', label: 'Second tree child' }]);
            const firstTree = renderTreeView({
                variant: 'default',
                items: [{ itemId: 'shared', label: 'Dynamic', loadItems: firstLoadItems }],
            });

            fireEvent.click(firstTree.getByTestId('ring-treeview-item-shared-expand'));
            expect(await firstTree.findByText('First tree child')).toBeTruthy();
            firstTree.unmount();

            const secondTree = renderTreeView({
                variant: 'default',
                items: [{ itemId: 'shared', label: 'Dynamic', loadItems: secondLoadItems }],
            });

            fireEvent.click(secondTree.getByTestId('ring-treeview-item-shared-expand'));

            expect(await secondTree.findByText('Second tree child')).toBeTruthy();
            expect(secondTree.queryByText('First tree child')).toBeNull();
            expect(firstLoadItems).toHaveBeenCalledTimes(1);
            expect(secondLoadItems).toHaveBeenCalledTimes(1);
        });

        it('keeps the loaded children of a row that search hides and brings back, without loading them again', async () => {
            const loadItems = vi.fn(() => [{ itemId: 'hidden-child', label: 'Loaded child' }]);
            const { getByTestId, getByRole, findByText, queryByText } = renderTreeView({
                variant: 'default',
                items: [
                    { itemId: 'hidden', label: 'Dynamic folder', loadItems },
                    { itemId: 'other', label: 'Other' },
                ],
                withSearch: true,
                searchDebounceTime: 0,
            });

            fireEvent.click(getByTestId('ring-treeview-item-hidden-expand'));
            expect(await findByText('Loaded child')).toBeTruthy();

            act(() => {
                fireEvent.change(getByRole('textbox'), { target: { value: 'Other' } });
            });
            await waitFor(() => {
                expect(queryByText('Dynamic folder')).toBeNull();
            });

            act(() => {
                fireEvent.change(getByRole('textbox'), { target: { value: '' } });
            });

            expect(await findByText('Loaded child')).toBeTruthy();
            expect(loadItems).toHaveBeenCalledTimes(1);
        });
    });
});

describe('TreeView filterItems — regex metacharacters in the query', () => {
    it('does not throw when the query is a regex metacharacter that also appears in the label', () => {
        const items: TreeViewItem[] = [{ itemId: '1', label: 'Apple (red)' }];

        expect(() => filterItems(items, '(')).not.toThrow();

        const result = filterItems(items, '(');

        expect(result).toHaveLength(1);
        expect(result[0].label).toContain('Ring-TreeView-matchedLabel');
    });

    it('does not throw on "[" / "*" / "+" / "?" / "{" / "\\\\"', () => {
        const items: TreeViewItem[] = [
            { itemId: '1', label: 'Item [draft]' },
            { itemId: '2', label: 'Note * important' },
            { itemId: '3', label: 'Path C:\\\\users' },
            { itemId: '4', label: 'Plus + sign' },
            { itemId: '5', label: 'Maybe ? value' },
            { itemId: '6', label: 'Brace { open' },
        ];

        for (const q of ['[', '*', '\\', '+', '?', '{']) {
            expect(() => filterItems(items, q)).not.toThrow();
        }
    });
});
