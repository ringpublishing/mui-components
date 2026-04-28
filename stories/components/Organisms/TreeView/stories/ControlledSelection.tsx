import React, { useState } from 'react';
import type { StoryObj } from '@storybook/react-vite';
import { action } from 'storybook/actions';
import { Box } from '@mui/material';
import { createCodeStory } from '../../../../helpers.js';
import ControlledSelectionExampleCode from './code/ControlledSelectionExample.tsx?raw';
import { TreeView, TreeViewProps, TreeViewItem } from '../../../../../src/components/Organisms/TreeView/TreeView.js';

type Story = StoryObj<typeof TreeView>;

const controlledItems: TreeViewItem[] = [
    {
        itemId: '0',
        label: 'Item 0',
        column1: 'Column1 0',
        column2: 'Column2 0',
        expanded: true,
        items: [
            { itemId: '0.0', label: 'Item 0.0', column1: 'Column1 0.0', column2: 'Column2 0.0' },
            {
                itemId: '0.1',
                label: 'Item 0.1',
                column1: 'Column1 0.1',
                column2: 'Column2 0.1',
                items: [
                    { itemId: '0.1.0', label: 'Item 0.1.0', column1: 'Column1 0.1.0', column2: 'Column2 0.1.0' },
                    { itemId: '0.1.1', label: 'Item 0.1.1', column1: 'Column1 0.1.1', column2: 'Column2 0.1.1' },
                ],
            },
            { itemId: '0.2', label: 'Item 0.2', column1: 'Column1 0.2', column2: 'Column2 0.2' },
        ],
    },
    {
        itemId: '1',
        label: 'Item 1',
        column1: 'Column1 1',
        column2: 'Column2 1',
        items: [
            { itemId: '1.0', label: 'Item 1.0', column1: 'Column1 1.0', column2: 'Column2 1.0' },
            { itemId: '1.1', label: 'Item 1.1', column1: 'Column1 1.1', column2: 'Column2 1.1' },
        ],
    },
    {
        itemId: '2',
        label: 'Item 2',
        column1: 'Column1 2',
        column2: 'Column2 2',
        items: [
            { itemId: '2.0', label: 'Item 2.0', column1: 'Column1 2.0', column2: 'Column2 2.0' },
            { itemId: '2.1', label: 'Item 2.1', column1: 'Column1 2.1', column2: 'Column2 2.1' },
        ],
    },
    { itemId: '3', label: 'Item 3', column1: 'Column1 3', column2: 'Column2 3' },
];

const Example = (args: TreeViewProps): React.JSX.Element => {
    const [selectedItems, setSelectedItems] = useState<string[]>([]);

    return (
        <Box sx={{ width: '400px' }}>
            <Box sx={{ mb: 2, display: 'flex', gap: 1 }}>
                <button onClick={(): void => setSelectedItems([])}>Unselect All</button>
                <button
                    onClick={(): void => setSelectedItems(['0.0', '0.1', '0.2', '0.1.0', '1.0', '1.1', '2.0', '2.1'])}
                >
                    Select Nested Items
                </button>
                <button onClick={(): void => setSelectedItems(['0', '1', '2', '3'])}>Select Parent Items</button>
            </Box>
            <Box sx={{ mb: 2 }}>
                <strong>Selected Items:</strong> {selectedItems.length > 0 ? selectedItems.join(', ') : 'None'}
            </Box>
            <TreeView
                {...args}
                selectedItems={selectedItems}
                onSelectedItemsChange={(itemIds): void => {
                    action('selection changed')(itemIds);
                    setSelectedItems(itemIds);
                }}
                onClickRow={(itemId): void => action('row clicked')(itemId)}
            />
        </Box>
    );
};

export const ControlledSelection: Story = {
    args: {
        variant: 'default',
        items: controlledItems,
    } as TreeViewProps,
    render: (args, context) =>
        createCodeStory({
            context,
            customCode: ControlledSelectionExampleCode,
            example: <Example {...args} />,
        }),
};
