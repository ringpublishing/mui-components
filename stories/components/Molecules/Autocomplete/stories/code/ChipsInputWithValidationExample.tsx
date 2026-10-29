import React, { useState } from 'react';
import { Autocomplete } from '@ringpublishing/mui-components';

const isEmail = (entry: string): boolean => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(entry);

export default function ChipsInputWithValidationExample(): React.JSX.Element {
    const [recipients, setRecipients] = useState<string[]>(['anna@example.com', 'not-an-email']);

    return (
        <Autocomplete
            variant="chipsInput"
            value={recipients}
            onChange={(event, newValue): void => setRecipients(newValue as string[])}
            validateEntry={(entry: string): boolean => isEmail(entry)}
            duplicateEntryMessage={(entry: string): string => `"${entry}" is already on the list`}
            labels={{ title: 'Recipients', inputPlaceholder: 'Add an address' }}
            sx={{ width: 360 }}
        />
    );
}
