import React from 'react';
import { SearchBox } from '@ringpublishing/mui-components';

export default function WithLongValueExample(): React.JSX.Element {
    return (
        <SearchBox
            defaultValue="a search query long enough to run past the clear button of the field"
            searchFunc={(query: string): void => console.info('Search', query)}
            withClearButton={true}
            labels={{
                placeholder: 'Search',
                clear: 'Clear',
            }}
            sx={{ width: 320 }}
        />
    );
}
