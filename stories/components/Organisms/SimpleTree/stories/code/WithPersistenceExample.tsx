import React from 'react';
import { SimpleTree, SimpleTreeItem } from '@ringpublishing/mui-components';

const items: SimpleTreeItem[] = [
    {
        itemId: 'root',
        label: 'Dynamic Root',
        items: [
            {
                itemId: 'static-folder',
                label: 'Static Folder',
                items: [
                    { itemId: 'static-1', label: 'Static File 1.txt' },
                    { itemId: 'static-2', label: 'Static File 2.txt' },
                ],
            },
            {
                itemId: 'dynamic-folder',
                label: 'Dynamic Folder (click to load)',
                loadItems: async (parent): Promise<SimpleTreeItem[]> => {
                    await new Promise((resolve) => setTimeout(resolve, 1000));
                    return [
                        { itemId: `${parent.itemId}-loaded-1`, label: 'Loaded File 1.txt' },
                        { itemId: `${parent.itemId}-loaded-2`, label: 'Loaded File 2.txt' },
                        { itemId: `${parent.itemId}-loaded-3`, label: 'Loaded File 3.txt' },
                    ];
                },
            },
        ],
    },
];

export default function WithPersistenceExample(): React.JSX.Element {
    return (
        <div>
            <SimpleTree
                items={items}
                persistence={{
                    cacheKey: 'simple-tree-demo',
                    restoreExpandedItems: true,
                    restoreSelectedItem: true,
                }}
                onClickRow={(itemId) => console.log('Clicked:', itemId)}
            />
        </div>
    );
}
