import { CommonComponentProps } from '../../../helpers/commonTypes.js';
import { Action } from '../../../types.js';
import { DefaultTreeView, DefaultTreeViewProps } from './DefaultTreeView.js';
import { CompactTreeView, CompactTreeViewProps } from './CompactTreeView.js';

export type VariantType = 'default' | 'compact';
export const globalDynamicItemsCache = new Map<string, { items: TreeViewItem[]; expandedChildren: Set<string> }>();

export interface CommonTreeViewProps extends CommonComponentProps {
    variant: VariantType;
    /**
     * Tree items to be displayed. Their attributes contain itemId, label, items(children),
     * expanded, rowActions, withCheckbox, checked, checkboxDisabled and values for columns.
     */
    items: TreeViewItem[];
    /**
     * Callback fired when the item is expanded or collapsed.
     */
    onExpand?: (itemId: string) => void;
    /**
     * Callback fired when the row is clicked.
     */
    onClickRow?: (itemId: string) => void;
    /**
     * If true, the search box will be shown and user will be able to filter by item labels.
     * @default false
     */
    withSearch?: boolean;
    /**
     * Debounce time for the search box.
     * @default 500
     */
    searchDebounceTime?: number;
    /**
     * Placeholder for the search input. When `withSearch` is true, this will be used as the placeholder text.
     */
    searchPlaceholder?: string;
    /**
     * If specified, this prop controls the selected items. If not provided, the component will manage selection state internally.
     */
    selectedItems?: string[];
    /**
     * Callback fired when the selection changes.
     */
    onSelectedItemsChange?: (itemIds: string[]) => void;
}

export interface TreeViewItem {
    /**
     * Unique identifier of the item.
     */
    itemId: string;
    /**
     * Label of the item to be displayed.
     */
    label: string;
    /**
     * Array of child items.
     */
    items?: TreeViewItem[];
    /**
     * If true, the item will be expanded and its children will be visible.
     */
    expanded?: boolean;
    /**
     * Actions to be shown on the right side of the item.
     * supported only in default variant
     */
    rowActions?: Action[];
    /** If true, a checkbox will be shown next to the item.
     * supported only in default variant
     * @default false
     */
    withCheckbox?: boolean;
    /**
     * If true, the checkbox will be checked.
     * @default false
     */
    checked?: boolean;
    /**
     * If true, the checkbox will be disabled (not clickable).
     */
    checkboxDisabled?: boolean;
    /**
     * Element will be rendered on the right side of the item.
     */
    element?: React.JSX.Element;
    /**
     * Function to load dynamic items when the item is expanded.
     * When this is provided, items will be loaded dynamically.
     * The function receives the current TreeViewItem as a parameter.
     */
    loadItems?: (item: TreeViewItem) => Promise<TreeViewItem[]> | TreeViewItem[];

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [columnName: string]: any;
}

export type TreeViewProps = DefaultTreeViewProps | CompactTreeViewProps;

export const TreeView = (props: TreeViewProps): React.JSX.Element => {
    switch (props.variant) {
        case 'compact':
            return <CompactTreeView {...props} />;
        default:
            return <DefaultTreeView {...props} />;
    }
};

export function getExpandedItemIds(items: TreeViewItem[]): string[] {
    const expandedItemIds: string[] = [];

    function traverse(items: TreeViewItem[]): void {
        items.forEach((item) => {
            if (item.expanded) {
                expandedItemIds.push(item.itemId);

                if (item.items) {
                    traverse(item.items);
                }
            }
        });
    }

    traverse(items);

    return expandedItemIds;
}

export function filterItems(
    items: TreeViewItem[],
    query: string,
    dynamicItemsCache?: Map<
        string,
        {
            items: TreeViewItem[];
            expandedChildren: Set<string>;
        }
    >,
): TreeViewItem[] {
    return items
        .map((item) => {
            const lowercaseLabel = item.label.toLowerCase();
            const lowercaseQuery = query.toLowerCase();
            const queryWords = lowercaseQuery.trim().split(/\s+/);
            const isMatch = queryWords.every((word) => lowercaseLabel.includes(word));

            let highlightedLabel = item.label;

            if (isMatch) {
                highlightedLabel = queryWords.reduce((label, word) => {
                    return label.replace(
                        new RegExp(word, 'gi'),
                        (match) => `<span class="Ring-TreeView-matchedLabel">${match}</span>`,
                    );
                }, item.label);
            }

            let filteredChildren: TreeViewItem[] = [];

            if (item.items) {
                filteredChildren = filterItems(item.items, query, dynamicItemsCache);
            }

            if (item.loadItems && dynamicItemsCache?.has(item.itemId)) {
                const cachedData = dynamicItemsCache.get(item.itemId);

                if (cachedData?.items) {
                    const dynamicFilteredChildren = filterItems(cachedData.items, query, dynamicItemsCache);
                    filteredChildren = [...filteredChildren, ...dynamicFilteredChildren];
                }
            }

            if (filteredChildren.length > 0) {
                return {
                    ...item,
                    label: highlightedLabel,
                    items: filteredChildren,
                };
            }

            if (isMatch) {
                return { ...item, label: highlightedLabel };
            }

            return null;
        })
        .filter((item) => item !== null) as TreeViewItem[];
}

export function getAllItemIdsFromFilteredItems(
    items: TreeViewItem[],
    dynamicItemsCache?: Map<string, { items: TreeViewItem[]; expandedChildren: Set<string> }>,
): string[] {
    const allIds: string[] = [];

    function traverse(items: TreeViewItem[]): void {
        items.forEach((item) => {
            allIds.push(item.itemId);

            if (item.items && item.items.length > 0) {
                traverse(item.items);
            }

            if (item.loadItems && dynamicItemsCache?.has(item.itemId)) {
                const cachedData = dynamicItemsCache.get(item.itemId);

                if (cachedData?.items) {
                    traverse(cachedData.items);
                }
            }
        });
    }

    traverse(items);

    return allIds;
}

export function getAllExpandedItemsFromCache(
    dynamicItemsCache?: Map<string, { items: TreeViewItem[]; expandedChildren: Set<string> }>,
): string[] {
    if (!dynamicItemsCache) {
        return [];
    }

    const allExpandedIds: string[] = [];

    function collectExpandedChildren(items: TreeViewItem[]): void {
        items.forEach((item) => {
            if (dynamicItemsCache?.has(item.itemId)) {
                const cachedData = dynamicItemsCache.get(item.itemId);

                if (cachedData?.expandedChildren) {
                    allExpandedIds.push(...Array.from(cachedData.expandedChildren));
                }

                // Recursively check cached items
                if (cachedData?.items) {
                    collectExpandedChildren(cachedData.items);
                }
            }
        });
    }

    for (const [parentId, cachedData] of dynamicItemsCache.entries()) {
        if (cachedData.items.length > 0) {
            allExpandedIds.push(parentId);
        }

        if (cachedData.expandedChildren) {
            allExpandedIds.push(...Array.from(cachedData.expandedChildren));
        }

        collectExpandedChildren(cachedData.items);
    }

    return [...new Set(allExpandedIds)]; // Remove duplicates
}
