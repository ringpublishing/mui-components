import React from 'react';
import { Pencil, Trash2 } from 'lucide-react';
import { Media } from '@ringpublishing/mui-components';
import { getImagePath, TestImage, ImageSize } from 'RingDemoImages';

export default function ActionsMenuExample(): React.JSX.Element {
    const image = {
        src: getImagePath(TestImage.BEACH, ImageSize.LARGE),
        thumbnailSrc: getImagePath(TestImage.BEACH, ImageSize.SMALL),
        title: 'A person walking a dog on a rocky beach below white cliffs',
    };
    const actions = [
        { label: 'Edit', icon: <Pencil />, onClick: (): void => undefined },
        {
            label: 'Delete',
            icon: <Trash2 />,
            disabled: true,
            disabledReason: 'You cannot delete an image used in a published article',
            onClick: (): void => undefined,
        },
    ];

    return (
        <Media
            sx={{ width: 400 }}
            image={image}
            type="Photo"
            title="A quiet beach in the early morning"
            description="Author / Source"
            ratio="3/2"
            actions={actions}
        />
    );
}
