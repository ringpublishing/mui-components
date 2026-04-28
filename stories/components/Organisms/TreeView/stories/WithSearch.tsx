import React, { useState } from 'react';
import type { StoryObj } from '@storybook/react-vite';
import { action } from 'storybook/actions';
import { createCodeStory } from '../../../../helpers.js';
import WithSearchExampleCode from './code/WithSearchExample.tsx?raw';
import { TreeView } from '../../../../../src/components/Organisms/TreeView/TreeView.js';
import { DefaultTreeViewProps } from '../../../../../src/components/Organisms/TreeView/DefaultTreeView.js';
import { exampleItems, defaultColumns } from '../common/defaultArgs.js';
import { checkItem } from '../common/helpers.js';

type Story = StoryObj<typeof TreeView>;

const Example = (args: DefaultTreeViewProps): React.JSX.Element => {
    const [items, setItems] = useState(args.items);

    return (
        <TreeView
            {...args}
            items={items}
            onCheckboxChange={(itemId: string, checked: boolean): void => {
                action('checkbox changed')(itemId, checked);
                setItems(checkItem(items, itemId, checked));
            }}
        />
    );
};

export const WithSearch: Story = {
    args: {
        variant: 'default',
        items: exampleItems,
        onClickRow: (itemId: string): void => {
            action('row clicked')(itemId);
        },
        onExpand: (itemId: string): void => {
            action('row expanded')(itemId);
        },
        withSearch: true,
        showColumnHeaders: true,
        itemsLabelColumnHeader: 'Name',
        columns: defaultColumns,
    } as DefaultTreeViewProps,
    render: (args, context) =>
        createCodeStory({
            context,
            customCode: WithSearchExampleCode,
            example: <Example {...(args as DefaultTreeViewProps)} />,
        }),
};
