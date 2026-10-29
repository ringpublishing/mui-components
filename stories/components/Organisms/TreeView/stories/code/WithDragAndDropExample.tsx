import React, { useState } from 'react';
import { TreeView, TreeViewItem } from '@ringpublishing/mui-components';
import { Pencil } from 'lucide-react';

const exampleItems: TreeViewItem[] = [
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
];

function moveItems(
    items: TreeViewItem[],
    sourceAbsolutePosition: number[],
    destinationAbsolutePosition: number[],
): TreeViewItem[] {
    // Immutable on purpose: the result goes into React state, so every array and
    // object along the source/destination paths must be a fresh copy — splicing
    // nested arrays in place corrupts the previous state object.
    let movedItem: TreeViewItem | undefined;

    function removeAtPath(arr: TreeViewItem[], path: number[], depth: number): TreeViewItem[] {
        const index = path[depth];

        if (depth === path.length - 1) {
            movedItem = arr[index];

            return arr.filter((item, i) => i !== index);
        }

        return arr.map((item, i) =>
            i === index && item.items ? { ...item, items: removeAtPath(item.items, path, depth + 1) } : item,
        );
    }

    function insertAtPath(arr: TreeViewItem[], path: number[], depth: number): TreeViewItem[] {
        const index = path[depth];

        if (depth === path.length - 1) {
            const next = [...arr];
            next.splice(index, 0, movedItem as TreeViewItem);

            return next;
        }

        if (!arr[index]?.items) {
            throw new Error('Invalid destination position');
        }

        return arr.map((item, i) =>
            i === index ? { ...item, items: insertAtPath(item.items as TreeViewItem[], path, depth + 1) } : item,
        );
    }

    // The caller computes both paths against the tree BEFORE removal. Removing
    // the source shifts its later siblings down by one, so a destination path
    // that descends THROUGH such a sibling must be shifted too. A destination
    // ending in the source's parent array is left as-is: insertion happens
    // after removal, matching the previous splice-based semantics.
    function adjustDestinationPath(source: number[], destination: number[]): number[] {
        const parentDepth = source.length - 1;
        const descendsDeeper = destination.length > source.length;
        const sharesParentPath = source.slice(0, parentDepth).every((segment, i) => segment === destination[i]);

        if (!descendsDeeper || !sharesParentPath) {
            return destination;
        }

        if (destination[parentDepth] === source[parentDepth]) {
            // The destination lies inside the moved subtree itself.
            throw new Error('Invalid destination position');
        }

        if (destination[parentDepth] > source[parentDepth]) {
            const adjusted = [...destination];
            adjusted[parentDepth] -= 1;

            return adjusted;
        }

        return destination;
    }

    const withoutItem = removeAtPath(items, sourceAbsolutePosition, 0);

    if (!movedItem) {
        throw new Error('Invalid source position');
    }

    return insertAtPath(withoutItem, adjustDestinationPath(sourceAbsolutePosition, destinationAbsolutePosition), 0);
}

export default function WithDragAndDropExample(): React.JSX.Element {
    const [items, setItems] = useState(exampleItems);

    const handleDragEnd = (sourceAbsolutePosition: number[], destinationAbsolutePosition: number[]): void => {
        setItems((prevItems) => moveItems(prevItems, sourceAbsolutePosition, destinationAbsolutePosition));
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
            showColumnHeaders={true}
            itemsLabelColumnHeader={'Name'}
            columns={[
                { name: 'column1', width: 100, header: 'First Column' },
                { name: 'column2', width: 100, header: 'Second Column' },
            ]}
            dragAndDropTooltipTitle={'Collapse the item to drag it.'}
            onCheckboxChange={(itemId, checked): void => {
                setItems(checkItem(items, itemId, checked));
            }}
            variant="default"
        />
    );
}
