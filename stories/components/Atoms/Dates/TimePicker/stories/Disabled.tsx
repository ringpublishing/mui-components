import React from 'react';
import type { StoryObj } from '@storybook/react-vite';
import { createCodeStory } from '../../../../../helpers.js';
import DisabledExampleCode from './code/DisabledExample.tsx?raw';
import { TimePicker } from '../../../../../../src/index.js';
import defaultArgs from '../common/defaultArgs.js';

type Story = StoryObj<typeof TimePicker>;

const Example = (args: React.ComponentProps<typeof TimePicker>): React.JSX.Element => {
    return <TimePicker {...args} />;
};

export const Disabled: Story = {
    args: {
        ...defaultArgs,
        disabled: true,
    },
    render: (args, context) => {
        return createCodeStory({
            context,
            customProps: {},
            customCode: DisabledExampleCode,
            example: <Example {...args} />,
        });
    },
};
