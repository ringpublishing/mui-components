import React from 'react';
import type { StoryObj } from '@storybook/react-vite';
import { createCodeStory } from '../../../../helpers.js';
import PlaceholderExampleCode from './code/PlaceholderExample.tsx?raw';
import { MediaCard } from '../../../../../src/index.js';
import defaultArgs from '../common/defaultArgs.js';

type Story = StoryObj<typeof MediaCard>;

const Example = (args: React.ComponentProps<typeof MediaCard>): React.JSX.Element => {
    return <MediaCard {...args} />;
};

export const Placeholder: Story = {
    args: {
        ...defaultArgs,
        objectFit: 'contain',
    },
    render: (args, context) =>
        createCodeStory({
            context,
            customProps: {},
            customCode: PlaceholderExampleCode,
            example: <Example {...args} />,
        }),
};
