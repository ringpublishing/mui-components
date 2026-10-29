import React from 'react';
import type { StoryObj } from '@storybook/react-vite';
import { action } from 'storybook/actions';
import { Download, Pencil, Info, Printer, Globe, Upload } from 'lucide-react';
import { createCodeStory } from '../../../../helpers.js';
import DefaultExampleCode from './code/DefaultExample.tsx?raw';
import {
    CopyIconButton,
    Detail,
    DetailDescriptionItemFieldLayout,
    DetailDescriptionItemFieldType,
    EditableFieldType,
} from '../../../../../src/index.js';
import { getImagePath, ImageSize, TestImage } from '../../../../helpers/imagesData.js';
import { getCreatedTheme } from '../../../../../src/theme/index.js';

type Story = StoryObj<typeof Detail>;

const theme = getCreatedTheme('light');

const Example = (args: React.ComponentProps<typeof Detail>): React.JSX.Element => {
    return <Detail {...args} />;
};

export const Default: Story = {
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
            {
                name: 'Action without icon',
                onClick: action('onClick'),
            },
        ],
        descriptionItems: [
            {
                sectionTitle: 'Section one',
                fields: [
                    {
                        name: 'Description',
                        type: DetailDescriptionItemFieldType.DESCRIPTION,
                        maxLength: 100,
                        layout: DetailDescriptionItemFieldLayout.VERTICAL,
                        showMoreLabel: 'Show more',
                        showLessLabel: 'Show less',
                        value:
                            'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore' +
                            ' magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.',
                    },
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
                    {
                        formatDate: false,
                        name: 'Date not formatted',
                        value: '2023-08-31T21:59:59Z',
                    },
                    {
                        name: 'Icons',
                        value: '',
                        icon: [<Globe key={'0'} />, <Globe key={'1'} />],
                    },
                    {
                        name: 'Editable',
                        value: 'Editable value',
                        type: DetailDescriptionItemFieldType.EDITABLE,
                        onSubmit: function cb(): Promise<boolean> {
                            return new Promise((resolve) => {
                                resolve(true);
                            });
                        },
                    },
                    {
                        name: 'Editable select',
                        value: 'option2',
                        type: DetailDescriptionItemFieldType.EDITABLE,
                        fieldType: EditableFieldType.SELECT,
                        options: [
                            { value: 'option1', label: 'First Option' },
                            { value: 'option2', label: 'Second Option' },
                            { value: 'option3', label: 'Third Option' },
                        ],
                        onSubmit: function cb(value: string): Promise<boolean> {
                            action('select changed to')(value);

                            return new Promise((resolve) => {
                                resolve(true);
                            });
                        },
                    },
                ],
            },
            {
                fields: [
                    {
                        name: 'List of strings',
                        value: ['string 1', 'string 2'],
                    },
                    {
                        name: 'Single string',
                        value: 'string value',
                    },
                    {
                        name: 'No value',
                        value: '',
                    },
                    {
                        name: 'With link',
                        value: '#Learn_more',
                        url: 'https://design.ringpublishing.com/',
                    },
                    {
                        name: 'Number',
                        value: '10',
                    },
                    {
                        name: 'Single chip',
                        type: DetailDescriptionItemFieldType.CHIPS,
                        value: 'chip value',
                    },
                    {
                        name: 'List of chips',
                        type: DetailDescriptionItemFieldType.CHIPS,
                        value: ['chip 1', 'chip 2', 'chip 3'],
                        collapsable: true,
                    },
                    {
                        layout: DetailDescriptionItemFieldLayout.VERTICAL,
                        name: 'List of customised chips',
                        type: DetailDescriptionItemFieldType.CHIPS,
                        value: [
                            {
                                onClick: action('on click'),
                                value: 'chip with onClick',
                            },
                            {
                                badgeColor: theme.palette.primary.main,
                                value: 'chip with color',
                            },
                        ],
                    },
                ],
                sectionTitle: 'Section two',
            },
            {
                fields: [
                    {
                        name: 'With subvalue',
                        subValue: {
                            label: '',
                            value: 'John Doe',
                        },
                        value: '2023-07-27T09:32:08Z',
                    },
                    {
                        layout: DetailDescriptionItemFieldLayout.VERTICAL,
                        name: 'Identifier (UUID)',
                        value: '1234-5432-2334-1234-5432-2334',
                        icon: (
                            <CopyIconButton
                                size="small"
                                value="1234-5432-2334-1234-5432-2334"
                                onCopied={action('onCopied')}
                            />
                        ),
                    },
                ],
                sectionTitle: 'Section three',
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
                        onClick: action('on click'),
                        tooltip: 'Edit',
                    },
                    {
                        type: 'icon',
                        icon: <Printer />,
                        onClick: action('on click'),
                        tooltip: 'Print',
                    },
                    {
                        type: 'icon',
                        icon: <Upload />,
                        onClick: action('on click'),
                        tooltip: 'Upload',
                    },
                ],
                imageFullScreenPreview: true,
                image: {
                    src: getImagePath(TestImage.CAR, ImageSize.LARGE),
                    title: 'The rear of an orange vintage car parked under a wooden carport',
                },
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
    },
    render: (args, context) => {
        return createCodeStory({
            context,
            customProps: {},
            customCode: DefaultExampleCode,
            example: <Example {...args} />,
        });
    },
};
