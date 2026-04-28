import React from 'react';
import type { StoryObj } from '@storybook/react-vite';
import { createCodeStory } from '../../../../../helpers.js';
import CustomStylesExampleCode from './code/CustomStylesExample.tsx?raw';
import { TimePicker } from '../../../../../../src/index.js';
import defaultArgs from '../common/defaultArgs.js';

type Story = StoryObj<typeof TimePicker>;

const Example = (args: React.ComponentProps<typeof TimePicker>): React.JSX.Element => {
    return <TimePicker {...args} />;
};

export const CustomStyles: Story = {
    args: {
        ...defaultArgs,
        sx: {
            backgroundColor: 'lightgray',
            padding: '8px',
            borderRadius: '4px',
        },
    },
    render: (args, context) => {
        return createCodeStory({
            context,
            customProps: {},
            customCode: CustomStylesExampleCode,
            example: <Example {...args} />,
        });
    },
};
