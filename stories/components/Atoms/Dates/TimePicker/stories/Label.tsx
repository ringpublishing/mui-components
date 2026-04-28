import React from 'react';
import type { StoryObj } from '@storybook/react-vite';
import { createCodeStory } from '../../../../../helpers.js';
import LabelExampleCode from './code/LabelExample.tsx?raw';
import { TimePicker } from '../../../../../../src/index.js';
import defaultArgs from '../common/defaultArgs.js';

type Story = StoryObj<typeof TimePicker>;

const Example = (args: React.ComponentProps<typeof TimePicker>): React.JSX.Element => {
    return <TimePicker {...args} />;
};

export const Label: Story = {
    args: {
        ...defaultArgs,
        label: 'Time',
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
