import type { StoryObj } from '@storybook/react-vite';
import { action } from 'storybook/actions';
import { createCodeStory } from '../../../../helpers.js';
import WithSortableChipsExampleCode from './code/WithSortableChipsExample.tsx?raw';
import { Autocomplete, AutocompleteProps } from '../../../../../src/index.js';
import defaultArgs, { options } from '../common/defaultArgs.js';

type Story = StoryObj<typeof Autocomplete>;

export const WithSortableChips: Story = {
    args: {
        ...defaultArgs,
        labels: { title: 'filter by' },
        multiple: true,
        sortableChips: true,
        defaultValue: [options[0], options[1], options[2], options[3]],
        onChange: (event, value, reason) => action('onChange')(reason, value),
        slotProps: {
            chip: {
                color: 'primary',
                size: 'small',
            },
        },
        sx: { width: 300 },
    },
    render: (args, context) =>
        createCodeStory({
            context,
            customProps: args,
            customCode: WithSortableChipsExampleCode,
            example: <Autocomplete {...(args as AutocompleteProps)} />,
        }),
};
