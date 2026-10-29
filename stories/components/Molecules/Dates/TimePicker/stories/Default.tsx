import React from 'react';
import type { StoryObj } from '@storybook/react-vite';
import { createCodeStory } from '../../../../../helpers.js';
import DefaultExampleCode from './code/DefaultExample.tsx?raw';
import { TimePicker } from '../../../../../../src/index.js';
import defaultArgs from '../common/defaultArgs.js';

type Story = StoryObj<typeof TimePicker>;

const Example = (args: React.ComponentProps<typeof TimePicker>): React.JSX.Element => {
    return <TimePicker {...args} />;
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
