import React from 'react';
import type { StoryObj } from '@storybook/react-vite';
import { createCodeStory } from '../../../../../helpers.js';
import LabelExampleCode from './code/LabelExample.tsx?raw';
import { DatePicker } from '../../../../../../src/index.js';
import defaultArgs from '../common/defaultArgs.js';

type Story = StoryObj<typeof DatePicker>;

const Example = (args: React.ComponentProps<typeof DatePicker>): React.JSX.Element => {
    return <DatePicker {...args} />;
};

export const Label: Story = {
    args: {
        ...defaultArgs,
        label: 'Date',
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
