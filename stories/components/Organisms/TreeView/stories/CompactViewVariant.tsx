import React from 'react';
import type { StoryObj } from '@storybook/react-vite';
import { action } from 'storybook/actions';
import { Box } from '@mui/material';
import { createCodeStory } from '../../../../helpers.js';
import CompactViewVariantExampleCode from './code/CompactViewVariantExample.tsx?raw';
import { TreeView, TreeViewProps } from '../../../../../src/components/Organisms/TreeView/TreeView.js';
import { compactViewExampleItems } from '../common/compactItems.js';

type Story = StoryObj<typeof TreeView>;

const Example = (args: TreeViewProps): React.JSX.Element => {
    return (
        <Box sx={{ width: '400px' }}>
            <TreeView {...args} />
        </Box>
    );
};

export const CompactViewVariant: Story = {
    args: {
        variant: 'compact',
        items: compactViewExampleItems,
        onClickRow: (itemId: string): void => {
            action('row clicked')(itemId);
        },
        onExpand: (itemId: string): void => {
            action('row expanded')(itemId);
        },
        withSearch: true,
        searchPlaceholder: 'Search',
    } as TreeViewProps,
    render: (args, context) =>
        createCodeStory({
            context,
            customCode: CompactViewVariantExampleCode,
            example: <Example {...args} />,
        }),
};
