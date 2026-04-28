import React from 'react';
import { Accordion } from '@ringpublishing/mui-components';

export default function WithButtonExample(): React.JSX.Element {
    return (
        <Accordion label="Accordion" buttonLabel="Button" buttonOnClick={() => alert('Button clicked')}>
            <div>Opened accordion</div>
        </Accordion>
    );
}
