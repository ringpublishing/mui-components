import React from 'react';
import type { StoryObj } from '@storybook/react-vite';
import { action } from 'storybook/actions';
import { createCodeStory } from '../../../../../helpers.js';
import ActionsExampleCode from './code/ActionsExample.tsx?raw';
import { DatePicker } from '../../../../../../src/index.js';
import defaultArgs from '../common/defaultArgs.js';

type Story = StoryObj<typeof DatePicker>;

const Example = (args: React.ComponentProps<typeof DatePicker>): React.JSX.Element => {
    return <DatePicker {...args} />;
};

export const Actions: Story = {
    args: {
        ...defaultArgs,
        actions: [
            {
                label: 'Copy',
                onClick: action('Copy'),
            },
            {
                label: 'Share',
                onClick: action('Share'),
            },
        ],
    },
    render: (args, context) => {
        return createCodeStory({
            context,
            customProps: {},
            customCode: ActionsExampleCode,
            example: <Example {...args} />,
        });
    },
};
