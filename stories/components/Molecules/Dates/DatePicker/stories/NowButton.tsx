import React from 'react';
import type { StoryObj } from '@storybook/react-vite';
import { createCodeStory } from '../../../../../helpers.js';
import NowButtonExampleCode from './code/NowButtonExample.tsx?raw';
import { DatePicker } from '../../../../../../src/index.js';
import defaultArgs from '../common/defaultArgs.js';

type Story = StoryObj<typeof DatePicker>;

const Example = (args: React.ComponentProps<typeof DatePicker>): React.JSX.Element => {
    return <DatePicker {...args} />;
};

export const NowButton: Story = {
    args: {
        ...defaultArgs,
        currentDateLabel: 'Now',
    },
    render: (args, context) => {
        return createCodeStory({
            context,
            customProps: {},
            customCode: NowButtonExampleCode,
            example: <Example {...args} />,
        });
    },
};
