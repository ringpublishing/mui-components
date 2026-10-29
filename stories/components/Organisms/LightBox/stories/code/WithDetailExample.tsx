import React from 'react';
import { Button } from '@mui/material';
import { Download, Globe } from 'lucide-react';
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
                name: 'Action with URL',
                url: 'https://video.onet.pl/',
                icon: <Globe />,
            },
            {
                name: 'Action with on click',
                onClick: () => console.log('Action clicked'),
                icon: <Download />,
            },
            {
                name: 'Action without icon',
                onClick: () => console.log('Action clicked'),
            },
        ],
        descriptionItems: [
            {
                sectionTitle: 'Image details',
                fields: [
                    {
                        name: 'Description',
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
                        icon: <Globe />,
                        name: 'Status',
                        value: 'Published',
                    },
                    {
                        formatDate: true,
                        name: 'Created',
                        value: '2023-07-27T09:32:09Z',
                    },
                    {
                        formatDate: true,
                        name: 'Modified',
                        value: '2023-08-31T21:59:59Z',
                    },
                ],
            },
            {
                fields: [
                    {
                        name: 'Tags',
                        type: DetailDescriptionItemFieldType.CHIPS,
                        value: ['photography', 'landscape', 'nature'],
                        collapsable: true,
                    },
                    {
                        name: 'Photographer',
                        value: 'John Doe',
                    },
                    {
                        name: 'Location',
                        value: 'New York, USA',
                    },
                ],
                sectionTitle: 'Metadata',
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
                onImageChange={(image): void => {
                    console.log('Image changed:', image);
                }}
            />
        </div>
    );
}
