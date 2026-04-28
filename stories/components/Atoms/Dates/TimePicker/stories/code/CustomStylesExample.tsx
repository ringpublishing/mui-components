import React from 'react';
import { TimePicker } from '@ringpublishing/mui-components';

export default function CustomStylesExample(): React.JSX.Element {
    return (
        <TimePicker
            sx={{
                backgroundColor: 'lightgray',
                padding: '8px',
                borderRadius: '4px',
            }}
        />
    );
}
