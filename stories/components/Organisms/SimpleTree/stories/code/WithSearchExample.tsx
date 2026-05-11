import React from 'react';
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

export default function WithSearchExample(): React.JSX.Element {
    return (
        <div>
            <SimpleTree
                items={items}
                withSearch
                searchPlaceholder="Search files..."
                searchDebounceTime={500}
                onExpand={(itemId) => console.log('Expanded:', itemId)}
                onClickRow={(itemId) => console.log('Clicked:', itemId)}
            />
        </div>
    );
}
