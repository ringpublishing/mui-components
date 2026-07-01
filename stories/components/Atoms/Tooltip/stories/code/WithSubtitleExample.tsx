import React from 'react';
import { Button } from '@mui/material';
import { Tooltip } from '@ringpublishing/mui-components';

export default function WithSubtitleExample(): React.JSX.Element {
    return (
        <Tooltip title="Title" subTitle="Tooltip Subtitle" arrow={true}>
            <Button variant={'outlined'}>Hover me</Button>
        </Tooltip>
    );
}
