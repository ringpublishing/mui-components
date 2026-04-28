import React, { useState } from 'react';
import { EditableText } from '@ringpublishing/mui-components';

export default function WithLabelExample(): React.JSX.Element {
    const [text, setText] = useState('Editable text value');

    const handleSubmit = (value: string): Promise<boolean> => {
        setText(value);

        return Promise.resolve(true);
    };

    return <EditableText text={text} label="Article title" onSubmit={handleSubmit} />;
}
