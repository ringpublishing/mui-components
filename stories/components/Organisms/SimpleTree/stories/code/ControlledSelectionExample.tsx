import React, { useState } from 'react';
import { Box, Button } from '@mui/material';
import { SimpleTree, SimpleTreeItem } from '@ringpublishing/mui-components';

const items: SimpleTreeItem[] = [
    {
        itemId: '0',
        label: 'Documents',
        expanded: true,
        items: [
            { itemId: '0.0', label: 'Report.pdf' },
            {
                itemId: '0.1',
                label: 'Presentations',
                items: [
                    { itemId: '0.1.0', label: 'Q1 Review.pptx' },
                    { itemId: '0.1.1', label: 'Q2 Review.pptx' },
                ],
            },
            { itemId: '0.2', label: 'Notes.txt' },
        ],
    },
    {
        itemId: '1',
        label: 'Images',
        items: [
            { itemId: '1.0', label: 'photo.jpg' },
            { itemId: '1.1', label: 'diagram.png' },
        ],
    },
    { itemId: '2', label: 'README.md' },
];

export default function ControlledSelectionExample(): React.JSX.Element {
    const [selectedItems, setSelectedItems] = useState<string[]>([]);

    return (
        <Box>
            <Box sx={{ mb: 2, display: 'flex', gap: 1 }}>
                <Button variant="outlined" size="small" onClick={() => setSelectedItems([])}>
                    Clear Selection
                </Button>
                <Button variant="outlined" size="small" onClick={() => setSelectedItems(['0.0'])}>
                    Select Report.pdf
                </Button>
                <Button variant="outlined" size="small" onClick={() => setSelectedItems(['2'])}>
                    Select README.md
                </Button>
            </Box>
            <Box sx={{ mb: 2 }}>
                <strong>Selected:</strong> {selectedItems.length > 0 ? selectedItems.join(', ') : 'None'}
            </Box>
            <SimpleTree
                items={items}
                selectedItems={selectedItems}
                onSelectedItemsChange={(itemIds) => {
                    console.log('Selection changed:', itemIds);
                    setSelectedItems(itemIds);
                }}
                onClickRow={(itemId) => console.log('Clicked:', itemId)}
            />
        </Box>
    );
}
