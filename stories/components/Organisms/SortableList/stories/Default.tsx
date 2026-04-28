import React, { useState } from 'react';
import type { StoryObj } from '@storybook/react-vite';
import { Card, CardContent, GridLegacy as Grid, IconButton, Paper, useTheme } from '@mui/material';
import { MoreVert, LocalCafe } from '@mui/icons-material';
import { action } from 'storybook/actions';
import { createCodeStory } from '../../../../helpers.js';
import DefaultExampleCode from './code/DefaultExample.tsx?raw';
import { ActionBox, SortableList, SortableListProps, useNonDraggableRef } from '../../../../../src/index.js';
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

function CustomListItem(props: { item: Item }): React.JSX.Element {
    const iconBtnRef = useNonDraggableRef();
    const cafeBtnRef = useNonDraggableRef();
    const theme = useTheme();

    return (
        <Paper sx={{ marginY: theme.spacing(2) }}>
            <Card>
                <CardContent>
                    <Grid container={true} spacing={2} alignItems={'center'}>
                        <Grid item={true} xs={9}>
                            <span>
                                Field (id: {props.item.id}) - {props.item.field}
                            </span>
                        </Grid>
                        <Grid item={true} xs={1}>
                            <IconButton
                                ref={cafeBtnRef.setRef}
                                onClick={(event): void => {
                                    action('Cafe button action')(event);
                                }}
                            >
                                <LocalCafe />
                            </IconButton>
                        </Grid>
                        <Grid item={true} xs={2}>
                            <IconButton
                                ref={iconBtnRef.setRef}
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
                                        onClick: (event: React.MouseEvent<Element, MouseEvent>) => {
                                            action('ActionBox -> Option 1')(event);
                                        },
                                    },
                                ]}
                                anchorEl={iconBtnRef}
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

export const Default: StoryObj<typeof SortableList<Item>> = {
    args: {
        ...defaultArgs,
        items: ITEMS,
        onChange: (items) => action('onChange')(items),
        renderItem: (item: Item): React.JSX.Element => <CustomListItem item={item} />,
    },
    render: (args, context) =>
        createCodeStory({
            context,
            customProps: args,
            example: <SortableListWrapper {...(args as SortableListProps<Item>)} />,
            customCode: DefaultExampleCode,
        }),
};
