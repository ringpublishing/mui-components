import React from 'react';
import { Card, CardContent, Chip, GridLegacy as Grid, IconButton, Paper, useTheme } from '@mui/material';
import { MoreVert } from '@mui/icons-material';
import { ActionBox, SortableList } from '@ringpublishing/mui-components';

interface Item {
    id: number;
    field: string;
}

const initialItems: Item[] = [
    { id: 1, field: 'Pizza' },
    { id: 2, field: 'Cheeseburger' },
    { id: 3, field: 'Pasta' },
];

function CustomListItemWithDragHandle(props: { item: Item }): React.JSX.Element {
    const anchorRef = React.useRef<HTMLButtonElement>(null);
    const theme = useTheme();

    return (
        <Paper sx={{ marginY: theme.spacing(2) }}>
            <Card>
                <CardContent>
                    <Grid container={true} spacing={2} alignItems={'center'}>
                        <Grid item={true} xs={2}>
                            <SortableList.DragHandle />
                        </Grid>
                        <Grid item={true} xs={6}>
                            <span>
                                Field (id: {props.item.id}) - {props.item.field}
                            </span>
                        </Grid>
                        <Grid item={true} xs={3}>
                            <Chip label={'Available'} />
                        </Grid>
                        <Grid item={true} xs={1}>
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
                                        onClick: () => console.log('Option 1 clicked'),
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

export default function WithDragHandleExample(): React.JSX.Element {
    const [items, setItems] = React.useState(initialItems);

    const onChange = (newItems: Item[]): void => {
        setItems(newItems);
    };

    const renderItem = (item: Item): React.JSX.Element => <CustomListItemWithDragHandle item={item} />;

    return <SortableList items={items} onChange={onChange} renderItem={renderItem} grabByDragHandle={true} />;
}
