import React, { useRef } from 'react';
import { Button } from '@mui/material';
import { DoNotDisturb, RocketLaunch } from '@mui/icons-material';

import { ActionBox, ActionBoxItem } from '@ringpublishing/mui-components';

export default function PopperPlacementExample(): React.JSX.Element {
    const ref = useRef<HTMLButtonElement | null>(null);

    const actions: ActionBoxItem[] = [
        {
            label: 'Action 1',
            onClick: () => null,
            icon: <RocketLaunch />,
        },
        {
            label: 'Action 2',
            onClick: () => null,
            disabled: true,
            disabledReason: 'Disabled because of some reason',
            icon: <DoNotDisturb />,
        },
    ];

    return (
        <div
            style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
            }}
        >
            <Button data-testid="action-box-trigger" variant="outlined" color="primary" ref={ref}>
                Click me!
            </Button>
            <ActionBox
                actions={actions}
                anchorEl={ref}
                placement="left-start"
                tooltipPlacement="left"
                disablePortal={true}
            />
        </div>
    );
}
