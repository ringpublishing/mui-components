import React from 'react';
import type { StoryObj } from '@storybook/react-vite';
import { AlarmClock } from 'lucide-react';
import { ACTIONS } from '../common/presets.js';
import { createCodeStory } from '../../../../helpers.js';
import MaxHeightExampleCode from './code/MaxHeightExample.tsx?raw';
import { Media } from '../../../../../src/index.js';
import defaultArgs from '../common/defaultArgs.js';

type Story = StoryObj<typeof Media>;

const Example = (args: React.ComponentProps<typeof Media>): React.JSX.Element => <Media {...args} />;

export const MaxHeight: Story = {
    args: {
        ...defaultArgs,
        height: '200px',
        disableFullScreenPreview: true,
        statusLabels: [{ label: 'Main image', color: 'primary', icon: <AlarmClock /> }],
        actions: ACTIONS.two.value,
    },
    render: (args, context) => {
        return createCodeStory({
            context,
            customProps: {},
            customCode: MaxHeightExampleCode,
            example: <Example {...args} />,
        });
    },
};
