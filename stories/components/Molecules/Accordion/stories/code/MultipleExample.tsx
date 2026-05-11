import React from 'react';
import { Stack } from '@mui/material';
import { Accordion } from '@ringpublishing/mui-components';

export default function MultipleExample(): React.JSX.Element {
    return (
        <Stack direction={'column'}>
            <Accordion label="Accordion">
                <div>Opened accordion</div>
            </Accordion>
            <Accordion label="Accordion">
                <div>Opened accordion</div>
            </Accordion>
            <Accordion label="Accordion">
                <div>Opened accordion</div>
            </Accordion>
        </Stack>
    );
}
