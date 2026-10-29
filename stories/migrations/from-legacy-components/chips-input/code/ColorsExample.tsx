import React from 'react';
import { Chip } from '@mui/material';
import { X } from 'lucide-react';
import { Autocomplete } from '@ringpublishing/mui-components';

export default function ColorsExample(): React.JSX.Element {
    return (
        <Autocomplete
            variant="chipsInput"
            labels={{ title: 'Email', inputPlaceholder: 'Enter email address' }}
            validateEntry={(entry): boolean => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(entry))}
            renderChip={({ label, chipProps, invalid }): React.ReactNode => (
                <Chip
                    {...chipProps}
                    label={label}
                    color={invalid ? 'warning' : 'success'}
                    // The library's own glyph; `flexShrink: 0` keeps it whole on a truncated chip.
                    deleteIcon={<X size="1em" style={{ flexShrink: 0 }} />}
                />
            )}
            duplicateEntryMessage="Email already added"
            defaultValue={['anna@example.com', 'not-an-email']}
            onChange={(event, value, reason): void => console.info('onChange', { value, reason })}
            sx={{ width: 360 }}
        />
    );
}
