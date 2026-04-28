import React from 'react';
import { SplitButton } from '@ringpublishing/mui-components';

export default function CustomizationExample(): React.JSX.Element {
    return (
        <SplitButton
            actions={[
                {
                    label: 'Main Action',
                    onClick: () => null,
                    disabled: false,
                },
                {
                    label: 'Extra Action',
                    onClick: () => null,
                },
            ]}
            size="medium"
            variant="contained"
            color="warning"
            orientation="horizontal"
        />
    );
}
