import React from 'react';
import type { StoryObj } from '@storybook/react-vite';
import { action } from 'storybook/actions';
import { Box, Chip } from '@mui/material';
import { createCodeStory } from '../../../../helpers.js';
import WithDynamicLoadingExampleCode from './code/WithDynamicLoadingExample.tsx?raw';
import { TreeView, TreeViewProps, TreeViewItem } from '../../../../../src/components/Organisms/TreeView/TreeView.js';

type Story = StoryObj<typeof TreeView>;

const dynamicItems: TreeViewItem[] = [
    {
        itemId: 'mixed-content',
        label: 'Mixed: Static + Dynamic Children',
        items: [
            {
                itemId: 'static-folder',
                label: 'Static Folder',
                items: [
                    { itemId: 'static-file1', label: 'Static File 1.txt' },
                    { itemId: 'static-file2', label: 'Static File 2.txt' },
                ],
            },
            {
                itemId: 'dynamic-folder',
                label: 'Dynamic Folder',
                loadItems: async (item: TreeViewItem): Promise<TreeViewItem[]> => {
                    await new Promise((resolve) => setTimeout(resolve, 1000));

                    const childrenCount = Math.floor(Math.random() * 5) + 1;
                    const randomCount = Array.from({ length: childrenCount }, () => Math.floor(Math.random() * 1000));
                    const randomIds = Array.from({ length: childrenCount }, () => Math.floor(Math.random() * 1000));

                    if (childrenCount % 2 === 0) {
                        throw new Error('Random error loading dynamic folder');
                    }

                    return Array.from({ length: childrenCount }, (unused, index) => ({
                        itemId: `parent-${item.itemId}-child-${randomIds[index]}`,
                        label: `Dynamic File ${randomIds[index]}-${index}.txt`,
                        element: (
                            <Chip color="primary" label={randomCount[index]} size="small" sx={{ height: '18px' }} />
                        ),
                    }));
                },
            },
        ],
    },
];

const Example = (args: TreeViewProps): React.JSX.Element => {
    return (
        <Box sx={{ width: '250px' }}>
            <TreeView {...args} />
        </Box>
    );
};

export const WithDynamicLoading: Story = {
    args: {
        variant: 'default',
        items: dynamicItems,
        onClickRow: (itemId: string): void => {
            action('row clicked')(itemId);
        },
        onExpand: (itemId: string): void => {
            action('row expanded')(itemId);
        },
        withSearch: true,
        searchPlaceholder: 'Search dynamic items...',
    } as TreeViewProps,
    argTypes: {
        variant: {
            control: { type: 'radio' },
            options: ['default', 'compact'],
        },
    },
    render: (args, context) =>
        createCodeStory({
            context,
            customCode: WithDynamicLoadingExampleCode,
            example: <Example {...args} />,
        }),
};
