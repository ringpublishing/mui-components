import React from 'react';
import { Media } from '@ringpublishing/mui-components';

export default function ImageLoadErrorExample(): React.JSX.Element {
    return (
        <Media
            sx={{ width: 400 }}
            image="https://example.invalid/missing-photo.jpg"
            type="Photo"
            title="An image that failed to load"
            description="Author / Source"
            ratio="3/2"
        />
    );
}
