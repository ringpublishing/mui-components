import React from 'react';
import { DatePicker } from '@ringpublishing/mui-components';

export default function OutlinedExample(): React.JSX.Element {
    return (
        <DatePicker
            label="Date"
            slotProps={{
                textField: {
                    variant: 'outlined',
                },
            }}
        />
    );
}
