import React, { useState } from 'react';
import type { StoryObj } from '@storybook/react-vite';
import { action } from 'storybook/actions';
import { createCodeStory } from '../../../../helpers.js';
import WithPersistenceExampleCode from './code/WithPersistenceExample.tsx?raw';
import { SimpleTree, SimpleTreeItem } from '../../../../../src/index.js';

type Story = StoryObj<typeof SimpleTree>;

const loadLevel5 = async (parent: SimpleTreeItem): Promise<SimpleTreeItem[]> => {
    await new Promise((resolve) => setTimeout(resolve, 500));

    return [
        { itemId: `${parent.itemId}-final-a`, label: 'Final A.txt' },
        { itemId: `${parent.itemId}-final-b`, label: 'Final B.txt' },
    ];
};

const loadLevel4 = async (parent: SimpleTreeItem): Promise<SimpleTreeItem[]> => {
    await new Promise((resolve) => setTimeout(resolve, 500));

    return [
        {
            itemId: `${parent.itemId}-deep-1`,
            label: 'Deep folder 1 (level 5 dynamic)',
            loadItems: loadLevel5,
        },
        {
            itemId: `${parent.itemId}-deep-2`,
            label: 'Deep folder 2 (level 5 dynamic)',
            loadItems: loadLevel5,
        },
    ];
};

const loadLevel3 = async (parent: SimpleTreeItem): Promise<SimpleTreeItem[]> => {
    await new Promise((resolve) => setTimeout(resolve, 600));

    return [
        {
            itemId: `${parent.itemId}-folder-a`,
            label: 'Folder A (level 4 dynamic)',
            loadItems: loadLevel4,
        },
        {
            itemId: `${parent.itemId}-folder-b`,
            label: 'Folder B (level 4 dynamic)',
            loadItems: loadLevel4,
        },
    ];
};

const loadLevel2 = async (parent: SimpleTreeItem): Promise<SimpleTreeItem[]> => {
    await new Promise((resolve) => setTimeout(resolve, 800));

    return [
        {
            itemId: `${parent.itemId}-sub-1`,
            label: 'Subfolder 1 (level 3 dynamic)',
            loadItems: loadLevel3,
        },
        {
            itemId: `${parent.itemId}-sub-2`,
            label: 'Subfolder 2 (level 3 dynamic)',
            loadItems: loadLevel3,
        },
        { itemId: `${parent.itemId}-leaf`, label: 'Leaf at level 2.txt' },
    ];
};

const dynamicItems: SimpleTreeItem[] = [
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
                label: 'Dynamic Folder (level 1 → 2 → 3 → 4 → 5)',
                loadItems: loadLevel2,
            },
        ],
    },
    {
        itemId: 'static-root',
        label: 'Static Root',
        items: [
            {
                itemId: 'static-root-dynamic-child',
                label: 'Dynamic Subfolder (level 1 → 2 → 3 → 4 → 5)',
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
                title="Reload to apply cleared state"
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

const Example = (args: React.ComponentProps<typeof SimpleTree>): React.JSX.Element => (
    <div>
        <PersistenceDebugBar cacheKey={args.persistence?.cacheKey ?? ''} />
        <SimpleTree {...args} />
    </div>
);

export const WithPersistence: Story = {
    args: {
        items: dynamicItems,
        persistence: {
            cacheKey: 'simple-tree-demo',
            restoreExpandedItems: true,
            restoreSelectedItem: true,
        },
    },
    render: (args, context) =>
        createCodeStory({
            context,
            customCode: WithPersistenceExampleCode,
            example: <Example {...args} />,
        }),
};
