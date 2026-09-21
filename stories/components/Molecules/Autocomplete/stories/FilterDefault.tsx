import type { StoryObj } from '@storybook/react-vite';

import { createCodeStory } from '../../../../helpers.js';
import { Autocomplete, FilterAutocompleteProps } from '../../../../../src/index.js';
import FilterDefaultExampleCode from './code/FilterDefaultExample.tsx?raw';

type Story = StoryObj<FilterAutocompleteProps<{ id: number; label: string }>>;

const options = [
    { id: 1, label: 'Onet' },
    { id: 2, label: 'Fakt' },
    { id: 3, label: 'Newsweek' },
];

export const FilterDefault: Story = {
    args: {
        variant: 'filter',
        labels: { title: 'Publications', searchPlaceholder: 'Search publications' },
        options,
        getOptionLabel: (option): string => (option as { label: string }).label,
        isOptionEqualToValue: (option, value): boolean => {
            return (option as { id: number }).id === (value as { id: number }).id;
        },
        sx: { width: 240 },
    },
    render: (args, context) =>
        createCodeStory({
            context,
            customProps: args,
            customCode: FilterDefaultExampleCode,
            example: <Autocomplete {...args} />,
        }),
};
