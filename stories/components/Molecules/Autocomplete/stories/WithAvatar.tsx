import type { StoryObj } from '@storybook/react-vite';
import { createCodeStory } from '../../../../helpers.js';
import WithAvatarExampleCode from './code/WithAvatarExample.tsx?raw';
import { Autocomplete, AutocompleteProps } from '../../../../../src/index.js';
import defaultArgs, { optionsWithAvatar } from '../common/defaultArgs.js';

type Story = StoryObj<typeof Autocomplete>;

export const WithAvatar: Story = {
    args: {
        ...defaultArgs,
        options: optionsWithAvatar,
        defaultValue: optionsWithAvatar[0],
    },
    render: (args, context) =>
        createCodeStory({
            context,
            customProps: args,
            customCode: WithAvatarExampleCode,
            example: <Autocomplete {...(args as AutocompleteProps)} />,
        }),
};
