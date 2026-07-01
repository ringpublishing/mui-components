import React from 'react';
import type { StoryObj } from '@storybook/react-vite';
import { createCodeStory } from '../../../../helpers.js';
import WithSubtitleExampleCode from './code/WithSubtitleExample.tsx?raw';
import { Tooltip } from '../../../../../src/index.js';
import defaultArgs from '../common/defaultArgs.js';

type Story = StoryObj<typeof Tooltip>;

const Example = (args: React.ComponentProps<typeof Tooltip>): React.JSX.Element => {
    return <Tooltip {...args} />;
};

export const WithSubtitle: Story = {
    args: {
        ...defaultArgs,
        subTitle: 'Tooltip Subtitle',
    },
    render: (args, context) => {
        return createCodeStory({
            context,
            customProps: {},
            customCode: WithSubtitleExampleCode,
            example: <Example {...args} />,
        });
    },
};
