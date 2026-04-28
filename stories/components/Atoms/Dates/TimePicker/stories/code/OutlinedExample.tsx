import React from 'react';
import { TimePicker } from '@ringpublishing/mui-components';

export default function OutlinedExample(): React.JSX.Element {
    return (
        <TimePicker
            label="Time"
            slotProps={{
                textField: {
                    variant: 'outlined',
                },
            }}
        />
    );
}
