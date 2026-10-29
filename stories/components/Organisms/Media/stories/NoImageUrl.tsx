import React from 'react';
import type { StoryObj } from '@storybook/react-vite';
import { AlarmClock } from 'lucide-react';
import { createCodeStory } from '../../../../helpers.js';
import NoImageUrlExampleCode from './code/NoImageUrlExample.tsx?raw';
import { Media } from '../../../../../src/index.js';
import defaultArgs from '../common/defaultArgs.js';

type Story = StoryObj<typeof Media>;

const Example = (args: React.ComponentProps<typeof Media>): React.JSX.Element => <Media {...args} />;

export const NoImageUrl: Story = {
    args: {
        ...defaultArgs,
        image: undefined,
        statusLabels: [{ label: 'Label 1', color: 'primary', icon: <AlarmClock /> }],
    },
    render: (args, context) => {
        return createCodeStory({
            context,
            customProps: {},
            customCode: NoImageUrlExampleCode,
            example: <Example {...args} />,
        });
    },
};
