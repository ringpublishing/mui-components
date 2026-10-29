import React from 'react';
import { Stack, Typography } from '@mui/material';
import { Accordion } from '@ringpublishing/mui-components';

const rowLabel = (
    <>
        <Typography variant="body1" component="span">
            Accordion
        </Typography>
        <Typography variant="body1" component="span" color="text.secondary">
            Secondary
        </Typography>
    </>
);

export default function GroupExample(): React.JSX.Element {
    return (
        <Stack direction="column">
            <Accordion label={rowLabel} />
            <Accordion label={rowLabel} defaultExpanded={true}>
                <div>Opened accordion content</div>
            </Accordion>
            <Accordion label={rowLabel} disabled={true} />
        </Stack>
    );
}
