import React, { useRef, useState } from 'react';
import type { StoryObj } from '@storybook/react-vite';
import { Card, CardContent, Chip, GridLegacy as Grid, IconButton, Paper, useTheme } from '@mui/material';
import { MoreVert } from '@mui/icons-material';
import { action } from 'storybook/actions';
import { createCodeStory } from '../../../../helpers.js';
import WithDragHandleExampleCode from './code/WithDragHandleExample.tsx?raw';
import { ActionBox, SortableList, SortableListProps } from '../../../../../src/index.js';
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

function CustomListItemWithDragHandle(props: { item: Item }): React.JSX.Element {
    const anchorRef = useRef<HTMLButtonElement>(null);
    const theme = useTheme();

    return (
        <Paper sx={{ marginY: theme.spacing(2) }}>
            <Card>
                <CardContent>
                    <Grid container={true} spacing={2} alignItems={'center'}>
                        <Grid item={true} xs={2}>
                            <SortableList.DragHandle />
                        </Grid>
                        <Grid item={true} xs={5}>
                            <span>
                                Field (id: {props.item.id}) - {props.item.field}
                            </span>
                        </Grid>
                        <Grid item={true} xs={3}>
                            <Chip label={'Status'} />
                        </Grid>
                        <Grid item={true} xs={2}>
                            <IconButton
                                ref={anchorRef}
                                onClick={(): void => {
                                    /* noop */
                                }}
                            >
                                <MoreVert />
                            </IconButton>
                            <ActionBox
                                actions={[
                                    {
                                        label: 'Option 1',
                                        onClick: action('ActionBox -> Option 1'),
                                    },
                                ]}
                                anchorEl={anchorRef}
                            />
                        </Grid>
                    </Grid>
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

export const WithDragHandle: StoryObj<typeof SortableList<Item>> = {
    args: {
        ...defaultArgs,
        items: ITEMS,
        onChange: (items) => action('onChange')(items),
        renderItem: (item: Item): React.JSX.Element => <CustomListItemWithDragHandle item={item} />,
        grabByDragHandle: true,
    },
    name: 'With DragHandle',
    render: (args, context) =>
        createCodeStory({
            context,
            customProps: args,
            example: <SortableListWrapper {...(args as SortableListProps<Item>)} />,
            customCode: WithDragHandleExampleCode,
        }),
};
