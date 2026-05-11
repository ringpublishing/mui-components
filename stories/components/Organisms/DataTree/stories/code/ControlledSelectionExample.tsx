import React, { useState } from 'react';
import { Box } from '@mui/material';
import { DataTree, DataTreeItem } from '@ringpublishing/mui-components';

const items: DataTreeItem[] = [
    {
        itemId: '0',
        label: 'Item 0',
        column1: 'Column1 0',
        column2: 'Column2 0',
        expanded: true,
        items: [
            {
                itemId: '0.0',
                label: 'Item 0.0',
                column1: 'Column1 0.0',
                column2: 'Column2 0.0',
            },
            {
                itemId: '0.1',
                label: 'Item 0.1',
                column1: 'Column1 0.1',
                column2: 'Column2 0.1',
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
            },
        ],
    },
    {
        itemId: '1',
        label: 'Item 1',
        column1: 'Column1 1',
        column2: 'Column2 1',
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
    },
];

export default function ControlledSelectionExample(): React.JSX.Element {
    const [selectedItems, setSelectedItems] = useState<string[]>([]);

    return (
        <Box>
            <Box sx={{ mb: 2, display: 'flex', gap: 1 }}>
                <button onClick={() => setSelectedItems([])}>Unselect All</button>
                <button onClick={() => setSelectedItems(['0.0', '0.1', '0.2', '0.1.0', '1.0', '1.1', '2.0', '2.1'])}>
                    Select Nested Items
                </button>
                <button onClick={() => setSelectedItems(['0', '1', '2', '3'])}>Select Parent Items</button>
            </Box>
            <Box sx={{ mb: 2 }}>
                <strong>Selected Items:</strong> {selectedItems.length > 0 ? selectedItems.join(', ') : 'None'}
            </Box>
            <DataTree
                items={items}
                columns={[
                    { name: 'column1', width: 100, header: 'First Column' },
                    { name: 'column2', width: 100, header: 'Second Column' },
                ]}
                showColumnHeaders={true}
                itemsLabelColumnHeader={'Name'}
                selectedItems={selectedItems}
                onSelectedItemsChange={(itemIds) => setSelectedItems(itemIds)}
                onClickRow={(itemId) => console.log('Row clicked:', itemId)}
            />
        </Box>
    );
}
