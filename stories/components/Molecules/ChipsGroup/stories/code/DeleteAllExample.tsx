import React, { useState } from 'react';
import { ChipsGroup } from '@ringpublishing/mui-components';

export default function DeleteAllExample(): React.JSX.Element {
    const initialChips = [
        {
            id: '1',
            label: 'Chip 1',
            color: 'error' as const,
            variant: 'outlined' as const,
            onDelete: () => {
                setChips((prevChips) => prevChips.filter((chip) => chip.id !== '1'));
            },
        },
        {
            id: '2',
            label: 'Chip 2',
            color: 'primary' as const,
            variant: 'filled' as const,
            onClick: (): null => null,
            onDelete: () => {
                setChips((prevChips) => prevChips.filter((chip) => chip.id !== '2'));
            },
        },
    ];

    const [chips, setChips] = useState(initialChips);

    return (
        <div style={{ width: '250px' }}>
            <ChipsGroup chips={chips} onDeleteAll={() => setChips([])} />
        </div>
    );
}
