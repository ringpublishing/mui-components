import React from 'react';
import { SearchBox } from '@ringpublishing/mui-components';

export default function ControlledExample(): React.JSX.Element {
    const [value, setValue] = React.useState('');

    return (
        <SearchBox
            value={value}
            onChange={setValue}
            withClearButton={true}
            labels={{
                placeholder: 'Search',
                clear: 'Clear',
            }}
            className="custom-class-name"
        />
    );
}
