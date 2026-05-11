import React, { useState } from 'react';
import { QueryClient } from '@tanstack/react-query';
import { SimpleTree, SimpleTreeItem } from '@ringpublishing/mui-components';

const items: SimpleTreeItem[] = [
    {
        itemId: 'root',
        label: 'Root',
        items: [
            {
                itemId: 'lazy',
                label: 'Loads children on expand',
                loadItems: async (): Promise<SimpleTreeItem[]> => {
                    await new Promise((r) => setTimeout(r, 400));

                    return [{ itemId: 'child-1', label: 'Loaded child' }];
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

    return <SimpleTree items={items} queryClient={queryClient} />;
}
