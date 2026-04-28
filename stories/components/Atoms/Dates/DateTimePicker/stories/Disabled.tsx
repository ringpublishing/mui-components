import React from 'react';
import type { StoryObj } from '@storybook/react-vite';
import { createCodeStory } from '../../../../../helpers.js';
import DisabledExampleCode from './code/DisabledExample.tsx?raw';
import { DateTimePicker } from '../../../../../../src/index.js';
import defaultArgs from '../common/defaultArgs.js';

type Story = StoryObj<typeof DateTimePicker>;

const Example = (args: React.ComponentProps<typeof DateTimePicker>): React.JSX.Element => {
    return <DateTimePicker {...args} />;
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
