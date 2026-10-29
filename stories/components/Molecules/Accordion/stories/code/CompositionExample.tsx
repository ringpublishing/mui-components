import React from 'react';
import { Typography } from '@mui/material';
import { Accordion } from '@ringpublishing/mui-components';

export default function CompositionExample(): React.JSX.Element {
    return (
        <Accordion
            label={
                <>
                    <Typography variant="body1" component="span">
                        Accordion
                    </Typography>
                    <Typography variant="body1" component="span" color="text.secondary">
                        Secondary
                    </Typography>
                </>
            }
        >
            <div>Opened accordion</div>
        </Accordion>
    );
}
