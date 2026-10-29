import React from 'react';
import { Stack } from '@mui/material';
import { ExternalLink } from 'lucide-react';
import { Action, Autocomplete } from '@ringpublishing/mui-components';

interface Option {
    label: string;
    id: number;
}

const options: Option[] = [
    { label: 'Onet', id: 1 },
    { label: 'Business Insider', id: 2 },
    { label: 'International politics, economy and society — the weekend edition supplement', id: 3 },
    { label: 'LabelWithVeryLongTextThatShouldBeBreakToNextLine', id: 4 },
];

export default function WithLongValueExample(): React.JSX.Element {
    const actions: Action[] = [
        { icon: <ExternalLink />, label: 'Open section', onClick: (): void => console.info('Open section clicked') },
    ];

    return (
        <Stack spacing={3}>
            <Autocomplete
                options={options}
                defaultValue={options[2]}
                actions={actions}
                labels={{ title: 'Section' }}
                sx={{ width: 320 }}
            />
            <Autocomplete
                multiple={true}
                options={options}
                defaultValue={[options[3], options[0]]}
                actions={actions}
                labels={{ title: 'Sections' }}
                sx={{ width: 320 }}
            />
        </Stack>
    );
}
