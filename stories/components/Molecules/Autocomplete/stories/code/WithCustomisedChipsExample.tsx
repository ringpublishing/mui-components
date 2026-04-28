import React from 'react';
import { Autocomplete } from '@ringpublishing/mui-components';

interface Option {
    label: string;
    id: number;
}

export default function WithCustomisedChipsExample(): React.JSX.Element {
    const options: Option[] = [
        { label: 'Onet', id: 1 },
        { label: 'Fakt', id: 2 },
        { label: 'Komputer świat', id: 3 },
        { label: 'Newsweek', id: 4 },
        { label: 'Forbes', id: 5 },
        { label: 'Business insider', id: 6 },
    ];

    return (
        <Autocomplete
            options={options}
            defaultValue={[options[0], options[1]]}
            multiple
            slotProps={{
                chip: {
                    color: 'primary',
                    size: 'small',
                },
            }}
            labels={{ title: 'filter by' }}
            sx={{ width: 300 }}
        />
    );
}
