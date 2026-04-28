import React from 'react';
import { TextField } from '@mui/material';
import { Accordion } from '@ringpublishing/mui-components';

export default function DefaultExample(): React.JSX.Element {
    return (
        <Accordion label="Accordion">
            <TextField required={true} id="outlined-required" label="Required" defaultValue="Hello World" />
        </Accordion>
    );
}
