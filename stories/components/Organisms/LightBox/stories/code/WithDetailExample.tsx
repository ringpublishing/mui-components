import React from 'react';
import { Button } from '@mui/material';
import { Download, Public, Web } from '@mui/icons-material';
import {
    DetailDescriptionItemFieldLayout,
    DetailDescriptionItemFieldType,
    LightBox,
    LightBoxProps,
} from '@ringpublishing/mui-components';
import { getImagePath, TestImage, ImageSize } from 'RingDemoImages';

export default function WithDetailExample(): React.JSX.Element {
    const [open, setOpen] = React.useState(false);
    const images = [
        {
            src: getImagePath(TestImage.MOUNTAINS, ImageSize.LARGE),
            thumbnailSrc: getImagePath(TestImage.MOUNTAINS, ImageSize.LARGE),
            title: TestImage.MOUNTAINS,
        },
        {
            src: getImagePath(TestImage.STAIRS, ImageSize.LARGE),
            thumbnailSrc: getImagePath(TestImage.STAIRS, ImageSize.LARGE),
            title: TestImage.STAIRS,
        },
        {
            src: getImagePath(TestImage.ISLAND, ImageSize.SMALL),
            thumbnailSrc: getImagePath(TestImage.ISLAND, ImageSize.SMALL),
            title: TestImage.ISLAND,
        },
        {
            src: getImagePath(TestImage.RIVER, ImageSize.LARGE),
            thumbnailSrc: getImagePath(TestImage.RIVER, ImageSize.LARGE),
            title: TestImage.RIVER,
        },
    ];

    const detail = {
        bottomActions: [
            {
                name: 'ACTION WITH URL',
                url: 'https://video.onet.pl/',
                icon: <Web />,
            },
            {
                name: 'ACTION WITH ON CLICK',
                onClick: () => console.log('Action clicked'),
                icon: <Download />,
            },
            {
                name: 'ACTION WITHOUT ICON',
                onClick: () => console.log('Action clicked'),
            },
        ],
        descriptionItems: [
            {
                sectionTitle: 'IMAGE DETAILS',
                fields: [
                    {
                        name: 'DESCRIPTION',
                        type: DetailDescriptionItemFieldType.DESCRIPTION,
                        maxLength: 100,
                        layout: DetailDescriptionItemFieldLayout.VERTICAL,
                        showMoreLabel: 'Show more',
                        showLessLabel: 'Show less',
                        value:
                            'Lorem ipsum dolor sit amet, consectetur adipiscing elit.' +
                            ' Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
                    },
                    {
                        icon: <Public />,
                        name: 'STATUS',
                        value: 'Published',
                    },
                    {
                        formatDate: true,
                        name: 'CREATED',
                        value: '2023-07-27T09:32:09Z',
                    },
                    {
                        formatDate: true,
                        name: 'MODIFIED',
                        value: '2023-08-31T21:59:59Z',
                    },
                ],
            },
            {
                fields: [
                    {
                        name: 'TAGS',
                        type: DetailDescriptionItemFieldType.CHIPS,
                        value: ['photography', 'landscape', 'nature'],
                        collapsable: true,
                    },
                    {
                        name: 'PHOTOGRAPHER',
                        value: 'John Doe',
                    },
                    {
                        name: 'LOCATION',
                        value: 'New York, USA',
                    },
                ],
                sectionTitle: 'METADATA',
            },
        ],
        main: {
            title: {
                value: 'Test title lorem ipsum',
                editable: true,
                onSubmit: function cb(): Promise<boolean> {
                    return new Promise((resolve) => {
                        resolve(true);
                    });
                },
                label: 'Title',
            },
        },
    };

    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <Button variant="outlined" color="primary" disableRipple={true} onClick={(): void => setOpen(true)}>
                Click me!
            </Button>
            <LightBox
                images={images}
                onClose={(): void => setOpen(false)}
                open={open}
                detail={detail as LightBoxProps['detail']}
                onImageChange={(image) => {
                    console.log('Image changed:', image);
                }}
            />
        </div>
    );
}
