import React from 'react';
import type { StoryObj } from '@storybook/react-vite';
import { createCodeStory } from '../../../../helpers.js';
import { ContentList } from '../../../../../src/index.js';
import DefaultExampleCode from './code/DefaultExample.tsx?raw';
import defaultArgs from '../common/defaultArgs.js';

type Story = StoryObj<typeof ContentList>;

const Example = (args: React.ComponentProps<typeof ContentList>): React.JSX.Element => {
    return <ContentList {...args} />;
};

export const Default: Story = {
    args: {
        ...defaultArgs,
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
