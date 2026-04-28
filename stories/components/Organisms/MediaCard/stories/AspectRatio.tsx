import React from 'react';
import type { StoryObj } from '@storybook/react-vite';
import { createCodeStory } from '../../../../helpers.js';
import AspectRatioExampleCode from './code/AspectRatioExample.tsx?raw';
import { MediaCard } from '../../../../../src/index.js';
import defaultArgs from '../common/defaultArgs.js';
import { getImagePath, ImageSize, TestImage } from '../../../../../src/helpers/stories/imagesData.js';

type Story = StoryObj<typeof MediaCard>;

const Example = (args: React.ComponentProps<typeof MediaCard>): React.JSX.Element => {
    return <MediaCard {...args} />;
};

export const AspectRatio: Story = {
    args: {
        ...defaultArgs,
        ratio: '4/3',
        objectFit: 'contain',
        image: getImagePath(TestImage.STREET_3, ImageSize.MEDIUM),
    },
    render: (args, context) =>
        createCodeStory({
            context,
            customProps: {},
            customCode: AspectRatioExampleCode,
            example: <Example {...args} />,
        }),
};
