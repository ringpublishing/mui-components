import React from 'react';
import { MediaCard } from '@ringpublishing/mui-components';
import { Trash2, LockOpen } from 'lucide-react';
import { getImagePath, TestImage, ImageSize } from 'RingDemoImages';

export default function StatusLabelsExample(): React.JSX.Element {
    const statusLabels = [
        {
            label: 'Deleted',
            color: 'error' as const,
            icon: <Trash2 />,
            key: 'test-deleted',
        },
        {
            label: 'Inactive',
            color: 'default' as const,
            key: 'test-inactive',
        },
        {
            label: 'J. Zatrzymałowski',
            color: 'error' as const,
            icon: <LockOpen />,
            tip: 'This resource is locked by J. Zatrzymałowski',
        },
        {
            label: 'New',
            color: 'primary' as const,
            icon: <LockOpen />,
            showOnHover: true,
        },
    ];
    const fields = [
        { value: 'Source / Author' },
        { value: 'Brief description or summary of the content' },
        { value: 'Space for comments or additional information that may take up more space' },
    ];

    return (
        <MediaCard
            sx={{ width: '300px' }}
            title="Title / name"
            fields={fields}
            statusLabels={statusLabels}
            image={getImagePath(TestImage.ISLAND, ImageSize.MEDIUM)}
            ratio="16/9"
            objectFit="fill"
        />
    );
}
