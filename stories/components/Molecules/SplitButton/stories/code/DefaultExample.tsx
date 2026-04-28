import React from 'react';
import { DoNotDisturb, RocketLaunch } from '@mui/icons-material';
import { SplitButton } from '@ringpublishing/mui-components';

export default function DefaultExample(): React.JSX.Element {
    return (
        <SplitButton
            actions={[
                {
                    label: 'Main Action',
                    onClick: () => null,
                    disabled: false,
                },
                {
                    label: 'Additional Action 1',
                    onClick: () => null,
                    icon: <RocketLaunch />,
                },
                {
                    label: 'Additional Action 2',
                    onClick: () => null,
                    disabled: true,
                    disabledReason: 'Disabled because of some reason',
                    icon: <DoNotDisturb />,
                },
            ]}
            className="custom-class-name"
            size="large"
        />
    );
}
