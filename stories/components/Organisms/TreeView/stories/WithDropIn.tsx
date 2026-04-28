import React, { useState } from 'react';
import type { StoryObj } from '@storybook/react-vite';
import { action } from 'storybook/actions';
import { createCodeStory } from '../../../../helpers.js';
import WithDropInExampleCode from './code/WithDropInExample.tsx?raw';
import { TreeView } from '../../../../../src/components/Organisms/TreeView/TreeView.js';
import { DefaultTreeViewProps } from '../../../../../src/components/Organisms/TreeView/DefaultTreeView.js';
import { exampleItems, defaultColumns } from '../common/defaultArgs.js';
import { moveItems, dropInItem, checkItem } from '../common/helpers.js';

type Story = StoryObj<typeof TreeView>;

const Example = (args: DefaultTreeViewProps): React.JSX.Element => {
    const [items, setItems] = useState(args.items);

    return (
        <TreeView
            {...args}
            items={items}
            onDragAndDropEnd={(sourceAbsolutePosition, destinationAbsolutePosition): void => {
                action('drag and drop end')(sourceAbsolutePosition, destinationAbsolutePosition);
                setItems(moveItems(items, sourceAbsolutePosition, destinationAbsolutePosition));
            }}
            onDropIn={(itemId, dropInItemId): void => {
                action('drop in')(itemId, dropInItemId);
                setItems(dropInItem(items, itemId, dropInItemId));
            }}
            onCheckboxChange={(itemId: string, checked: boolean): void => {
                action('checkbox changed')(itemId, checked);
                setItems(checkItem(items, itemId, checked));
            }}
        />
    );
};

export const WithDropIn: Story = {
    args: {
        variant: 'default',
        items: exampleItems,
        onExpand: (itemId: string): void => {
            action('row expanded')(itemId);
        },
        withSearch: false,
        showColumnHeaders: true,
        itemsLabelColumnHeader: 'Name',
        columns: defaultColumns,
        dragAndDropTooltipTitle: 'To drag and drop collapse the item first',
    } as DefaultTreeViewProps,
    render: (args, context) =>
        createCodeStory({
            context,
            customCode: WithDropInExampleCode,
            example: <Example {...(args as DefaultTreeViewProps)} />,
        }),
};
