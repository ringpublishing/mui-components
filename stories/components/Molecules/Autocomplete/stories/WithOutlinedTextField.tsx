import type { StoryObj } from '@storybook/react-vite';
import { InfoOutlined, ManageSearch } from '@mui/icons-material';
import { action } from 'storybook/actions';

import { createCodeStory } from '../../../../helpers.js';
import WithOutlinedTextFieldCode from './code/WithOutlinedTextFieldExample.tsx?raw';
import { Autocomplete, AutocompleteProps } from '../../../../../src/index.js';
import defaultArgs, { options, defaultSx } from '../common/defaultArgs.js';

type Story = StoryObj<typeof Autocomplete>;

export const WithOutlinedTextField: Story = {
    args: {
        ...defaultArgs,
        sx: defaultSx,
        slotProps: {
            textField: {
                variant: 'outlined',
            },
        },
        multiple: true,
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
        defaultValue: options.slice(0, 5),
    },
    render: (args, context) =>
        createCodeStory({
            context,
            customProps: args,
            customCode: WithOutlinedTextFieldCode,
            example: <Autocomplete {...(args as AutocompleteProps)} />,
        }),
};
