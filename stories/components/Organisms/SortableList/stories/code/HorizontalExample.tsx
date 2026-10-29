import React from 'react';
import { Card, CardContent, Paper, useTheme } from '@mui/material';
import { SortableList } from '@ringpublishing/mui-components';

interface Item {
    id: number;
    field: string;
}

const initialItems: Item[] = [
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

export default function HorizontalExample(): React.JSX.Element {
    const [items, setItems] = React.useState(initialItems);

    const onChange = (newItems: Item[]): void => {
        setItems(newItems);
    };

    const renderItem = (item: Item): React.JSX.Element => <CustomCard item={item} />;

    return <SortableList items={items} onChange={onChange} renderItem={renderItem} orientation="horizontal" />;
}
