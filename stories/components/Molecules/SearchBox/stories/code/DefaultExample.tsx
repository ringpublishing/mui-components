import React from 'react';
import { SearchBox } from '@ringpublishing/mui-components';

export default function DefaultExample(): React.JSX.Element {
    return (
        <SearchBox
            defaultValue=""
            searchFunc={() => null}
            debounceTime={500}
            withClearButton={true}
            labels={{
                placeholder: 'Search',
                clear: 'Clear',
            }}
            className="custom-class-name"
        />
    );
}
