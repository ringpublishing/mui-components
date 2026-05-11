import React, { useState } from 'react';
import type { StoryObj } from '@storybook/react-vite';
import { action } from 'storybook/actions';
import { EditOutlined } from '@mui/icons-material';
import { createCodeStory } from '../../../../helpers.js';
import { DataTree, DataTreeItem } from '../../../../../src/index.js';
import DefaultExampleCode from './code/DefaultExample.tsx?raw';
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
            onClickRow={(itemId): void => {
                action('row clicked')(itemId);
            }}
            onCheckboxChange={(itemId, checked): void => {
                setItems(checkItem(items, itemId, checked));
            }}
        />
    );
}

export const Default: Story = {
    args: {
        ...defaultArgs,
        items: exampleItems,
    },
    render: (args, context) =>
        createCodeStory({
            context,
            customCode: DefaultExampleCode,
            example: <Example {...args} />,
        }),
};
