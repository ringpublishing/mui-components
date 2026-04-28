import React from 'react';
import { Accordion } from '@ringpublishing/mui-components';

export default function WithLabelExample(): React.JSX.Element {
    return (
        <Accordion label="Accordion">
            <div>Opened accordion</div>
        </Accordion>
    );
}
