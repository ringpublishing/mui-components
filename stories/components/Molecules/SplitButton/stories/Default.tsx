import React from 'react';
import type { StoryObj } from '@storybook/react-vite';
import { action } from 'storybook/actions';
import { Ban, Rocket } from 'lucide-react';
import { SplitButton } from '../../../../../src/index.js';
import { createCodeStory } from '../../../../helpers.js';
import defaultArgs from '../common/defaultArgs.js';
import DefaultExampleCode from './code/DefaultExample.tsx?raw';

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
                {
                    label: 'Additional Action 1',
                    onClick: action('onClick'),
                    icon: <Rocket />,
                },
                {
                    label: 'Additional Action 2',
                    onClick: action('onClick'),
                    disabled: true,
                    disabledReason: 'Disabled because of some reason',
                    icon: <Ban />,
                },
            ]}
        />
    );
};

export const Default: Story = {
    args: {
        ...defaultArgs,
    },
    render: (args, context) =>
        createCodeStory({
            context,
            example: <Example {...args} />,
            customProps: {},
            customCode: DefaultExampleCode,
        }),
};
