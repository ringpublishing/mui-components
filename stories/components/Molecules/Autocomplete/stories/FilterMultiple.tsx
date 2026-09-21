import type { StoryObj } from '@storybook/react-vite';

import { createCodeStory } from '../../../../helpers.js';
import { Autocomplete, FilterAutocompleteProps } from '../../../../../src/index.js';
import FilterMultipleExampleCode from './code/FilterMultipleExample.tsx?raw';

type Story = StoryObj<FilterAutocompleteProps<{ id: number; label: string }>>;

const options = [
    { id: 1, label: 'Onet' },
    { id: 2, label: 'Fakt' },
    { id: 3, label: 'Newsweek' },
];

export const FilterMultiple: Story = {
    args: {
        variant: 'filter',
        labels: { title: 'Publications', searchPlaceholder: 'Search publications' },
        multiple: true,
        defaultValue: options.slice(0, 2),
        options,
        getOptionLabel: (option): string => (option as { label: string }).label,
        isOptionEqualToValue: (option, value): boolean => {
            return (option as { id: number }).id === (value as { id: number }).id;
        },
        sx: { width: 300 },
    },
    render: (args, context) =>
        createCodeStory({
            context,
            customProps: args,
            customCode: FilterMultipleExampleCode,
            example: <Autocomplete {...args} />,
        }),
};
