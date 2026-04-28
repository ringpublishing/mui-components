import React from 'react';
import { DateTimePicker } from '@ringpublishing/mui-components';

export default function CustomStylesExample(): React.JSX.Element {
    return (
        <DateTimePicker
            sx={{
                backgroundColor: 'lightgray',
                padding: '8px',
                borderRadius: '4px',
            }}
        />
    );
}
