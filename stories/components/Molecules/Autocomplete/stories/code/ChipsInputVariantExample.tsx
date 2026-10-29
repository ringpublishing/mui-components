import React, { useState } from 'react';
import { Autocomplete } from '@ringpublishing/mui-components';

export default function ChipsInputVariantExample(): React.JSX.Element {
    const [tags, setTags] = useState<string[]>(['design']);

    return (
        <Autocomplete
            variant="chipsInput"
            options={['design', 'editorial', 'news', 'sport', 'video']}
            value={tags}
            onChange={(event, newValue): void => setTags(newValue as string[])}
            isOptionEqualToValue={(option: string, value: string): boolean =>
                option.toLowerCase() === value.toLowerCase()
            }
            duplicateEntryMessage={(entry: string): string => `"${entry}" is already on the list`}
            labels={{ title: 'Tags', inputPlaceholder: 'Type a tag and press Enter' }}
            sx={{ width: 360 }}
        />
    );
}
