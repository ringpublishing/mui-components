import React, { useState } from 'react';
import type { StoryObj } from '@storybook/react-vite';
import { Chip, Paper, useTheme } from '@mui/material';
import { action } from 'storybook/actions';
import { createCodeStory } from '../../../../helpers.js';
import WrapExampleCode from './code/WrapExample.tsx?raw';
import { SortableList, SortableListProps } from '../../../../../src/index.js';
import { SortableItemData } from '../../../../../src/components/internal/SortableItem.js';
import defaultArgs from '../common/defaultArgs.js';

interface Item extends SortableItemData {
    label: string;
}

const ITEMS: Item[] = [
    { id: 1, label: 'Pizza' },
    { id: 2, label: 'Cheeseburger' },
    { id: 3, label: 'Pasta with tomato sauce' },
    { id: 4, label: 'Sushi' },
    { id: 5, label: 'Ramen' },
    { id: 6, label: 'Caesar salad' },
    { id: 7, label: 'Tacos' },
    { id: 8, label: 'Pad thai' },
    { id: 9, label: 'Falafel' },
    { id: 10, label: 'Butter chicken' },
];

function SortableListWrapper(props: SortableListProps<Item>): React.JSX.Element {
    const [items, setItems] = useState(props.items);
    const theme = useTheme();
    const { onChange: onChangeAction } = props;

    const onChange = (newItems: Item[]): void => {
        onChangeAction(newItems);
        setItems(newItems);
    };

    const onDelete = (deletedItem: Item): void => {
        action('onDelete')(deletedItem);
        setItems((current) => current.filter(({ id }) => id !== deletedItem.id));
    };

    return (
        <Paper elevation={1} sx={{ padding: theme.spacing(2), maxWidth: '400px' }}>
            <SortableList
                {...props}
                onChange={onChange}
                items={items}
                renderItem={(item): React.JSX.Element => (
                    <Chip label={item.label} onDelete={(): void => onDelete(item)} />
                )}
            />
        </Paper>
    );
}

export const Wrap: StoryObj<typeof SortableList<Item>> = {
    args: {
        ...defaultArgs,
        items: ITEMS,
        onChange: (items) => action('onChange')(items),
        // `renderItem` is supplied by SortableListWrapper — it closes over the wrapper's state to
        // implement onDelete, so an arg here would be dead weight the Controls panel cannot drive.
        orientation: 'wrap',
    },
    render: (args, context) =>
        createCodeStory({
            context,
            customProps: args,
            example: <SortableListWrapper {...(args as SortableListProps<Item>)} />,
            customCode: WrapExampleCode,
        }),
};
