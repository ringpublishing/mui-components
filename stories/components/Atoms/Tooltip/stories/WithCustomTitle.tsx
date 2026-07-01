import React from 'react';
import type { StoryObj } from '@storybook/react-vite';
import { createCodeStory } from '../../../../helpers.js';
import WithCustomTitleExampleCode from './code/WithCustomTitleExample.tsx?raw';
import { Tooltip } from '../../../../../src/index.js';
import defaultArgs from '../common/defaultArgs.js';

type Story = StoryObj<typeof Tooltip>;

const Example = (args: React.ComponentProps<typeof Tooltip>): React.JSX.Element => {
    return <Tooltip {...args} />;
};

export const WithCustomTitle: Story = {
    args: {
        ...defaultArgs,
        title: (
            <span>
                Custom <strong>rich</strong> title
            </span>
        ),
    },
    render: (args, context) => {
        return createCodeStory({
            context,
            customProps: {},
            customCode: WithCustomTitleExampleCode,
            example: <Example {...args} />,
        });
    },
};
