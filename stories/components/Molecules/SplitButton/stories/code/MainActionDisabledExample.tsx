import React from 'react';
import { SplitButton } from '@ringpublishing/mui-components';

export default function MainActionDisabledExample(): React.JSX.Element {
    return (
        <SplitButton
            actions={[
                {
                    label: 'Main Action',
                    onClick: () => null,
                    disabled: true,
                    disabledReason: 'Disabled because of some reason',
                },
                {
                    label: 'Additional Action',
                    onClick: () => null,
                    disabled: false,
                },
            ]}
        />
    );
}
