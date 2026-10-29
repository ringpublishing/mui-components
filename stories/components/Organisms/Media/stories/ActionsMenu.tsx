import React from 'react';
import type { StoryObj } from '@storybook/react-vite';
import { createCodeStory } from '../../../../helpers.js';
import ActionsMenuExampleCode from './code/ActionsMenuExample.tsx?raw';
import { Media } from '../../../../../src/index.js';
import defaultArgs from '../common/defaultArgs.js';
import { ACTIONS } from '../common/presets.js';

type Story = StoryObj<typeof Media>;

const Example = (args: React.ComponentProps<typeof Media>): React.JSX.Element => <Media {...args} />;

export const ActionsMenu: Story = {
    args: {
        ...defaultArgs,
        actions: ACTIONS.withDisabled.value,
    },
    render: (args, context) =>
        createCodeStory({
            context,
            customProps: {},
            customCode: ActionsMenuExampleCode,
            example: <Example {...args} />,
        }),
};
