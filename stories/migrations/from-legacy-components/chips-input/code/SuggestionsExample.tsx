import React, { useState } from 'react';
import { Autocomplete } from '@ringpublishing/mui-components';

export default function SuggestionsExample(): React.JSX.Element {
    const [tags, setTags] = useState<string[]>(['design']);

    return (
        <Autocomplete
            variant="chipsInput"
            options={['design', 'editorial', 'news', 'sport', 'video']}
            labels={{ title: 'Tags', inputPlaceholder: 'Type a tag and press Enter' }}
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
