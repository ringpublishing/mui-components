import React, { useState } from 'react';
import { Autocomplete } from '@ringpublishing/mui-components';

const isSameTag = (option: string, value: string): boolean => option.toLowerCase() === value.toLowerCase();

export default function WithDuplicateFeedbackExample(): React.JSX.Element {
    const [tags, setTags] = useState<string[]>(['design']);

    return (
        <Autocomplete
            options={[]}
            multiple
            freeSolo
            value={tags}
            onChange={(event, newValue): void => {
                setTags(newValue as string[]);
            }}
            isOptionEqualToValue={isSameTag}
            duplicateEntryMessage={(entry: string): string => `"${entry}" is already on the list`}
            slotProps={{ textField: { helperText: 'Press Enter to add a tag' } }}
            labels={{ title: 'Tags' }}
            sx={{ width: 300 }}
        />
    );
}
