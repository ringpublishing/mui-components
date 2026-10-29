import React from 'react';
import type { StoryObj } from '@storybook/react-vite';
import { action } from 'storybook/actions';
import { Box } from '@mui/material';
import { Download, Pencil, Info, Printer, Globe, Upload } from 'lucide-react';
import { createCodeStory } from '../../../../helpers.js';
import WithCustomSlotsExampleCode from './code/WithCustomSlotsExample.tsx?raw';
import { Detail, DetailDescriptionItemFieldType } from '../../../../../src/index.js';
import { getImagePath, ImageSize, TestImage } from '../../../../helpers/imagesData.js';

type Story = StoryObj<typeof Detail>;

const Example = (args: React.ComponentProps<typeof Detail>): React.JSX.Element => {
    return <Detail {...args} />;
};

export const WithCustomSlots: Story = {
    args: {
        bottomActions: [
            {
                name: 'Action with URL',
                url: 'https://video.onet.pl/',
                icon: <Globe />,
            },
            {
                name: 'Action with on click',
                onClick: action('onClick'),
                icon: <Download />,
            },
        ],
        descriptionItems: [
            {
                sectionTitle: 'Section one',
                fields: [
                    {
                        icon: <Globe />,
                        name: 'With icon',
                        value: 'Published',
                    },
                    {
                        formatDate: true,
                        name: 'Date formatted',
                        value: '2023-07-27T09:32:09Z',
                    },
                ],
            },
            {
                fields: [
                    {
                        name: 'List of chips',
                        type: DetailDescriptionItemFieldType.CHIPS,
                        value: ['chip 1', 'chip 2', 'chip 3'],
                    },
                    {
                        name: 'List of strings',
                        value: ['string 1', 'string 2'],
                    },
                ],
                sectionTitle: 'Section two',
            },
        ],
        main: {
            mediaProps: {
                bottomIcons: [
                    {
                        type: 'icon',
                        icon: <Info />,
                        onClick: action('onClick'),
                        tooltip: 'Info',
                    },
                    {
                        type: 'icon',
                        icon: <Pencil />,
                        onClick: action('onClick'),
                        tooltip: 'Edit',
                    },
                    {
                        type: 'icon',
                        icon: <Printer />,
                        onClick: action('onClick'),
                        tooltip: 'Print',
                    },
                    {
                        type: 'icon',
                        icon: <Upload />,
                        onClick: action('onClick'),
                        tooltip: 'Upload',
                    },
                ],
                imageFullScreenPreview: true,
                image: getImagePath(TestImage.BEACH, ImageSize.LARGE),
                objectFit: 'cover',
                ratio: '4/3',
            },
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
            onCloseClick: action('onCloseClick'),
        },
        slots: {
            afterMain: <Box sx={{ bgcolor: 'action.hover', py: 1, textAlign: 'center' }}>Custom slot after main</Box>,
            afterDescriptionItems: (
                <Box sx={{ bgcolor: 'action.hover', py: 1, textAlign: 'center' }}>
                    Custom slot after description items
                </Box>
            ),
            afterBottomActions: (
                <Box sx={{ bgcolor: 'action.hover', py: 1, textAlign: 'center' }}>Custom slot after bottom actions</Box>
            ),
        },
    },
    render: (args, context) => {
        return createCodeStory({
            context,
            customProps: {},
            customCode: WithCustomSlotsExampleCode,
            example: <Example {...args} />,
        });
    },
};
