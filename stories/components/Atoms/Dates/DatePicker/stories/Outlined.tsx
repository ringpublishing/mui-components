import React from 'react';
import type { StoryObj } from '@storybook/react-vite';
import { createCodeStory } from '../../../../../helpers.js';
import OutlinedExampleCode from './code/OutlinedExample.tsx?raw';
import { DatePicker } from '../../../../../../src/index.js';
import defaultArgs from '../common/defaultArgs.js';

type Story = StoryObj<typeof DatePicker>;

const Example = (args: React.ComponentProps<typeof DatePicker>): React.JSX.Element => {
    return <DatePicker {...args} />;
};

export const Outlined: Story = {
    args: {
        ...defaultArgs,
        label: 'Date',
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
