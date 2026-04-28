import type { StoryObj } from '@storybook/react-vite';
import { createCodeStory } from '../../../../helpers.js';
import WithCustomisedChipsExampleCode from './code/WithCustomisedChipsExample.tsx?raw';
import { Autocomplete, AutocompleteProps } from '../../../../../src/index.js';
import defaultArgs, { options } from '../common/defaultArgs.js';

type Story = StoryObj<typeof Autocomplete>;

export const WithCustomisedChips: Story = {
    args: {
        ...defaultArgs,
        labels: { title: 'filter by' },
        multiple: true,
        defaultValue: [options[0], options[1]],
        slotProps: {
            chip: {
                color: 'primary',
                size: 'small',
            },
        },
    },
    render: (args, context) =>
        createCodeStory({
            context,
            customProps: args,
            customCode: WithCustomisedChipsExampleCode,
            example: <Autocomplete {...(args as AutocompleteProps)} />,
        }),
};
