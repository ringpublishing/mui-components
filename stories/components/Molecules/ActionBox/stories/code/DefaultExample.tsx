import React, { useRef } from 'react';
import { Button } from '@mui/material';
import { DoNotDisturb, ImportExport, RocketLaunch } from '@mui/icons-material';

import { ActionBox, ActionBoxItem } from '@ringpublishing/mui-components';

export default function DefaultExample(): React.JSX.Element {
    const ref = useRef<HTMLButtonElement | null>(null);

    const actions: ActionBoxItem[] = [
        {
            label: 'Action 1',
            onClick: () => null,
            icon: <RocketLaunch />,
            hasSeparatorAfter: true,
        },
        {
            label: 'Action 2',
            onClick: () => null,
            disabled: true,
            disabledReason: 'Disabled because of some reason',
            icon: <DoNotDisturb />,
        },
        {
            label: 'Action 3',
            onClick: () => null,
        },
        {
            label: 'Action 4',
            onClick: () => null,
            icon: <ImportExport />,
            hasSeparatorBefore: true,
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
                placement="bottom-end"
                tooltipPlacement="right"
                className="custom-class-name"
            />
        </div>
    );
}
