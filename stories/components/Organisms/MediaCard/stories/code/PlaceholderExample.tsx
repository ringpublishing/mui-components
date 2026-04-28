import React from 'react';
import { MediaCard } from '@ringpublishing/mui-components';

export default function PlaceholderExample(): React.JSX.Element {
    const fields = [{ value: 'Source / Author' }];

    return <MediaCard sx={{ width: '300px' }} title="Title / name" fields={fields} />;
}
