import React from 'react';
import { Button } from '@mui/material';
import { Tooltip } from '@ringpublishing/mui-components';

export default function WithCustomTitleExample(): React.JSX.Element {
    return (
        <Tooltip
            title={
                <span>
                    Custom <strong>rich</strong> title
                </span>
            }
            arrow={true}
        >
            <Button variant={'outlined'}>Hover me</Button>
        </Tooltip>
    );
}
