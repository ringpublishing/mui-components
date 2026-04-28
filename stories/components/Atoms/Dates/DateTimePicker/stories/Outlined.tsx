import React from 'react';
import type { StoryObj } from '@storybook/react-vite';
import { createCodeStory } from '../../../../../helpers.js';
import OutlinedExampleCode from './code/OutlinedExample.tsx?raw';
import { DateTimePicker } from '../../../../../../src/index.js';
import defaultArgs from '../common/defaultArgs.js';

type Story = StoryObj<typeof DateTimePicker>;

const Example = (args: React.ComponentProps<typeof DateTimePicker>): React.JSX.Element => {
    return <DateTimePicker {...args} />;
};

export const Outlined: Story = {
    args: {
        ...defaultArgs,
        label: 'Date & Time',
        slotProps: {
            textField: {
                variant: 'outlined',
            },
        },
    },
    render: (args, context) => {
        return createCodeStory({
            context,
            customProps: {},
            customCode: OutlinedExampleCode,
            example: <Example {...args} />,
        });
    },
};
