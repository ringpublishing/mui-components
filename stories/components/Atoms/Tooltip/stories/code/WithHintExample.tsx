import React from 'react';
import { Button } from '@mui/material';
import { Tooltip } from '@ringpublishing/mui-components';

export default function WithHintExample(): React.JSX.Element {
    return (
        <Tooltip title="Title" hint="⌘+K" arrow={true}>
            <Button variant={'outlined'}>Hover me</Button>
        </Tooltip>
    );
}
