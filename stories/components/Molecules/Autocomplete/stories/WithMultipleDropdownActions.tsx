import type { StoryObj } from '@storybook/react-vite';
import { action } from 'storybook/actions';
import { ManageSearch, InfoOutlined } from '@mui/icons-material';
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
                icon: <ManageSearch />,
                onClick: action('click'),
                label: 'Settings',
            },
            {
                icon: <InfoOutlined />,
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
