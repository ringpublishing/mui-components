import type { StoryObj } from '@storybook/react-vite';
import { createCodeStory } from '../../../../helpers.js';
import WithMultipleSelectionExampleCode from './code/WithMultipleSelectionExample.tsx?raw';
import { Autocomplete, AutocompleteProps } from '../../../../../src/index.js';
import defaultArgs, { options } from '../common/defaultArgs.js';

type Story = StoryObj<typeof Autocomplete>;

export const WithMultipleSelection: Story = {
    args: {
        ...defaultArgs,
        multiple: true,
        defaultValue: options.slice(0, 2),
    },
    render: (args, context) =>
        createCodeStory({
            context,
            customProps: args,
            customCode: WithMultipleSelectionExampleCode,
            example: <Autocomplete {...(args as AutocompleteProps)} />,
        }),
};
