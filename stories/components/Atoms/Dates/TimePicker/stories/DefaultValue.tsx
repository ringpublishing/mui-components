import React from 'react';
import type { StoryObj } from '@storybook/react-vite';
import dayjs from 'dayjs';
import { createCodeStory } from '../../../../../helpers.js';
import DefaultValueExampleCode from './code/DefaultValueExample.tsx?raw';
import { TimePicker } from '../../../../../../src/index.js';
import defaultArgs from '../common/defaultArgs.js';

type Story = StoryObj<typeof TimePicker>;

const Example = (args: React.ComponentProps<typeof TimePicker>): React.JSX.Element => {
    return <TimePicker {...args} />;
};

export const DefaultValue: Story = {
    args: {
        ...defaultArgs,
        defaultValue: dayjs(),
    },
    render: (args, context) => {
        return createCodeStory({
            context,
            customProps: {},
            customCode: DefaultValueExampleCode,
            example: <Example {...args} />,
        });
    },
};
