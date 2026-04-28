import React from 'react';
import type { StoryObj } from '@storybook/react-vite';
import { action } from 'storybook/actions';
import { Download, Link } from '@mui/icons-material';
import { createCodeStory } from '../../../../helpers.js';
import ActionsExampleCode from './code/ActionsExample.tsx?raw';
import { MediaCard } from '../../../../../src/index.js';
import defaultArgs from '../common/defaultArgs.js';
import { getImagePath, ImageSize, TestImage } from '../../../../../src/helpers/stories/imagesData.js';

type Story = StoryObj<typeof MediaCard>;

const Example = (args: React.ComponentProps<typeof MediaCard>): React.JSX.Element => {
    return <MediaCard {...args} />;
};

export const Actions: Story = {
    args: {
        ...defaultArgs,
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
    },
    render: (args, context) =>
        createCodeStory({
            context,
            customProps: {},
            customCode: ActionsExampleCode,
            example: <Example {...args} />,
        }),
};
