import { vi, describe, it, expect } from 'vitest';
import { ThemeProvider } from '@mui/material';
import { EditOutlined } from '@mui/icons-material';
import { render, fireEvent, RenderOptions, RenderResult, waitFor } from '@testing-library/react';

import { filterItems, getCreatedTheme, TreeView, TreeViewItem, TreeViewProps } from '../../../src/index.js';

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
                    rowActions: [{ label: 'Edit', icon: <EditOutlined /> }],
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
                    rowActions: [{ label: 'Edit', icon: <EditOutlined /> }],

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
                    rowActions: [{ label: 'Edit', icon: <EditOutlined /> }],
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

    it('should call onDragAndDropEnd when drag and drop is completed', () => {
        const onDragAndDropEndMock = vi.fn();
        const mockProps: TreeViewProps = {
            variant: 'default',
            items: [
                { itemId: '1', label: 'Item 1' },
                { itemId: '2', label: 'Item 2' },
            ],
            onDragAndDropEnd: onDragAndDropEndMock,
            columns: [{ name: 'column1', width: 100, header: 'First Column' }],
            showColumnHeaders: false,
        };

        const { getByText } = renderTreeView(mockProps);

        fireEvent.dragStart(getByText('Item 1'));
        fireEvent.dragEnter(getByText('Item 2'));
        fireEvent.drop(getByText('Item 2'));

        waitFor(() => {
            expect(onDragAndDropEndMock).toHaveBeenCalled();
        });
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
