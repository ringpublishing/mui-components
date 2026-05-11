import React, { useRef } from 'react';
import { DoNotDisturb, RocketLaunch } from '@mui/icons-material';
import { Button, Theme } from '@mui/material';
import { ActionBox, ActionBoxItem } from '@ringpublishing/mui-components';

export default function CustomStylingExample(): React.JSX.Element {
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
        {
            label: 'Styled last action',
            onClick: () => null,
            icon: <RocketLaunch />,
            sx: (theme: Theme) => ({
                color: theme.palette.common.white,
                backgroundColor: theme.palette.error.main,
                '&:hover': {
                    backgroundColor: theme.palette.error.dark,
                },
            }),
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
                sx={(theme: Theme) => ({
                    color: theme.palette.common.white,
                    backgroundColor: theme.palette.success.main,
                })}
            />
        </div>
    );
}
