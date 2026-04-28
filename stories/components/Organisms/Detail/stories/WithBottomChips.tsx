import React from 'react';
import type { StoryObj } from '@storybook/react-vite';
import { action } from 'storybook/actions';
import { createCodeStory } from '../../../../helpers.js';
import WithBottomChipsExampleCode from './code/WithBottomChipsExample.tsx?raw';
import { Detail } from '../../../../../src/index.js';
import { getImagePath, ImageSize, TestImage } from '../../../../../src/helpers/stories/imagesData.js';

type Story = StoryObj<typeof Detail>;

const Example = (args: React.ComponentProps<typeof Detail>): React.JSX.Element => {
    return <Detail {...args} />;
};

export const WithBottomChips: Story = {
    args: {
        main: {
            mediaProps: {
                bottomIcons: [
                    {
                        type: 'chip',
                        chip: {
                            label: 'Category',
                            variant: 'filled',
                            size: 'small',
                        },
                    },
                    {
                        type: 'chip',
                        chip: {
                            label: 'Status: Active',
                            variant: 'filled',
                            size: 'small',
                        },
                        color: '#4CAF50',
                    },
                    {
                        type: 'chip',
                        chip: {
                            label: 'Priority',
                            variant: 'filled',
                            size: 'small',
                        },
                        color: '#2196F3',
                    },
                    {
                        type: 'chip',
                        chip: {
                            label: 'Default',
                            variant: 'filled',
                            size: 'small',
                        },
                    },
                    {
                        type: 'chip',
                        chip: {
                            label: 'Warning',
                            variant: 'filled',
                            size: 'small',
                        },
                        color: '#FFC107',
                    },
                ],
                imageFullScreenPreview: true,
                image: getImagePath(TestImage.STAIRS, ImageSize.LARGE),
                objectFit: 'cover',
                ratio: '4/3',
            },
            title: 'Detail with Chips',
            onCloseClick: action('onCloseClick'),
        },
        descriptionItems: [
            {
                sectionTitle: 'INFORMATION',
                fields: [
                    {
                        name: 'Description',
                        value: 'This example showcases chips at the bottom of the media section with custom colors.',
                    },
                ],
            },
        ],
    },
    render: (args, context) => {
        return createCodeStory({
            context,
            customProps: {},
            customCode: WithBottomChipsExampleCode,
            example: <Example {...args} />,
        });
    },
};
