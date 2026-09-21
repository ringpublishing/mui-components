import React, { useState } from 'react';
import type { StoryObj } from '@storybook/react-vite';

import { createCodeStory } from '../../../../helpers.js';
import { Autocomplete, FilterAutocompleteProps } from '../../../../../src/index.js';
import FilterControlledExampleCode from './code/FilterControlledExample.tsx?raw';

type Story = StoryObj<FilterAutocompleteProps<{ id: number; label: string }>>;

function ControlledFilterAutocomplete(
    props: FilterAutocompleteProps<{ id: number; label: string }>,
): React.JSX.Element {
    const { inputValue: initialInputValue = '', open: initialOpen = false, ...otherProps } = props;
    const [inputValue, setInputValue] = useState(initialInputValue);
    const [open, setOpen] = useState(initialOpen);

    return (
        <Autocomplete
            {...otherProps}
            inputValue={inputValue}
            open={open}
            onInputChange={(event, nextInputValue): void => {
                void event;
                setInputValue(nextInputValue);
            }}
            onClose={(event): void => {
                void event;
                setOpen(false);
            }}
            onOpen={(event): void => {
                void event;
                setOpen(true);
            }}
        />
    );
}

const options = [
    { id: 1, label: 'Onet' },
    { id: 2, label: 'Fakt' },
    { id: 3, label: 'Newsweek' },
];

export const FilterControlled: Story = {
    args: {
        variant: 'filter',
        labels: { title: 'Publications', searchPlaceholder: 'Search publications' },
        inputValue: 'Fakt',
        open: true,
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
            customCode: FilterControlledExampleCode,
            example: <ControlledFilterAutocomplete {...args} />,
        }),
};
