import type { StoryObj } from '@storybook/react-vite';
import { createCodeStory } from '../../../../helpers.js';
import WithChipActionsExampleCode from './code/WithChipActionsExample.tsx?raw';
import WithChipActionsExampleComponent from './WithChipActionsExample.js';
import { Autocomplete, AutocompleteProps } from '../../../../../src/index.js';
import defaultArgs from '../common/defaultArgs.js';

type Story = StoryObj<typeof Autocomplete>;

export const WithChipActions: Story = {
    parameters: {
        controls: { disable: true },
        actions: { disable: true },
    },
    args: {
        ...defaultArgs,
    },
    render: (args, context) =>
        createCodeStory({
            context,
            customProps: args,
            customCode: WithChipActionsExampleCode,
            example: <WithChipActionsExampleComponent {...(args as AutocompleteProps)} />,
        }),
};
