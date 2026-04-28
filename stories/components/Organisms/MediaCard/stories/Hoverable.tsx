import React from 'react';
import type { StoryObj } from '@storybook/react-vite';
import { action } from 'storybook/actions';
import { Download, Link } from '@mui/icons-material';
import { createCodeStory } from '../../../../helpers.js';
import HoverableExampleCode from './code/HoverableExample.tsx?raw';
import { MediaCard } from '../../../../../src/index.js';
import defaultArgs from '../common/defaultArgs.js';
import { getImagePath, ImageSize, TestImage } from '../../../../../src/helpers/stories/imagesData.js';

type Story = StoryObj<typeof MediaCard>;

const Example = (args: React.ComponentProps<typeof MediaCard>): React.JSX.Element => {
    return <MediaCard {...args} />;
};

export const Hoverable: Story = {
    args: {
        ...defaultArgs,
        hoverable: true,
        active: true,
        onClick: action('onClick: MediaCard clicked'),
        actions: [
            {
                label: 'Action 1',
                onClick: action('onClick: Action 1'),
                icon: <Download />,
            },
            {
                label: 'Action 2',
                onClick: action('onClick: Action 2'),
                icon: <Link />,
            },
        ],
        image: getImagePath(TestImage.ISLAND, ImageSize.MEDIUM),
        fields: [
            { value: 'Source / Author' },
            { value: 'Brief description or summary of the content' },
            { value: 'Space for comments or additional information that may take up more space' },
        ],
    },
    render: (args, context) =>
        createCodeStory({
            context,
            customProps: {},
            customCode: HoverableExampleCode,
            example: <Example {...args} />,
        }),
};
