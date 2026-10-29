import React, { useState } from 'react';
import { Autocomplete } from '@ringpublishing/mui-components';

interface ValueChip {
    id: string;
    label: string;
}

// Typed and pasted entries arrive as strings, chips already in `value` are your objects.
const labelOf = (entry: ValueChip | string): string => (typeof entry === 'string' ? entry : entry.label);
const toChip = (entry: ValueChip | string): ValueChip =>
    typeof entry === 'string' ? { id: entry, label: entry } : entry;
const isParameterValue = (text: string): boolean => /^[\w.*-]+$/.test(text);

export default function ObjectsExample(): React.JSX.Element {
    const [values, setValues] = useState<ValueChip[]>([{ id: 'variant-a', label: 'variant-a' }]);

    return (
        <Autocomplete
            variant="chipsInput"
            labels={{ title: 'Parameter values *', inputPlaceholder: 'Enter value and press Enter (* for any value)' }}
            getOptionLabel={labelOf}
            isOptionEqualToValue={(option, value): boolean => labelOf(option) === labelOf(value)}
            validateEntry={(entry): boolean => isParameterValue(labelOf(entry))}
            duplicateEntryMessage="Value already added"
            value={values}
            onChange={(event, value, reason): void => {
                console.info('onChange', { value, reason });
                setValues(value.map(toChip));
            }}
            sx={{ width: 360 }}
        />
    );
}
