import React from 'react';
import { Chip } from '@mui/material';
import type { StoryObj } from '@storybook/react-vite';
import { createCodeStory } from '../../../../helpers.js';
import WithCustomElementsExampleCode from './code/WithCustomElementsExample.tsx?raw';
import { SimpleTree, SimpleTreeItem } from '../../../../../src/index.js';
import defaultArgs from '../common/defaultArgs.js';

type Story = StoryObj<typeof SimpleTree>;

const itemsWithElements: SimpleTreeItem[] = [
    {
        itemId: '0',
        label: 'Categories',
        expanded: true,
        element: <Chip color="primary" label={3} size="small" sx={{ height: '18px' }} />,
        items: [
            {
                itemId: '0.0',
                label: 'Electronics',
                element: <Chip color="success" label="New" size="small" sx={{ height: '18px' }} />,
                items: [
                    { itemId: '0.0.0', label: 'Laptops' },
                    { itemId: '0.0.1', label: 'Phones' },
                ],
            },
            {
                itemId: '0.1',
                label: 'Clothing',
                element: <Chip color="warning" label="Sale" size="small" sx={{ height: '18px' }} />,
                items: [
                    { itemId: '0.1.0', label: 'Shirts' },
                    { itemId: '0.1.1', label: 'Pants' },
                ],
            },
            {
                itemId: '0.2',
                label: 'Books',
                element: <Chip color="info" label={42} size="small" sx={{ height: '18px' }} />,
            },
        ],
    },
    {
        itemId: '1',
        label: 'Archived',
        element: <Chip color="default" label="Disabled" size="small" sx={{ height: '18px' }} />,
    },
];

const Example = (args: React.ComponentProps<typeof SimpleTree>): React.JSX.Element => <SimpleTree {...args} />;

export const WithCustomElements: Story = {
    args: {
        ...defaultArgs,
        items: itemsWithElements,
    },
    render: (args, context) =>
        createCodeStory({
            context,
            customCode: WithCustomElementsExampleCode,
            example: <Example {...args} />,
        }),
};
