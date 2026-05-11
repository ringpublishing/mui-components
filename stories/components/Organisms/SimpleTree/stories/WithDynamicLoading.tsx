import React from 'react';
import type { StoryObj } from '@storybook/react-vite';
import { createCodeStory } from '../../../../helpers.js';
import WithDynamicLoadingExampleCode from './code/WithDynamicLoadingExample.tsx?raw';
import { SimpleTree, SimpleTreeItem } from '../../../../../src/index.js';

type Story = StoryObj<typeof SimpleTree>;

type FsNode = { label: string } & ({ type: 'folder'; children: string[] } | { type: 'file' });

const filesystem: Record<string, FsNode> = {
    documents: { label: 'Documents', type: 'folder', children: ['reports', 'templates'] },
    reports: { label: 'Reports', type: 'folder', children: ['q1', 'q2', 'q3'] },
    templates: { label: 'Templates', type: 'folder', children: ['invoice', 'contract'] },
    projects: { label: 'Projects', type: 'folder', children: ['alpha', 'beta'] },
    alpha: { label: 'Alpha', type: 'folder', children: ['src', 'alpha-readme'] },
    beta: { label: 'Beta', type: 'folder', children: ['beta-main', 'beta-config'] },
    src: { label: 'src', type: 'folder', children: ['index', 'utils'] },
    archives: { label: 'Archives', type: 'folder', children: ['y2023', 'y2024'] },
    y2023: { label: '2023', type: 'folder', children: ['backup2023', 'data2023'] },
    y2024: { label: '2024', type: 'folder', children: ['backup2024', 'data2024'] },
    q1: { label: 'Q1 Report.pdf', type: 'file' },
    q2: { label: 'Q2 Report.pdf', type: 'file' },
    q3: { label: 'Q3 Report.pdf', type: 'file' },
    invoice: { label: 'Invoice.docx', type: 'file' },
    contract: { label: 'Contract.docx', type: 'file' },
    'alpha-readme': { label: 'README.md', type: 'file' },
    'beta-main': { label: 'main.py', type: 'file' },
    'beta-config': { label: 'config.yml', type: 'file' },
    index: { label: 'index.ts', type: 'file' },
    utils: { label: 'utils.ts', type: 'file' },
    backup2023: { label: 'backup.zip', type: 'file' },
    data2023: { label: 'data.csv', type: 'file' },
    backup2024: { label: 'backup.zip', type: 'file' },
    data2024: { label: 'data.csv', type: 'file' },
};

const loadItems = async (item: SimpleTreeItem): Promise<SimpleTreeItem[]> => {
    await new Promise((r) => setTimeout(r, 600));
    const node = filesystem[item.itemId];
    if (!node || node.type !== 'folder') return [];

    return node.children.map((childId) => {
        const child = filesystem[childId];

        return {
            itemId: childId,
            label: child.label,
            ...(child.type === 'folder' ? { loadItems } : {}),
        };
    });
};

const dynamicItems: SimpleTreeItem[] = [
    {
        itemId: 'root',
        label: 'Root',
        items: [
            { itemId: 'documents', label: 'Documents', loadItems },
            { itemId: 'projects', label: 'Projects', loadItems },
            { itemId: 'archives', label: 'Archives', loadItems },
        ],
    },
];

const Example = (args: React.ComponentProps<typeof SimpleTree>): React.JSX.Element => <SimpleTree {...args} />;

export const WithDynamicLoading: Story = {
    args: {
        items: dynamicItems,
        withSearch: true,
        searchPlaceholder: 'Search...',
    },
    render: (args, context) =>
        createCodeStory({
            context,
            customCode: WithDynamicLoadingExampleCode,
            example: <Example {...args} />,
        }),
};
