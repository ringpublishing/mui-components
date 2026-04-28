import React from 'react';
import type { StoryObj } from '@storybook/react-vite';
import { createCodeStory } from '../../../../../helpers.js';
import LabelExampleCode from './code/LabelExample.tsx?raw';
import { DateTimePicker } from '../../../../../../src/index.js';
import defaultArgs from '../common/defaultArgs.js';

type Story = StoryObj<typeof DateTimePicker>;

const Example = (args: React.ComponentProps<typeof DateTimePicker>): React.JSX.Element => {
    return <DateTimePicker {...args} />;
};

export const Label: Story = {
    args: {
        ...defaultArgs,
        label: 'Date and time',
    },
    render: (args, context) => {
        return createCodeStory({
            context,
            customProps: {},
            customCode: LabelExampleCode,
            example: <Example {...args} />,
        });
    },
};
