import React, { useState } from 'react';
import { QueryClient } from '@tanstack/react-query';
import { DataTree, DataTreeItem } from '@ringpublishing/mui-components';

const items: DataTreeItem[] = [
    {
        itemId: 'root',
        label: 'Root',
        column1: 'A',
        column2: 'B',
        items: [
            {
                itemId: 'lazy',
                label: 'Loads children on expand',
                column1: 'A',
                column2: 'B',
                loadItems: async (): Promise<DataTreeItem[]> => {
                    await new Promise((r) => setTimeout(r, 400));

                    return [{ itemId: 'child-1', label: 'Loaded child', column1: 'A', column2: 'B' }];
                },
            },
        ],
    },
];

export default function WithExternalQueryClientExample(): React.JSX.Element {
    const [queryClient] = useState(
        () =>
            new QueryClient({
                defaultOptions: { queries: { staleTime: Infinity, retry: false } },
            }),
    );

    return (
        <DataTree
            items={items}
            queryClient={queryClient}
            columns={[
                { name: 'column1', width: 120, header: 'Col 1' },
                { name: 'column2', width: 120, header: 'Col 2' },
            ]}
            showColumnHeaders
            itemsLabelColumnHeader="Name"
        />
    );
}
