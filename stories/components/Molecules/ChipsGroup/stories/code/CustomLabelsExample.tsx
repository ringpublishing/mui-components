import React, { useState } from 'react';
import { ChipsGroup } from '@ringpublishing/mui-components';

export default function CustomLabelsExample(): React.JSX.Element {
    const initialChips = [
        {
            id: '1',
            label: 'Chip 1',
            color: 'error' as const,
            variant: 'outlined' as const,
        },
        {
            id: '2',
            label: 'Chip 2',
            color: 'primary' as const,
            variant: 'filled' as const,
            onClick: (): null => null,
        },
        {
            id: '3',
            label: 'Chip 3',
            color: 'secondary' as const,
            variant: 'filled' as const,
        },
        {
            id: '4',
            label: 'Chip 4',
            color: 'secondary' as const,
            variant: 'filled' as const,
        },
        {
            id: '5',
            label: 'Chip 5',
            color: 'primary' as const,
            variant: 'outlined' as const,
            onClick: (): null => null,
        },
        {
            id: '6',
            label: 'Chip 6',
            color: 'secondary' as const,
            variant: 'filled' as const,
            onDelete: () => {
                setChips((prevChips) => prevChips.filter((chip) => chip.id !== '6'));
            },
        },
    ];

    const [chips, setChips] = useState(initialChips);

    return (
        <div style={{ width: '250px' }}>
            <ChipsGroup
                chips={chips}
                expandable
                collapsable
                onDeleteAll={() => setChips([])}
                customLabels={{
                    deleteAll: 'Delete all chips',
                    showLess: 'Hide',
                }}
            />
        </div>
    );
}
