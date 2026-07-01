import React from 'react';
import { Button } from '@mui/material';
import { Tooltip } from '@ringpublishing/mui-components';

export default function DefaultExample(): React.JSX.Element {
    return (
        <Tooltip title="Title" arrow={true}>
            <Button variant={'outlined'}>Hover me</Button>
        </Tooltip>
    );
}
