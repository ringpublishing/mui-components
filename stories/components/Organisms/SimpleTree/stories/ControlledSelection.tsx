import React, { useState } from 'react';
import type { StoryObj } from '@storybook/react-vite';
import { action } from 'storybook/actions';
import { createCodeStory } from '../../../../helpers.js';
import ControlledSelectionExampleCode from './code/ControlledSelectionExample.tsx?raw';
import { SimpleTree, SimpleTreeItem } from '../../../../../src/index.js';
import defaultArgs from '../common/defaultArgs.js';

type Story = StoryObj<typeof SimpleTree>;

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

const debugBtnStyle: React.CSSProperties = {
    padding: '2px 10px',
    fontSize: 11,
    fontFamily: 'monospace',
    background: 'transparent',
    border: '1px solid #6c7086',
    color: '#cdd6f4',
    cursor: 'pointer',
};

const ControlledExample = (): React.JSX.Element => {
    const [selectedItems, setSelectedItems] = useState<string[]>([]);

    return (
        <div>
            <div
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '6px 10px',
                    marginBottom: 8,
                    background: '#1e1e2e',
                    fontSize: 12,
                    fontFamily: 'monospace',
                    color: '#cdd6f4',
                }}
            >
                <span style={{ marginRight: 'auto', opacity: 0.7 }}>
                    Selected: <strong>{selectedItems.length > 0 ? selectedItems.join(', ') : 'None'}</strong>
                </span>
                <button style={debugBtnStyle} onClick={(): void => setSelectedItems([])}>
                    Clear
                </button>
                <button style={debugBtnStyle} onClick={(): void => setSelectedItems(['0.0'])}>
                    Select Report.pdf
                </button>
                <button style={debugBtnStyle} onClick={(): void => setSelectedItems(['2'])}>
                    Select README.md
                </button>
            </div>
            <SimpleTree
                {...defaultArgs}
                items={items}
                selectedItems={selectedItems}
                onSelectedItemsChange={(itemIds): void => {
                    action('selection changed')(itemIds);
                    setSelectedItems(itemIds);
                }}
                onClickRow={(itemId): void => action('row clicked')(itemId)}
            />
        </div>
    );
};

export const ControlledSelection: Story = {
    render: (args, context) =>
        createCodeStory({
            context,
            customCode: ControlledSelectionExampleCode,
            example: <ControlledExample />,
        }),
};
