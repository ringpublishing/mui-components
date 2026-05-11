import React from 'react';
import type { StoryObj } from '@storybook/react-vite';
import { createCodeStory } from '../../../../helpers.js';
import WithSearchExampleCode from './code/WithSearchExample.tsx?raw';
import { SimpleTree } from '../../../../../src/index.js';
import defaultArgs from '../common/defaultArgs.js';

type Story = StoryObj<typeof SimpleTree>;

const exampleItems = [
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

const Example = (args: React.ComponentProps<typeof SimpleTree>): React.JSX.Element => <SimpleTree {...args} />;

export const WithSearch: Story = {
    args: {
        ...defaultArgs,
        items: exampleItems,
        withSearch: true,
        searchPlaceholder: 'Search files...',
    },
    render: (args, context) =>
        createCodeStory({
            context,
            customCode: WithSearchExampleCode,
            example: <Example {...args} />,
        }),
};
