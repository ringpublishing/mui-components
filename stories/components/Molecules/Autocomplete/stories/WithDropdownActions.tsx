import type { StoryObj } from '@storybook/react-vite';
import { action } from 'storybook/actions';
import { ManageSearch } from '@mui/icons-material';
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
                icon: <ManageSearch />,
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
