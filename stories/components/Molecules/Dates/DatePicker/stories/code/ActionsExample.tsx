import React from 'react';
import { DatePicker } from '@ringpublishing/mui-components';

export default function ActionsExample(): React.JSX.Element {
    return (
        <DatePicker
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
