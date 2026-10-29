import React, { useRef } from 'react';
import { Button } from '@mui/material';
import { Ban, ArrowUpDown, Rocket } from 'lucide-react';

import { ActionBox, ActionBoxItem } from '@ringpublishing/mui-components';

export default function VisibleExample(): React.JSX.Element {
    const ref = useRef<HTMLButtonElement | null>(null);

    const actions: ActionBoxItem[] = [
        {
            label: 'Action 1',
            onClick: () => null,
            icon: <Rocket />,
            hasSeparatorAfter: true,
        },
        {
            label: 'Action 2',
            onClick: () => null,
            disabled: true,
            disabledReason: 'Disabled because of some reason',
            icon: <Ban />,
        },
        {
            label: 'Action 3',
            onClick: () => null,
        },
        {
            label: 'Action 4',
            onClick: () => null,
            icon: <ArrowUpDown />,
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
                visibleActionsCount={2}
            />
        </div>
    );
}
