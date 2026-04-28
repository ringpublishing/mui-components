import React from 'react';
import type { StoryObj } from '@storybook/react-vite';
import { action } from 'storybook/actions';
import { SplitButton } from '../../../../../src/index.js';
import { createCodeStory } from '../../../../helpers.js';
import defaultArgs from '../common/defaultArgs.js';
import WithOneActionExampleCode from './code/WithOneActionExample.tsx?raw';

type Story = StoryObj<typeof SplitButton>;

const Example = (args: React.ComponentProps<typeof SplitButton>): React.JSX.Element => {
    return (
        <SplitButton
            {...args}
            actions={[
                {
                    label: 'Main Action',
                    onClick: action('onClick'),
                    disabled: false,
                },
            ]}
        />
    );
};

export const WithOneAction: Story = {
    args: {
        ...defaultArgs,
    },
    render: (args, context) =>
        createCodeStory({
            context,
            example: <Example {...args} />,
            customProps: {},
            customCode: WithOneActionExampleCode,
        }),
};
