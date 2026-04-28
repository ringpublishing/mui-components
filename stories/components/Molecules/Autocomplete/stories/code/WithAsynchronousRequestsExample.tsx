import React, { useState } from 'react';
import { Autocomplete } from '@ringpublishing/mui-components';

interface Option {
    label: string;
    id: number;
}

const options: Option[] = [
    { label: 'Onet', id: 1 },
    { label: 'Fakt', id: 2 },
    { label: 'Komputer świat', id: 3 },
    { label: 'Newsweek', id: 4 },
    { label: 'Forbes', id: 5 },
    { label: 'Business insider', id: 6 },
];

function delaySleep(delay = 0): Promise<Option[]> {
    return new Promise((resolve) => {
        setTimeout(() => resolve(options), delay);
    });
}

export default function WithAsynchronousRequestsExample(): React.JSX.Element {
    const [open, setOpen] = useState(false);
    const [items, setItems] = useState<Option[]>([]);
    const [loading, setLoading] = useState(false);

    const handleOpen = async (): Promise<void> => {
        setOpen(true);

        if (items.length > 0) {
            return;
        }

        setLoading(true);

        try {
            const data = await delaySleep(1000);
            setItems(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Autocomplete
            labels={{ title: 'search by' }}
            open={(!loading && open) || (open && items.length > 0)}
            onOpen={handleOpen}
            onClose={() => setOpen(false)}
            loading={loading}
            options={items}
            sx={{ width: 300 }}
        />
    );
}
