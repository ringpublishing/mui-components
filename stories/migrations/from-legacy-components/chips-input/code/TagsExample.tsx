import React, { useState } from 'react';
import { Autocomplete } from '@ringpublishing/mui-components';

export default function TagsExample(): React.JSX.Element {
    const [tags, setTags] = useState<string[]>(['news']);

    return (
        <Autocomplete
            variant="chipsInput"
            labels={{ title: 'Tags', inputPlaceholder: 'Insert value and press Enter' }}
            duplicateEntryMessage={(entry): string => `"${entry}" is already on the list`}
            value={tags}
            onChange={(event, value, reason, details): void => {
                console.info('onChange', { value, reason, details });
                setTags(value);
            }}
            sx={{ width: 360 }}
        />
    );
}
