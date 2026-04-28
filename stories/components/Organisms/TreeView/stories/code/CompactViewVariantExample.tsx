import React, { useState } from 'react';
import { TreeView, TreeViewItem } from '@ringpublishing/mui-components';
import { Chip } from '@mui/material';

const exampleItems: TreeViewItem[] = [
    {
        itemId: '0',
        label: 'Item 0',
        expanded: true,
        checkboxDisabled: true,
        element: <Chip label="4" size="small" />,
        items: [
            {
                itemId: '0.0',
                label: 'Item 0.0',
                checked: true,
            },
            {
                itemId: '0.1',
                label: 'Item 0.1',
                checked: true,
                element: <Chip label="2" size="small" />,
                items: [
                    {
                        itemId: '0.1.0',
                        label: 'Item 0.1.0',
                    },
                    {
                        itemId: '0.1.1',
                        label: 'Item 0.1.1',
                    },
                ],
            },
            {
                itemId: '0.2',
                label: 'Item 0.2',
                withCheckbox: false,
            },
            {
                itemId: '0.3',
                label: 'Item 0.3',
                withCheckbox: false,
            },
        ],
    },
    {
        itemId: '1',
        label: 'Item 1',
        element: <Chip label="2" size="small" />,
        items: [
            {
                itemId: '1.0',
                label: 'Item 1.0',
            },
            {
                itemId: '1.1',
                label: 'Item 1.1',
            },
        ],
    },
    {
        itemId: '2',
        label: 'Item 2',
        element: <Chip label="2" size="small" />,
        items: [
            {
                itemId: '2.0',
                label: 'Item 2.0',
            },
            {
                itemId: '2.1',
                label: 'Item 2.1',
            },
        ],
    },
    {
        itemId: '3',
        label: 'Item 3',
        checked: true,
    },
];

export default function CompactViewVariantExample(): React.JSX.Element {
    const [items, setItems] = useState(exampleItems);

    const handleExpand = (itemId: string): void => {
        setItems((prevItems) =>
            prevItems.map((item) => (item.itemId === itemId ? { ...item, expanded: !item.expanded } : item)),
        );
    };

    return (
        <TreeView
            variant="compact"
            items={items}
            onExpand={handleExpand}
            withSearch={true}
            searchPlaceholder="Search"
        />
    );
}
