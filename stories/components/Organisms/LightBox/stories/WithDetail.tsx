import type { StoryObj } from '@storybook/react-vite';
import { Download, Public, Web } from '@mui/icons-material';
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
                    name: 'ACTION WITH URL',
                    url: 'https://video.onet.pl/',
                    icon: <Web />,
                },
                {
                    name: 'ACTION WITH ON CLICK',
                    onClick: action('onClick'),
                    icon: <Download />,
                },
                {
                    name: 'ACTION WITHOUT ICON',
                    onClick: action('onClick'),
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
                                ' Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam,' +
                                ' quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.',
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
