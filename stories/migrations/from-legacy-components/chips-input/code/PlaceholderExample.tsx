import React from 'react';
import { Autocomplete } from '@ringpublishing/mui-components';

export default function PlaceholderExample(): React.JSX.Element {
    return (
        <Autocomplete
            variant="chipsInput"
            labels={{ title: 'Identifiers', inputPlaceholder: 'Insert or paste identifiers' }}
            // MUI hides the placeholder until the label shrinks; a label shrunk from the start keeps it visible.
            slotProps={{ textField: { slotProps: { inputLabel: { shrink: true } } } }}
            onChange={(event, value, reason): void => console.info('onChange', { value, reason })}
            sx={{ width: 360 }}
        />
    );
}
