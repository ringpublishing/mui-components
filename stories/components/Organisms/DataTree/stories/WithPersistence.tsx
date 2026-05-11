import React, { useState } from 'react';
import type { StoryObj } from '@storybook/react-vite';
import { action } from 'storybook/actions';
import { createCodeStory } from '../../../../helpers.js';
import { DataTree, DataTreeItem } from '../../../../../src/index.js';
import WithPersistenceExampleCode from './code/WithPersistenceExample.tsx?raw';
import defaultArgs from '../common/defaultArgs.js';

type Story = StoryObj<typeof DataTree>;

const loadLevel5 = async (parent: DataTreeItem): Promise<DataTreeItem[]> => {
    await new Promise((resolve) => setTimeout(resolve, 500));

    return [
        { itemId: `${parent.itemId}-final-a`, label: 'Final A.txt', column1: 'Dynamic', column2: 'Level 5 leaf' },
        { itemId: `${parent.itemId}-final-b`, label: 'Final B.txt', column1: 'Dynamic', column2: 'Level 5 leaf' },
    ];
};

const loadLevel4 = async (parent: DataTreeItem): Promise<DataTreeItem[]> => {
    await new Promise((resolve) => setTimeout(resolve, 500));

    return [
        {
            itemId: `${parent.itemId}-deep-1`,
            label: 'Deep folder 1 (level 5 dynamic)',
            column1: 'Dynamic',
            column2: 'Level 4',
            loadItems: loadLevel5,
        },
        {
            itemId: `${parent.itemId}-deep-2`,
            label: 'Deep folder 2 (level 5 dynamic)',
            column1: 'Dynamic',
            column2: 'Level 4',
            loadItems: loadLevel5,
        },
    ];
};

const loadLevel3 = async (parent: DataTreeItem): Promise<DataTreeItem[]> => {
    await new Promise((resolve) => setTimeout(resolve, 600));

    return [
        {
            itemId: `${parent.itemId}-folder-a`,
            label: 'Folder A (level 4 dynamic)',
            column1: 'Dynamic',
            column2: 'Level 3',
            loadItems: loadLevel4,
        },
        {
            itemId: `${parent.itemId}-folder-b`,
            label: 'Folder B (level 4 dynamic)',
            column1: 'Dynamic',
            column2: 'Level 3',
            loadItems: loadLevel4,
        },
    ];
};

const loadLevel2 = async (parent: DataTreeItem): Promise<DataTreeItem[]> => {
    await new Promise((resolve) => setTimeout(resolve, 800));

    return [
        {
            itemId: `${parent.itemId}-sub-1`,
            label: 'Subfolder 1 (level 3 dynamic)',
            column1: 'Dynamic',
            column2: 'Level 2',
            loadItems: loadLevel3,
        },
        {
            itemId: `${parent.itemId}-sub-2`,
            label: 'Subfolder 2 (level 3 dynamic)',
            column1: 'Dynamic',
            column2: 'Level 2',
            loadItems: loadLevel3,
        },
        {
            itemId: `${parent.itemId}-leaf`,
            label: 'Leaf at level 2.txt',
            column1: 'Dynamic',
            column2: 'Level 2 leaf',
        },
    ];
};

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
                label: 'Dynamic Folder (level 1 → 2 → 3 → 4 → 5)',
                column1: 'Dynamic',
                column2: 'Level 1',
                loadItems: loadLevel2,
            },
        ],
    },
    {
        itemId: 'static-root',
        label: 'Static Root',
        column1: 'Static',
        column2: 'Parent',
        items: [
            {
                itemId: 'static-root-dynamic-child',
                label: 'Dynamic Subfolder (level 1 → 2 → 3 → 4 → 5)',
                column1: 'Dynamic',
                column2: 'Level 1',
                loadItems: loadLevel2,
            },
        ],
    },
];

function PersistenceDebugBar({ cacheKey }: { cacheKey: string }): React.JSX.Element {
    const cacheStorageKey = `ring-tree-cache-${cacheKey}`;
    const stateStorageKey = `ring-tree-state-${cacheKey}`;
    const [, setTick] = useState(0);
    const refresh = (): void => setTick((n) => n + 1);

    const cacheSize = localStorage.getItem(cacheStorageKey)?.length ?? 0;
    const stateSize = localStorage.getItem(stateStorageKey)?.length ?? 0;

    const clearCache = (): void => {
        localStorage.removeItem(cacheStorageKey);
        action('clear cache')();
        refresh();
    };

    const clearState = (): void => {
        localStorage.removeItem(stateStorageKey);
        action('clear state')();
        refresh();
    };

    const clearAll = (): void => {
        localStorage.removeItem(cacheStorageKey);
        localStorage.removeItem(stateStorageKey);
        action('clear all')();
        refresh();
    };

    return (
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
                localStorage &mdash; cache: <strong>{cacheSize}b</strong> &nbsp;|&nbsp; state:{' '}
                <strong>{stateSize}b</strong>
            </span>
            <button onClick={clearCache} style={debugBtnStyle} title={`Remove ${cacheStorageKey}`}>
                Clear cache
            </button>
            <button onClick={clearState} style={debugBtnStyle} title={`Remove ${stateStorageKey}`}>
                Clear state
            </button>
            <button
                onClick={clearAll}
                style={{ ...debugBtnStyle, borderColor: '#f38ba8', color: '#f38ba8' }}
                title="Remove both keys"
            >
                Clear all
            </button>
            <button
                onClick={(): void => window.location.reload()}
                style={{ ...debugBtnStyle, borderColor: '#a6e3a1', color: '#a6e3a1' }}
                title="Reload the page to apply cleared state"
            >
                Reload
            </button>
        </div>
    );
}

const debugBtnStyle: React.CSSProperties = {
    padding: '2px 10px',
    fontSize: 11,
    fontFamily: 'monospace',
    background: 'transparent',
    border: '1px solid #6c7086',
    color: '#cdd6f4',
    cursor: 'pointer',
};

function Example(args: React.ComponentProps<typeof DataTree>): React.JSX.Element {
    const cacheKey = args.persistence?.cacheKey ?? '';

    return (
        <div>
            <PersistenceDebugBar cacheKey={cacheKey} />
            <DataTree
                {...args}
                onExpand={(itemId): void => {
                    action('row expanded')(itemId);
                }}
                onClickRow={(itemId): void => {
                    action('row clicked')(itemId);
                }}
            />
        </div>
    );
}

export const WithPersistence: Story = {
    args: {
        ...defaultArgs,
        items: dynamicItems,
        withSearch: true,
        searchPlaceholder: 'Search dynamic items...',
        persistence: { cacheKey: 'data-tree-demo', restoreExpandedItems: true, restoreSelectedItem: true },
    },
    render: (args, context) =>
        createCodeStory({
            context,
            customCode: WithPersistenceExampleCode,
            example: <Example {...args} />,
        }),
};
