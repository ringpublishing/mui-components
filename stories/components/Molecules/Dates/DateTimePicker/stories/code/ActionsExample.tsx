import React from 'react';
import { DateTimePicker } from '@ringpublishing/mui-components';

export default function ActionsExample(): React.JSX.Element {
    return (
        <DateTimePicker
            actions={[
                {
                    label: 'Copy',
                    onClick: () => {
                        // Handle copy action
                    },
                },
                {
                    label: 'Share',
                    onClick: () => {
                        // Handle share action
                    },
                },
            ]}
        />
    );
}
