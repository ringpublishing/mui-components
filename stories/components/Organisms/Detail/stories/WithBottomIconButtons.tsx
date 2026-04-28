import React from 'react';
import type { StoryObj } from '@storybook/react-vite';
import { action } from 'storybook/actions';
import { EditOutlined, InfoOutlined, PrintOutlined, UploadOutlined } from '@mui/icons-material';
import { createCodeStory } from '../../../../helpers.js';
import WithBottomIconButtonsExampleCode from './code/WithBottomIconButtonsExample.tsx?raw';
import { Detail } from '../../../../../src/index.js';
import { getImagePath, ImageSize, TestImage } from '../../../../../src/helpers/stories/imagesData.js';

type Story = StoryObj<typeof Detail>;

const Example = (args: React.ComponentProps<typeof Detail>): React.JSX.Element => {
    return <Detail {...args} />;
};

export const WithBottomIconButtons: Story = {
    args: {
        main: {
            mediaProps: {
                bottomIcons: [
                    {
                        icon: <InfoOutlined />,
                        onClick: action('Info clicked'),
                        tooltip: 'Information',
                    },
                    {
                        icon: <EditOutlined />,
                        onClick: action('Edit clicked'),
                        tooltip: 'Edit',
                    },
                    {
                        icon: <PrintOutlined />,
                        onClick: action('Print clicked'),
                        tooltip: 'Print',
                    },
                    {
                        type: 'icon',
                        icon: <UploadOutlined />,
                        onClick: action('Upload clicked'),
                        tooltip: 'Upload',
                    },
                ],
                imageFullScreenPreview: true,
                image: getImagePath(TestImage.APARTMENT, ImageSize.LARGE),
                objectFit: 'cover',
                ratio: '4/3',
            },
            title: 'Detail with Icon Buttons',
            onCloseClick: action('onCloseClick'),
        },
        descriptionItems: [
            {
                sectionTitle: 'INFORMATION',
                fields: [
                    {
                        name: 'Description',
                        value: 'This example showcases icon buttons at the bottom of the media section.',
                    },
                ],
            },
        ],
    },
    render: (args, context) => {
        return createCodeStory({
            context,
            customProps: {},
            customCode: WithBottomIconButtonsExampleCode,
            example: <Example {...args} />,
        });
    },
};
