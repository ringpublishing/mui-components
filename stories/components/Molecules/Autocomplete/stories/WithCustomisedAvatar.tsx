import type { StoryObj } from '@storybook/react-vite';
import { createCodeStory } from '../../../../helpers.js';
import WithCustomisedAvatarExampleCode from './code/WithCustomisedAvatarExample.tsx?raw';
import { Autocomplete, AutocompleteProps } from '../../../../../src/index.js';
import defaultArgs, { optionsWithAvatar } from '../common/defaultArgs.js';

type Story = StoryObj<typeof Autocomplete>;

export const WithCustomisedAvatar: Story = {
    args: {
        ...defaultArgs,
        options: optionsWithAvatar,
        defaultValue: optionsWithAvatar[0],
        slotProps: {
            avatar: {
                variant: 'rounded',
                sx: { border: '2px solid', borderColor: 'primary.main' },
            },
        },
    },
    render: (args, context) =>
        createCodeStory({
            context,
            customProps: args,
            customCode: WithCustomisedAvatarExampleCode,
            example: <Autocomplete {...(args as AutocompleteProps)} />,
        }),
};
