import React, { useState } from 'react';
import { Autocomplete } from '@ringpublishing/mui-components';

interface Option {
    label: string;
    id: number;
}

export default function WithSortableChipsExample(): React.JSX.Element {
    const options: Option[] = [
        { label: 'Onet', id: 1 },
        { label: 'Fakt', id: 2 },
        { label: 'Komputer świat', id: 3 },
        { label: 'Newsweek', id: 4 },
        { label: 'Forbes', id: 5 },
        { label: 'Business insider', id: 6 },
    ];

    const [selected, setSelected] = useState<Option[]>([options[0], options[1], options[2], options[3]]);

    return (
        <Autocomplete
            options={options}
            value={selected}
            multiple={true}
            sortableChips={true}
            onChange={(event, value, reason): void => {
                // `reason` is 'reorder' when the user drags a chip to a new position
                setSelected(value as Option[]);
            }}
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
