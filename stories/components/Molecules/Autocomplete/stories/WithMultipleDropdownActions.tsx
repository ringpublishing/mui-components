import type { StoryObj } from '@storybook/react-vite';
import { action } from 'storybook/actions';
import { Search, Info } from 'lucide-react';
import { createCodeStory } from '../../../../helpers.js';
import WithMultipleDropdownActionsExampleCode from './code/WithMultipleDropdownActionsExample.tsx?raw';
import { Autocomplete, AutocompleteProps } from '../../../../../src/index.js';
import defaultArgs, { options } from '../common/defaultArgs.js';

type Story = StoryObj<typeof Autocomplete>;

export const WithMultipleDropdownActions: Story = {
    args: {
        ...defaultArgs,
        actions: [
            {
                icon: <Search />,
                onClick: action('click'),
                label: 'Settings',
            },
            {
                icon: <Info />,
                onClick: action('click'),
                label: 'Info',
            },
        ],
        defaultValue: options[0],
    },
    render: (args, context) =>
        createCodeStory({
            context,
            customProps: args,
            customCode: WithMultipleDropdownActionsExampleCode,
            example: <Autocomplete {...(args as AutocompleteProps)} />,
        }),
};
