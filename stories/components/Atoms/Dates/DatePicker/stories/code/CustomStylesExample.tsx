import React from 'react';
import { DatePicker } from '@ringpublishing/mui-components';

export default function CustomStylesExample(): React.JSX.Element {
    return (
        <DatePicker
            sx={{
                backgroundColor: 'lightgray',
                padding: '8px',
                borderRadius: '4px',
            }}
        />
    );
}
