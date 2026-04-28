import React from 'react';
import { SplitButton } from '@ringpublishing/mui-components';

export default function WithOneActionExample(): React.JSX.Element {
    return (
        <SplitButton
            actions={[
                {
                    label: 'Main Action',
                    onClick: () => null,
                    disabled: false,
                },
            ]}
        />
    );
}
