import { SimpleTreeView } from '@mui/x-tree-view';

import {
    CommonTreeViewProps,
    filterItems,
    getAllItemIdsFromFilteredItems,
    getAllExpandedItemsFromCache,
    globalDynamicItemsCache,
    getExpandedItemIds,
} from './TreeView.js';
import { TreeViewItemComponent } from './TreeViewItem.js';
import { useMemo, useState, useEffect } from 'react';
import { SearchBox } from '../../Molecules/SearchBox/SearchBox.js';

export interface CompactTreeViewProps extends CommonTreeViewProps {
    variant: 'compact';
}

export const CompactTreeView = (props: CompactTreeViewProps): React.JSX.Element => {
    const {
        items,
        withSearch,
        searchDebounceTime,
        searchPlaceholder,
        onExpand,
        onClickRow,
        selectedItems,
        onSelectedItemsChange,
        dataTestIdSuffix,
    } = props;
    const [search, setSearch] = useState('');
    const [expandedItems, setExpandedItems] = useState<string[]>(getExpandedItemIds(items));
    const filteredItems = useMemo(
        () => (search !== '' ? filterItems(items, search, globalDynamicItemsCache) : items),
        [items, search],
    );
    const [itemsExpandedBeforeSearch, setItemsExpandedBeforeSearch] = useState(expandedItems);
    const [internalSelectedItem, setInternalSelectedItem] = useState<string | null>(null);

    const effectiveSelectedItem = selectedItems !== undefined ? selectedItems[0] || null : internalSelectedItem;

    const handleSelectionChange = (itemId: string | null): void => {
        if (selectedItems === undefined) {
            setInternalSelectedItem(itemId);
        }

        onSelectedItemsChange?.(itemId ? [itemId] : []);
    };

    useEffect(() => {
        if (search !== '') {
            const filteredItemIds = getAllItemIdsFromFilteredItems(filteredItems, globalDynamicItemsCache);
            const cachedExpandedIds = getAllExpandedItemsFromCache(globalDynamicItemsCache);

            setExpandedItems((prev) => {
                const mergedIds = new Set([...prev, ...filteredItemIds, ...cachedExpandedIds]);

                return Array.from(mergedIds);
            });
        } else {
            setExpandedItems(itemsExpandedBeforeSearch);
        }
    }, [search, filteredItems, itemsExpandedBeforeSearch]);

    const handleExpandToggle = (itemId: string): void => {
        setExpandedItems((prev) => (prev.includes(itemId) ? prev.filter((id) => id !== itemId) : [...prev, itemId]));
        setItemsExpandedBeforeSearch((prev) =>
            prev.includes(itemId) ? prev.filter((id) => id !== itemId) : [...prev, itemId],
        );

        if (onExpand) {
            onExpand(itemId);
        }
    };

    return (
        <SimpleTreeView
            expansionTrigger="iconContainer"
            expandedItems={expandedItems}
            selectedItems={effectiveSelectedItem}
            onSelectedItemsChange={(e, itemId): void => handleSelectionChange(itemId)}
            onItemExpansionToggle={(e, itemId): void => handleExpandToggle(itemId)}
            onItemClick={(e, itemId): void => {
                e.preventDefault();
                onClickRow?.(itemId);
            }}
        >
            {withSearch && (
                <SearchBox
                    defaultValue={''}
                    searchFunc={setSearch}
                    debounceTime={searchDebounceTime}
                    sx={{
                        height: '40px',
                        borderRadius: '4px',
                        marginY: 1,
                        border: 'none',
                        paddingLeft: '8px',
                    }}
                    labels={{ placeholder: searchPlaceholder }}
                    dataTestIdSuffix={dataTestIdSuffix}
                />
            )}
            {filteredItems.map((item, index) => (
                <TreeViewItemComponent
                    setExpandedItems={setExpandedItems}
                    currentSelectedItem={effectiveSelectedItem || ''}
                    dragAndDropTooltipPlacement={undefined}
                    expandedItems={expandedItems}
                    order={[index]}
                    variant="compact"
                    key={item.itemId}
                    {...item}
                    isSearchActive={search !== ''}
                    searchQuery={search}
                    dataTestIdSuffix={dataTestIdSuffix}
                />
            ))}
        </SimpleTreeView>
    );
};
