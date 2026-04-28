import React from 'react';
import { TreeView, TreeViewItem } from '@ringpublishing/mui-components';
import { Chip } from '@mui/material';

const dynamicItems: TreeViewItem[] = [
    {
        itemId: 'mixed-content',
        label: 'Mixed: Static + Dynamic Children',
        items: [
            {
                itemId: 'static-folder',
                label: 'Static Folder',
                items: [
                    { itemId: 'static-file1', label: 'Static File 1.txt' },
                    { itemId: 'static-file2', label: 'Static File 2.txt' },
                ],
            },
            {
                itemId: 'dynamic-folder',
                label: 'Dynamic Folder',
                loadItems: async (item: TreeViewItem): Promise<TreeViewItem[]> => {
                    await new Promise((resolve) => setTimeout(resolve, 1000));

                    const randomId = Math.floor(Math.random() * 1000);
                    const childrenCount = Math.floor(Math.random() * 5) + 1;

                    const randomCount = Array.from({ length: childrenCount }, () => Math.floor(Math.random() * 1000));

                    if (randomId % 5 === 0) {
                        throw new Error('Random error loading dynamic folder');
                    }

                    return Array.from({ length: childrenCount }, (unused, index) => ({
                        itemId: 'parent' + item.itemId + '-child-' + randomId + '-' + index,
                        label: 'Dynamic File ' + randomId + '-' + index + '.txt',
                        element: (
                            <Chip color="primary" label={randomCount[index]} size="small" sx={{ height: '18px' }} />
                        ),
                    }));
                },
            },
        ],
    },
];

export default function WithDynamicLoadingExample(): React.JSX.Element {
    return (
        <TreeView
            items={dynamicItems}
            variant="default"
            withSearch={true}
            searchPlaceholder="Search dynamic items..."
        />
    );
}
