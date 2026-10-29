import React, { useState } from 'react';
import { Autocomplete } from '@ringpublishing/mui-components';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
// Identifiers never contain spaces, so a space separates them as well as the default separators.
const ID_SEPARATORS = [',', ';', '\n', '\t', ' '];

export default function IdFilterExample(): React.JSX.Element {
    const [ids, setIds] = useState<string[]>(['3f2504e0-4f89-11d3-9a0c-0305e82c3301']);
    // Entries dropped by the last change; the first one is quoted under the field.
    const [rejected, setRejected] = useState<string[]>([]);

    return (
        <Autocomplete
            variant="chipsInput"
            labels={{ title: 'Identifiers', inputPlaceholder: 'Insert or paste identifiers' }}
            createChipsOnPaste={true}
            pasteSeparators={ID_SEPARATORS}
            duplicateEntryMessage={(entry): string => `"${entry}" is already on the list`}
            value={ids}
            // The value is controlled, so whatever is filtered out here never becomes a chip — typed or pasted.
            onChange={(event, value, reason): void => {
                const invalid = value.filter((entry): boolean => !UUID.test(entry));

                console.info('onChange', { value, reason, rejected: invalid });
                setIds(value.filter((entry): boolean => UUID.test(entry)));
                setRejected(invalid);
            }}
            onInputChange={(event, text): void => {
                if (text !== '') {
                    setRejected([]);
                }
            }}
            slotProps={{
                textField: {
                    error: rejected.length > 0,
                    helperText: rejected.length > 0 ? `"${rejected[0]}" is not a valid identifier` : undefined,
                },
            }}
            sx={{ width: 360 }}
        />
    );
}
