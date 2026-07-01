import React from 'react';
import type { StoryObj } from '@storybook/react-vite';
import { createCodeStory } from '../../../../helpers.js';
import DefaultExampleCode from './code/DefaultExample.tsx?raw';
import { Tooltip } from '../../../../../src/index.js';
import defaultArgs from '../common/defaultArgs.js';

type Story = StoryObj<typeof Tooltip>;

const Example = (args: React.ComponentProps<typeof Tooltip>): React.JSX.Element => {
    return <Tooltip {...args} />;
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
