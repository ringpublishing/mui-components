import React from 'react';
import { Chip, Paper, useTheme } from '@mui/material';
import { SortableList } from '@ringpublishing/mui-components';

interface Item {
    id: number;
    label: string;
}

const initialItems: Item[] = [
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

export default function WrapExample(): React.JSX.Element {
    const theme = useTheme();
    const [items, setItems] = React.useState(initialItems);

    const onDelete = (deletedItem: Item): void => {
        setItems((current) => current.filter(({ id }) => id !== deletedItem.id));
    };

    return (
        <Paper elevation={1} sx={{ padding: theme.spacing(2), maxWidth: '400px' }}>
            <SortableList
                items={items}
                onChange={setItems}
                orientation="wrap"
                renderItem={(item): React.JSX.Element => (
                    <Chip label={item.label} onDelete={(): void => onDelete(item)} />
                )}
            />
        </Paper>
    );
}
