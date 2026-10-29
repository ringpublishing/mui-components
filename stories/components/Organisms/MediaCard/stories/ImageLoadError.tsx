import React from 'react';
import type { StoryObj } from '@storybook/react-vite';
import { createCodeStory } from '../../../../helpers.js';
import ImageLoadErrorExampleCode from './code/ImageLoadErrorExample.tsx?raw';
import { MediaCard } from '../../../../../src/index.js';
import defaultArgs from '../common/defaultArgs.js';

type Story = StoryObj<typeof MediaCard>;

const Example = (args: React.ComponentProps<typeof MediaCard>): React.JSX.Element => {
    return <MediaCard {...args} />;
};

export const ImageLoadError: Story = {
    args: {
        ...defaultArgs,
        image: 'https://example.invalid/missing-photo.jpg',
        fields: [{ value: 'Source / Author' }],
    },
    render: (args, context) =>
        createCodeStory({
            context,
            customProps: {},
            customCode: ImageLoadErrorExampleCode,
            example: <Example {...args} />,
        }),
};
