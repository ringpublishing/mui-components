import type { StoryObj } from '@storybook/react-vite';
import { createCodeStory } from '../../../../helpers.js';
import DefaultExampleCode from './code/DefaultExample.tsx?raw';
import { Autocomplete, AutocompleteProps } from '../../../../../src/index.js';
import defaultArgs, { options } from '../common/defaultArgs.js';

type Story = StoryObj<typeof Autocomplete>;

export const Default: Story = {
    args: {
        ...defaultArgs,
        defaultValue: options[0],
    },
    render: (args, context) =>
        createCodeStory({
            context,
            customProps: args,
            customCode: DefaultExampleCode,
            example: <Autocomplete {...(args as AutocompleteProps)} />,
        }),
};
