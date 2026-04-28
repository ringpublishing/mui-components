import React from 'react';
import { Stack } from '@mui/material';
import { Accordion } from '@ringpublishing/mui-components';

export default function BorderlessExample(): React.JSX.Element {
    return (
        <Stack direction={'column'}>
            <Accordion label="Accordion" variant="borderless">
                <div>Opened accordion</div>
            </Accordion>
            <Accordion label="Accordion" variant="borderless">
                <div>Opened accordion</div>
            </Accordion>
            <Accordion label="Accordion" variant="borderless">
                <div>Opened accordion</div>
            </Accordion>
        </Stack>
    );
}
