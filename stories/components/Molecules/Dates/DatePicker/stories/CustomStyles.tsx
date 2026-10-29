import React from 'react';
import type { StoryObj } from '@storybook/react-vite';
import { createCodeStory } from '../../../../../helpers.js';
import CustomStylesExampleCode from './code/CustomStylesExample.tsx?raw';
import { DatePicker } from '../../../../../../src/index.js';
import defaultArgs from '../common/defaultArgs.js';

type Story = StoryObj<typeof DatePicker>;

const Example = (args: React.ComponentProps<typeof DatePicker>): React.JSX.Element => {
    return <DatePicker {...args} />;
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
