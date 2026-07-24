import React from 'react';
import { Autocomplete } from '@ringpublishing/mui-components';

interface OptionWithAvatar {
    label: string;
    id: number;
    avatar: string;
}

export default function WithAvatarExample(): React.JSX.Element {
    const optionsWithAvatar: OptionWithAvatar[] = [
        { label: 'Onet', id: 1, avatar: 'https://picsum.photos/seed/onet/48' },
        { label: 'Fakt', id: 2, avatar: 'https://picsum.photos/seed/fakt/48' },
        { label: 'Komputer świat', id: 3, avatar: 'https://picsum.photos/seed/komputer/48' },
        { label: 'Newsweek', id: 4, avatar: 'https://picsum.photos/seed/newsweek/48' },
        { label: 'Forbes', id: 5, avatar: 'https://picsum.photos/seed/forbes/48' },
        { label: 'Business insider', id: 6, avatar: 'https://picsum.photos/seed/business/48' },
    ];

    return (
        <Autocomplete
            options={optionsWithAvatar}
            defaultValue={optionsWithAvatar[0]}
            labels={{ title: 'search by' }}
            sx={{ width: 300 }}
        />
    );
}
