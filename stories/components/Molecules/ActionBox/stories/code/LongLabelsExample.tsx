import React, { useRef } from 'react';
import { Button } from '@mui/material';
import { Archive, Copy, Send, Trash2 } from 'lucide-react';

import { ActionBox, ActionBoxItem } from '@ringpublishing/mui-components';

export default function LongLabelsExample(): React.JSX.Element {
    const ref = useRef<HTMLButtonElement | null>(null);

    const actions: ActionBoxItem[] = [
        {
            label: 'Duplicate',
            onClick: () => null,
            icon: <Copy />,
        },
        {
            label: 'Send to the homepage editors for review before publication',
            onClick: () => null,
            icon: <Send />,
        },
        {
            label: 'Move to the archive of articles published before the 2024 site redesign',
            onClick: () => null,
            icon: <Archive />,
            hasSeparatorAfter: true,
        },
        {
            label: 'Delete permanently',
            onClick: () => null,
            disabled: true,
            disabledReason: 'An article that is still published on the homepage cannot be deleted',
            icon: <Trash2 />,
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
            <ActionBox actions={actions} anchorEl={ref} placement="bottom-end" />
        </div>
    );
}
