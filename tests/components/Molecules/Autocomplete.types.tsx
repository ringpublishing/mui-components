import React from 'react';

import { Autocomplete, AutocompleteProps } from '../../../src/index.js';

type Option = {
    id: number;
    label: string;
};

const options: Option[] = [{ id: 1, label: 'One' }];

// Value is inferred from options when the component generic is omitted.
const inferredAutocomplete = (
    <Autocomplete
        options={options}
        labels={{ title: 'Options' }}
        getOptionLabel={(option): string => (typeof option === 'string' ? option : option.label)}
        renderChip={({ option, label, index, chipProps }): React.ReactNode => {
            const id: number = option.id;
            const optionLabel: string = option.label;
            const chipLabel: string = label;
            const chipIndex: number = index;

            return <div {...chipProps}>{`${id}-${optionLabel}-${chipLabel}-${chipIndex}`}</div>;
        }}
        onChange={(event, value): void => {
            // The public API intentionally keeps this value broad because multiple/freeSolo are booleans.
            const possibleValue: Option | string | Array<Option | string> | null = value;

            void event;
            void possibleValue;
        }}
    />
);

// The explicit generic remains available when options are empty or not yet available.
const explicitAutocomplete = (
    <Autocomplete<Option>
        options={[]}
        labels={{ title: 'Options' }}
        getOptionLabel={(option): string => (typeof option === 'string' ? option : option.label)}
        renderChip={({ option }): React.ReactNode => <span>{option.id}</span>}
    />
);

// AutocompleteProps without a generic keeps its default Value = unknown and remains usable as a public props type.
const defaultAutocompleteProps = {
    options,
    labels: { title: 'Options' },
} satisfies AutocompleteProps;

const explicitAutocompleteProps = {
    options,
    labels: { title: 'Options' },
    value: options[0],
    onChange: (event, value): void => {
        const selected: Option | string | Array<Option | string> | null = value;

        void event;
        void selected;
    },
} satisfies AutocompleteProps<Option>;

void inferredAutocomplete;
void explicitAutocomplete;
void defaultAutocompleteProps;
void explicitAutocompleteProps;
