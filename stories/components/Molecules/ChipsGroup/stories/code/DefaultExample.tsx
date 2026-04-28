import React from 'react';
import { ChipsGroup } from '@ringpublishing/mui-components';

export default function DefaultExample(): React.JSX.Element {
    const chips = [
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
        },
    ];

    return (
        <div style={{ width: '250px' }}>
            <ChipsGroup chips={chips} />
        </div>
    );
}
