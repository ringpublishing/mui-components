import React from 'react';
import type { StoryObj } from '@storybook/react-vite';
import { action } from 'storybook/actions';
import { createCodeStory } from '../../../../helpers.js';
import { DataTree, DataTreeItem } from '../../../../../src/index.js';
import WithDynamicLoadingExampleCode from './code/WithDynamicLoadingExample.tsx?raw';
import defaultArgs from '../common/defaultArgs.js';

type Story = StoryObj<typeof DataTree>;

type FsNode = { label: string; ext: string } & ({ type: 'folder'; children: string[] } | { type: 'file' });

const filesystem: Record<string, FsNode> = {
    documents: { label: 'Documents', type: 'folder', children: ['reports', 'templates'], ext: '—' },
    reports: { label: 'Reports', type: 'folder', children: ['q1', 'q2', 'q3'], ext: '—' },
    templates: { label: 'Templates', type: 'folder', children: ['invoice', 'contract'], ext: '—' },
    projects: { label: 'Projects', type: 'folder', children: ['alpha', 'beta'], ext: '—' },
    alpha: { label: 'Alpha', type: 'folder', children: ['src', 'alpha-readme'], ext: '—' },
    beta: { label: 'Beta', type: 'folder', children: ['beta-main', 'beta-config'], ext: '—' },
    src: { label: 'src', type: 'folder', children: ['index', 'utils'], ext: '—' },
    archives: { label: 'Archives', type: 'folder', children: ['y2023', 'y2024'], ext: '—' },
    y2023: { label: '2023', type: 'folder', children: ['backup2023', 'data2023'], ext: '—' },
    y2024: { label: '2024', type: 'folder', children: ['backup2024', 'data2024'], ext: '—' },
    q1: { label: 'Q1 Report.pdf', type: 'file', ext: '.pdf' },
    q2: { label: 'Q2 Report.pdf', type: 'file', ext: '.pdf' },
    q3: { label: 'Q3 Report.pdf', type: 'file', ext: '.pdf' },
    invoice: { label: 'Invoice.docx', type: 'file', ext: '.docx' },
    contract: { label: 'Contract.docx', type: 'file', ext: '.docx' },
    'alpha-readme': { label: 'README.md', type: 'file', ext: '.md' },
    'beta-main': { label: 'main.py', type: 'file', ext: '.py' },
    'beta-config': { label: 'config.yml', type: 'file', ext: '.yml' },
    index: { label: 'index.ts', type: 'file', ext: '.ts' },
    utils: { label: 'utils.ts', type: 'file', ext: '.ts' },
    backup2023: { label: 'backup.zip', type: 'file', ext: '.zip' },
    data2023: { label: 'data.csv', type: 'file', ext: '.csv' },
    backup2024: { label: 'backup.zip', type: 'file', ext: '.zip' },
    data2024: { label: 'data.csv', type: 'file', ext: '.csv' },
};

const loadItems = async (item: DataTreeItem): Promise<DataTreeItem[]> => {
    await new Promise((r) => setTimeout(r, 600));
    const node = filesystem[item.itemId];
    if (!node || node.type !== 'folder') return [];

    return node.children.map((childId) => {
        const child = filesystem[childId];

        return {
            itemId: childId,
            label: child.label,
            column1: child.type === 'folder' ? 'Folder' : 'File',
            column2: child.ext,
            ...(child.type === 'folder' ? { loadItems } : {}),
        };
    });
};

const dynamicItems: DataTreeItem[] = [
    {
        itemId: 'root',
        label: 'Root',
        column1: 'Folder',
        column2: '—',
        items: [
            { itemId: 'documents', label: 'Documents', column1: 'Folder', column2: '—', loadItems },
            { itemId: 'projects', label: 'Projects', column1: 'Folder', column2: '—', loadItems },
            { itemId: 'archives', label: 'Archives', column1: 'Folder', column2: '—', loadItems },
        ],
    },
];

function Example(args: React.ComponentProps<typeof DataTree>): React.JSX.Element {
    return (
        <DataTree
            {...args}
            onExpand={(itemId): void => {
                action('row expanded')(itemId);
            }}
            onClickRow={(itemId): void => {
                action('row clicked')(itemId);
            }}
        />
    );
}

export const WithDynamicLoading: Story = {
    args: {
        ...defaultArgs,
        items: dynamicItems,
        withSearch: true,
        searchPlaceholder: 'Search...',
        columns: [
            { name: 'column1', width: 100, header: 'Type' },
            { name: 'column2', width: 100, header: 'Extension' },
        ],
    },
    render: (args, context) =>
        createCodeStory({
            context,
            customCode: WithDynamicLoadingExampleCode,
            example: <Example {...args} />,
        }),
};
