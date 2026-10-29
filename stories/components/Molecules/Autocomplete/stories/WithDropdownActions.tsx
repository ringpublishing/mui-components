import type { StoryObj } from '@storybook/react-vite';
import { action } from 'storybook/actions';
import { Search } from 'lucide-react';
import { createCodeStory } from '../../../../helpers.js';
import WithDropdownActionsExampleCode from './code/WithDropdownActionsExample.tsx?raw';
import { Autocomplete, AutocompleteProps } from '../../../../../src/index.js';
import defaultArgs, { options } from '../common/defaultArgs.js';

type Story = StoryObj<typeof Autocomplete>;

export const WithDropdownActions: Story = {
    args: {
        ...defaultArgs,
        actions: [
            {
                icon: <Search />,
                onClick: action('click'),
                disabled: false,
                label: 'Settings',
            },
        ],
        defaultValue: options[0],
    },
    render: (args, context) =>
        createCodeStory({
            context,
            customProps: args,
            customCode: WithDropdownActionsExampleCode,
            example: <Autocomplete {...(args as AutocompleteProps)} />,
        }),
};
