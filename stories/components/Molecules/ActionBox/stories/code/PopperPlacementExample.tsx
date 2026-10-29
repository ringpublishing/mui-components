import React, { useRef } from 'react';
import { Box, Button, PopperPlacementType } from '@mui/material';
import { Copy, Pencil, Share2 } from 'lucide-react';

import { ActionBox, ActionBoxItem } from '@ringpublishing/mui-components';

const actions: ActionBoxItem[] = [
    { label: 'Edit', onClick: () => null, icon: <Pencil /> },
    { label: 'Duplicate', onClick: () => null, icon: <Copy /> },
    { label: 'Share', onClick: () => null, icon: <Share2 /> },
];

// The `right-*` buttons sit on the left and the `left-*` buttons on the right, so every menu opens towards the middle
// and stays on screen.
const placements: PopperPlacementType[] = [
    'top-start',
    'top-end',
    'bottom-start',
    'bottom-end',
    'right-start',
    'right-end',
    'left-start',
    'left-end',
];

function PlacementButton({ placement }: { placement: PopperPlacementType }): React.JSX.Element {
    const ref = useRef<HTMLButtonElement | null>(null);

    return (
        <>
            <Button ref={ref} variant="outlined" color="primary" size="small">
                {placement}
            </Button>
            <ActionBox actions={actions} anchorEl={ref} placement={placement} />
        </>
    );
}

export default function PopperPlacementExample(): React.JSX.Element {
    return (
        <Box
            sx={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, max-content)',
                justifyContent: 'center',
                gap: 2,
                pt: 18,
                pb: 14,
            }}
        >
            {placements.map((placement) => (
                <PlacementButton key={placement} placement={placement} />
            ))}
        </Box>
    );
}
