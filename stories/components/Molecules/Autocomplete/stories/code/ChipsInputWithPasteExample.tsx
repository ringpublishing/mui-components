import React, { useState } from 'react';
import { Autocomplete } from '@ringpublishing/mui-components';

export default function ChipsInputWithPasteExample(): React.JSX.Element {
    const [ids, setIds] = useState<string[]>([]);

    return (
        <Autocomplete
            variant="chipsInput"
            value={ids}
            onChange={(event, newValue): void => setIds(newValue as string[])}
            createChipsOnPaste={true}
            chipMaxWidth={120}
            duplicateEntryMessage={(entry: string): string => `"${entry}" is already on the list`}
            labels={{ title: 'Article IDs', inputPlaceholder: 'Paste a list of IDs' }}
            sx={{ width: 360 }}
        />
    );
}
