import React from 'react';
import { DateTimePicker } from '@ringpublishing/mui-components';

export default function OutlinedExample(): React.JSX.Element {
    return (
        <DateTimePicker
            label="Date & Time"
            slotProps={{
                textField: {
                    variant: 'outlined',
                },
            }}
        />
    );
}
