import React, { useState } from 'react';
import { Autocomplete, AutocompleteChangeReason } from '@ringpublishing/mui-components';

interface Option {
    label: string;
    id: number;
}

export default function WithFreeSoloExample(): React.JSX.Element {
    const options: Option[] = [
        { label: 'Onet', id: 1 },
        { label: 'Fakt', id: 2 },
        { label: 'Komputer świat', id: 3 },
        { label: 'Newsweek', id: 4 },
        { label: 'Forbes', id: 5 },
        { label: 'Business insider', id: 6 },
    ];

    const [value, setValue] = useState<Option[]>([options[0]]);

    return (
        <Autocomplete
            options={options}
            multiple
            freeSolo
            value={value}
            onChange={(event: React.SyntheticEvent, newValue: unknown, reason: AutocompleteChangeReason): void => {
                if (reason === 'createOption') {
                    const newOption = (newValue as string[]).slice(-1)[0];
                    newValue = [...value, { label: newOption, id: value.length + 1 }];
                }
                setValue(newValue as Option[]);
            }}
            labels={{ title: 'Free solo' }}
            sx={{ width: 300 }}
        />
    );
}
