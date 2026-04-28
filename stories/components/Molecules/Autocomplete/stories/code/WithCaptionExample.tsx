import React from 'react';
import { Autocomplete } from '@ringpublishing/mui-components';

interface OptionWithCaption {
    label: string;
    id: number;
    caption: string;
}

export default function WithCaptionExample(): React.JSX.Element {
    const optionsWithCaption: OptionWithCaption[] = [
        { label: 'Onet', id: 1, caption: 'Onet portal' },
        { label: 'Fakt', id: 2, caption: 'Fakt o tym się mówi' },
        { label: 'Komputer świat', id: 3, caption: 'Porozmawiajmy o komputerach / O telefonach / O technologii' },
        { label: 'Newsweek', id: 4, caption: 'Newsweek' },
        { label: 'Forbes', id: 5, caption: 'Pieniądze' },
        { label: 'Business insider', id: 6, caption: 'O pieniądzach' },
    ];

    return (
        <Autocomplete
            options={optionsWithCaption}
            defaultValue={optionsWithCaption[0]}
            labels={{ title: 'search by' }}
            sx={{ width: 300 }}
        />
    );
}
