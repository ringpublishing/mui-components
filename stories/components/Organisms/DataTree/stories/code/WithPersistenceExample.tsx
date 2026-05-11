import React from 'react';
import { DataTree, DataTreeItem } from '@ringpublishing/mui-components';

const dynamicItems: DataTreeItem[] = [
    {
        itemId: 'mixed-content',
        label: 'Mixed: Static + Dynamic Children',
        column1: 'Static',
        column2: 'Parent',
        items: [
            {
                itemId: 'static-folder',
                label: 'Static Folder',
                column1: 'Static',
                column2: 'Folder',
                items: [
                    { itemId: 'static-file1', label: 'Static File 1.txt', column1: 'Static', column2: 'File' },
                    { itemId: 'static-file2', label: 'Static File 2.txt', column1: 'Static', column2: 'File' },
                ],
            },
            {
                itemId: 'dynamic-folder',
                label: 'Dynamic Folder (click to load)',
                column1: 'Dynamic',
                column2: 'Folder',
                loadItems: async (parent): Promise<DataTreeItem[]> => {
                    await new Promise((resolve) => setTimeout(resolve, 1000));
                    return [
                        {
                            itemId: `${parent.itemId}-loaded-1`,
                            label: 'Loaded Report A',
                            column1: 'Dynamic',
                            column2: 'Loaded',
                        },
                        {
                            itemId: `${parent.itemId}-loaded-2`,
                            label: 'Loaded Report B',
                            column1: 'Dynamic',
                            column2: 'Loaded',
                        },
                        {
                            itemId: `${parent.itemId}-loaded-3`,
                            label: 'Loaded Report C',
                            column1: 'Dynamic',
                            column2: 'Loaded',
                        },
                    ];
                },
            },
        ],
    },
];

export default function WithPersistenceExample(): React.JSX.Element {
    return (
        <DataTree
            items={dynamicItems}
            withSearch={true}
            searchPlaceholder="Search dynamic items..."
            showColumnHeaders={true}
            itemsLabelColumnHeader={'Name'}
            columns={[
                { name: 'column1', width: 100, header: 'First Column' },
                { name: 'column2', width: 100, header: 'Second Column' },
            ]}
            persistence={{ cacheKey: 'data-tree-demo', restoreExpandedItems: true, restoreSelectedItem: true }}
            onExpand={(itemId) => console.log('Expanded:', itemId)}
            onClickRow={(itemId) => console.log('Clicked:', itemId)}
        />
    );
}
