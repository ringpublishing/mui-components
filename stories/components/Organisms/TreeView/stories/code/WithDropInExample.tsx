import React, { useState } from 'react';
import { TreeView, TreeViewItem } from '@ringpublishing/mui-components';
import { EditOutlined } from '@mui/icons-material';

const exampleItems: TreeViewItem[] = [
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
];

function moveItems(
    items: TreeViewItem[],
    sourceAbsolutePosition: number[],
    destinationAbsolutePosition: number[],
): TreeViewItem[] {
    const newItems = [...items];

    function getArrayAndIndex(path: number[]): { array: TreeViewItem[] | undefined; index: number } {
        let array: TreeViewItem[] | undefined = newItems;
        let index = path[0];

        for (let i = 0; i < path.length - 1; i++) {
            const currentIndex = path[i];

            if (!array?.[currentIndex]?.items) {
                return { array: undefined, index: -1 };
            }

            array = array[currentIndex].items;
            index = path[i + 1];
        }

        return { array, index };
    }

    const { array: sourceArray, index: sourceIndex } = getArrayAndIndex(sourceAbsolutePosition);
    const { array: destinationArray, index: destinationIndex } = getArrayAndIndex(destinationAbsolutePosition);

    if (!sourceArray || sourceIndex === -1 || !sourceArray[sourceIndex]) {
        throw new Error('Invalid source position');
    }

    const [movedItem] = sourceArray.splice(sourceIndex, 1);

    if (!destinationArray) {
        throw new Error('Invalid destination position');
    }

    destinationArray.splice(destinationIndex, 0, movedItem);

    return newItems;
}

function dropInItem(items: TreeViewItem[], itemId: string, dropInItemId: string): TreeViewItem[] {
    let movedItem: TreeViewItem | null = null;

    function removeItem(arr: TreeViewItem[]): TreeViewItem[] {
        return arr.reduce<TreeViewItem[]>((acc, item) => {
            if (item.itemId === itemId) {
                movedItem = item;

                return acc;
            }

            if (item.items) {
                acc.push({ ...item, items: removeItem(item.items) });
            } else {
                acc.push(item);
            }

            return acc;
        }, []);
    }

    function insertItem(arr: TreeViewItem[]): TreeViewItem[] {
        return arr.map((item) => {
            if (item.itemId === dropInItemId) {
                const children = item.items ? [...item.items] : [];

                if (movedItem) {
                    children.push({ ...movedItem, items: movedItem.items ?? undefined });
                }

                return { ...item, items: children };
            }

            if (item.items) {
                return { ...item, items: insertItem(item.items) };
            }

            return item;
        });
    }

    const withoutItem = removeItem(items);

    if (!movedItem) {
        return items;
    }

    return insertItem(withoutItem);
}

export default function WithDropInExample(): React.JSX.Element {
    const [items, setItems] = useState(exampleItems);

    const handleDragEnd = (sourceAbsolutePosition: number[], destinationAbsolutePosition: number[]): void => {
        setItems((prevItems) => moveItems(prevItems, sourceAbsolutePosition, destinationAbsolutePosition));
    };

    const handleDropIn = (itemId: string, dropInItemId: string): void => {
        setItems((prevItems) => dropInItem(prevItems, itemId, dropInItemId));
    };

    const checkItem = (items: TreeViewItem[], itemId: string, checked: boolean): TreeViewItem[] => {
        const newItems: TreeViewItem[] = [];

        items.forEach((item) => {
            if (item.itemId === itemId) {
                newItems.push({ ...item, checked });
            } else if (item.items) {
                newItems.push({ ...item, items: checkItem(item.items, itemId, checked) });
            } else {
                newItems.push(item);
            }
        });

        return newItems;
    };

    return (
        <TreeView
            items={items}
            onDragAndDropEnd={handleDragEnd}
            onDropIn={handleDropIn}
            showColumnHeaders={true}
            itemsLabelColumnHeader={'Name'}
            columns={[
                { name: 'column1', width: 100, header: 'First Column' },
                { name: 'column2', width: 100, header: 'Second Column' },
            ]}
            dragAndDropTooltipTitle={'To drag and drop collapse the item first'}
            onCheckboxChange={(itemId, checked): void => {
                setItems(checkItem(items, itemId, checked));
            }}
            variant="default"
        />
    );
}
