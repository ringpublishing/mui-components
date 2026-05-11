import React, { useState } from 'react';
import type { StoryObj } from '@storybook/react-vite';
import { action } from 'storybook/actions';
import { EditOutlined } from '@mui/icons-material';
import { createCodeStory } from '../../../../helpers.js';
import { DataTree, DataTreeItem } from '../../../../../src/index.js';
import WithDropInExampleCode from './code/WithDropInExample.tsx?raw';
import defaultArgs from '../common/defaultArgs.js';

type Story = StoryObj<typeof DataTree>;

const exampleItems: DataTreeItem[] = [
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
    items: DataTreeItem[],
    sourceAbsolutePosition: number[],
    destinationAbsolutePosition: number[],
): DataTreeItem[] {
    const newItems = [...items];

    function getArrayAndIndex(path: number[]): { array: DataTreeItem[] | undefined; index: number } {
        let array: DataTreeItem[] | undefined = newItems;
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

function dropInItem(items: DataTreeItem[], itemId: string, dropInItemId: string): DataTreeItem[] {
    let movedItem: DataTreeItem | null = null;

    function removeItem(arr: DataTreeItem[]): DataTreeItem[] {
        return arr.reduce<DataTreeItem[]>((acc, item) => {
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

    function insertItem(arr: DataTreeItem[]): DataTreeItem[] {
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

function checkItem(items: DataTreeItem[], itemId: string, checked: boolean): DataTreeItem[] {
    const newItems: DataTreeItem[] = [];

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
}

function Example(args: React.ComponentProps<typeof DataTree>): React.JSX.Element {
    const [items, setItems] = useState(args.items);

    return (
        <DataTree
            {...args}
            items={items}
            onExpand={(itemId): void => {
                action('row expanded')(itemId);
            }}
            onDragAndDropEnd={(sourceAbsolutePosition, destinationAbsolutePosition): void => {
                setItems((prevItems) => moveItems(prevItems, sourceAbsolutePosition, destinationAbsolutePosition));
            }}
            onDropIn={(itemId, dropInItemId): void => {
                setItems((prevItems) => dropInItem(prevItems, itemId, dropInItemId));
            }}
            onCheckboxChange={(itemId, checked): void => {
                setItems(checkItem(items, itemId, checked));
            }}
            dragAndDropTooltipTitle={'To drag and drop collapse the item first'}
        />
    );
}

export const WithDropIn: Story = {
    args: {
        ...defaultArgs,
        items: exampleItems,
    },
    render: (args, context) =>
        createCodeStory({
            context,
            customCode: WithDropInExampleCode,
            example: <Example {...args} />,
        }),
};
