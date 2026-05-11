import React from 'react';
import { Accordion } from '@ringpublishing/mui-components';

export default function WithBorderExample(): React.JSX.Element {
    return (
        <Accordion label="With Border" variant="outlined">
            <div>Opened accordion</div>
        </Accordion>
    );
}
