import React, { useState } from 'react';
import type { StoryObj } from '@storybook/react-vite';
import { Card, CardContent, Paper, useTheme } from '@mui/material';
import { action } from 'storybook/actions';
import { createCodeStory } from '../../../../helpers.js';
import HorizontalExampleCode from './code/HorizontalExample.tsx?raw';
import { SortableList, SortableListProps } from '../../../../../src/index.js';
import { SortableItemData } from '../../../../../src/components/internal/SortableItem.js';
import defaultArgs from '../common/defaultArgs.js';

interface Item extends SortableItemData {
    field: string;
}

const ITEMS: Item[] = [
    { id: 1, field: 'Pizza' },
    { id: 2, field: 'Cheeseburger' },
    { id: 3, field: 'Pasta' },
];

function CustomCard(props: { item: Item }): React.JSX.Element {
    const theme = useTheme();

    return (
        <Paper sx={{ marginX: theme.spacing(1) }}>
            <Card>
                <CardContent>
                    <span>
                        Field (id: {props.item.id}) - {props.item.field}
                    </span>
                </CardContent>
            </Card>
        </Paper>
    );
}

function SortableListWrapper(props: SortableListProps<Item>): React.JSX.Element {
    const [items, setItems] = useState(props.items);
    const theme = useTheme();
    const { onChange: onChangeAction } = props;

    const onChange = (newItems: Item[]): void => {
        onChangeAction(newItems);
        setItems(newItems);
    };

    return (
        <Paper elevation={1} sx={{ padding: theme.spacing(2), minWidth: '50%' }}>
            <SortableList {...props} onChange={onChange} items={items} />
        </Paper>
    );
}

export const Horizontal: StoryObj<typeof SortableList<Item>> = {
    args: {
        ...defaultArgs,
        items: ITEMS,
        onChange: (items) => action('onChange')(items),
        renderItem: (item: Item): React.JSX.Element => <CustomCard item={item} />,
        orientation: 'horizontal',
    },
    render: (args, context) =>
        createCodeStory({
            context,
            customProps: args,
            example: <SortableListWrapper {...(args as SortableListProps<Item>)} />,
            customCode: HorizontalExampleCode,
        }),
};
