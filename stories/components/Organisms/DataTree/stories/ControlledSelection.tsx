import React, { useState } from 'react';
import type { StoryObj } from '@storybook/react-vite';
import { action } from 'storybook/actions';
import { createCodeStory } from '../../../../helpers.js';
import { DataTree, DataTreeItem } from '../../../../../src/index.js';
import ControlledSelectionExampleCode from './code/ControlledSelectionExample.tsx?raw';

type Story = StoryObj<typeof DataTree>;

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

const debugBtnStyle: React.CSSProperties = {
    padding: '2px 10px',
    fontSize: 11,
    fontFamily: 'monospace',
    background: 'transparent',
    border: '1px solid #6c7086',
    color: '#cdd6f4',
    cursor: 'pointer',
};

function Example(): React.JSX.Element {
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
                    Unselect all
                </button>
                <button
                    style={debugBtnStyle}
                    onClick={(): void => setSelectedItems(['0.0', '0.1', '0.2', '0.1.0', '1.0', '1.1', '2.0', '2.1'])}
                >
                    Select nested
                </button>
                <button style={debugBtnStyle} onClick={(): void => setSelectedItems(['0', '1', '2', '3'])}>
                    Select parents
                </button>
            </div>
            <DataTree
                items={items}
                columns={[
                    { name: 'column1', width: 100, header: 'First Column' },
                    { name: 'column2', width: 100, header: 'Second Column' },
                ]}
                showColumnHeaders={true}
                itemsLabelColumnHeader={'Name'}
                selectedItems={selectedItems}
                onSelectedItemsChange={(itemIds): void => {
                    action('selection changed')(itemIds);
                    setSelectedItems(itemIds);
                }}
                onClickRow={(itemId): void => action('row clicked')(itemId)}
            />
        </div>
    );
}

export const ControlledSelection: Story = {
    render: (args, context) =>
        createCodeStory({
            context,
            customCode: ControlledSelectionExampleCode,
            example: <Example />,
        }),
};
