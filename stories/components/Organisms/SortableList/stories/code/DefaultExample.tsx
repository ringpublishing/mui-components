import React from 'react';
import { Card, CardContent, GridLegacy as Grid, IconButton, Paper, useTheme } from '@mui/material';
import { MoreVert } from '@mui/icons-material';
import { ActionBox, SortableList, useNonDraggableRef } from '@ringpublishing/mui-components';

interface Item {
    id: number;
    field: string;
}

const initialItems: Item[] = [
    { id: 1, field: 'Pizza' },
    { id: 2, field: 'Cheeseburger' },
    { id: 3, field: 'Pasta' },
];

function CustomListItem(props: { item: Item }): React.JSX.Element {
    const ref = useNonDraggableRef();
    const theme = useTheme();

    return (
        <Paper sx={{ marginY: theme.spacing(2) }}>
            <Card>
                <CardContent>
                    <Grid container={true} spacing={2} alignItems={'center'}>
                        <Grid item={true} xs={11}>
                            <span>
                                Field (id: {props.item.id}) - {props.item.field}
                            </span>
                        </Grid>
                        <Grid item={true} xs={1}>
                            <IconButton
                                ref={ref.setRef}
                                onClick={(event): void => {
                                    event.stopPropagation();
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
                                anchorEl={ref}
                            />
                        </Grid>
                    </Grid>
                </CardContent>
            </Card>
        </Paper>
    );
}

export default function DefaultExample(): React.JSX.Element {
    const [items, setItems] = React.useState(initialItems);

    const onChange = (newItems: Item[]): void => {
        setItems(newItems);
    };

    const renderItem = (item: Item): React.JSX.Element => <CustomListItem item={item} />;

    return <SortableList items={items} onChange={onChange} renderItem={renderItem} />;
}
