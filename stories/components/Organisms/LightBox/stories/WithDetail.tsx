import type { StoryObj } from '@storybook/react-vite';
import { Download, Globe } from 'lucide-react';
import { action } from 'storybook/actions';
import { createCodeStory } from '../../../../helpers.js';
import WithDetailExampleCode from './code/WithDetailExample.tsx?raw';
import {
    DetailDescriptionItemFieldLayout,
    DetailDescriptionItemFieldType,
    LightBox,
    LightBoxProps,
} from '../../../../../src/index.js';
import { LightBoxWrapper } from './Default.js';

type Story = StoryObj<typeof LightBox>;

export const WithDetail: Story = {
    args: {
        onImageChange: action('onImageChange'),
        detail: {
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
                {
                    name: 'Action without icon',
                    onClick: action('onClick'),
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
                                ' Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam,' +
                                ' quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.',
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
        },
    },
    render: (args, context) =>
        createCodeStory({
            context,
            customProps: args,
            example: <LightBoxWrapper {...(args as LightBoxProps)} />,
            customCode: WithDetailExampleCode,
        }),
};
