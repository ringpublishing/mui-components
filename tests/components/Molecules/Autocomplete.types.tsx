import React from 'react';

import {
    Autocomplete,
    AutocompleteChangeReason,
    AutocompleteProps,
    DefaultAutocompleteProps,
} from '../../../src/index.js';
import { Settings2 } from 'lucide-react';

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

// duplicateEntryMessage takes a node or a callback that receives the rejected text; onDuplicateEntry
// reports the same text alongside the keyboard or clipboard event that produced it.
const duplicateEntryAutocomplete = (
    <Autocomplete<Option>
        options={options}
        labels={{ title: 'Options' }}
        multiple={true}
        freeSolo={true}
        duplicateEntryMessage={(entry): string => `"${entry}" is already on the list`}
        onDuplicateEntry={(event, entry): void => {
            const rejected: string = entry;

            // The event is a keyboard event when typed and a clipboard event when pasted.
            if ('key' in event) {
                void event.key;
            }

            void rejected;
        }}
    />
);

// sortableChips composes with renderChip; the context then carries the optional isDragActive flag,
// and onChange's reason includes the widened 'reorder' member.
const sortableAutocomplete = (
    <Autocomplete<Option>
        options={options}
        labels={{ title: 'Options' }}
        multiple={true}
        sortableChips={true}
        renderChip={({ option, isDragActive, chipProps }): React.ReactNode => {
            const dragging: boolean | undefined = isDragActive;

            return <div {...chipProps}>{`${option.id}-${String(dragging)}`}</div>;
        }}
        onChange={(event, value, reason): void => {
            const changeReason: AutocompleteChangeReason = reason;
            const isReorder: boolean = reason === 'reorder';

            void event;
            void value;
            void changeReason;
            void isReorder;
        }}
    />
);

const duplicateEntryNodeMessage = {
    options,
    labels: { title: 'Options' },
    duplicateEntryMessage: <span>Already added</span>,
} satisfies AutocompleteProps<Option>;

const duplicateEntryWrongMessageArity: AutocompleteProps<Option> = {
    options,
    labels: { title: 'Options' },
    // @ts-expect-error the message callback receives the rejected text, not the change event.
    duplicateEntryMessage: (event: React.SyntheticEvent): string => String(event.type),
};

const autocompleteMenuListActions = {
    actions: [
        {
            label: 'Configure filters',
            icon: <Settings2 />,
            anchorRef: React.createRef<HTMLButtonElement>(),
        },
    ],
} satisfies NonNullable<DefaultAutocompleteProps['menuListActions']>;

const autocompleteMenuListActionsWithoutIcon: NonNullable<DefaultAutocompleteProps['menuListActions']> = {
    actions: [
        // @ts-expect-error icon is required for every menu list action.
        { label: 'Configure filters' },
    ],
};

const filterAutocomplete = (
    <Autocomplete
        variant="filter"
        options={options}
        labels={{ title: 'Filter options', searchPlaceholder: 'Search options' }}
        getOptionLabel={(option): string => (typeof option === 'string' ? option : option.label)}
        onChange={(event, value): void => {
            const possibleValue: Option | string | Array<Option | string> | null = value;

            void event;
            void possibleValue;
        }}
    />
);

const filterAutocompleteProps = {
    variant: 'filter',
    options,
    labels: { title: 'Filter options', searchPlaceholder: 'Search options' },
} satisfies AutocompleteProps<Option>;

const chipsInputAutocomplete = (
    <Autocomplete
        variant="chipsInput"
        labels={{ title: 'Tags' }}
        onChange={(event, value): void => {
            const entries: Array<unknown> = value;

            void event;
            void entries;
        }}
    />
);

const chipsInputWithMultiple = (
    // @ts-expect-error multiple is implied by the chipsInput variant.
    <Autocomplete variant="chipsInput" multiple={true} labels={{ title: 'Tags' }} />
);

const chipsInputWithFreeSolo = (
    // @ts-expect-error freeSolo is implied by the chipsInput variant.
    <Autocomplete variant="chipsInput" freeSolo={true} labels={{ title: 'Tags' }} />
);

const chipsInputWithSortableChips = (
    // @ts-expect-error reordering chips is not available in the chipsInput variant.
    <Autocomplete variant="chipsInput" sortableChips={true} labels={{ title: 'Tags' }} />
);

const chipsInputWithRecentlyUsed = (
    // @ts-expect-error recently used items are not available in the chipsInput variant.
    <Autocomplete variant="chipsInput" showRecentlyUsed={true} labels={{ title: 'Tags' }} />
);

const duplicateEntryPasteHandler = (
    <Autocomplete
        variant="chipsInput"
        labels={{ title: 'Tags' }}
        onDuplicateEntry={(event, entry): void => {
            const isPaste = 'clipboardData' in event;

            void isPaste;
            void entry;
        }}
    />
);

void inferredAutocomplete;
void explicitAutocomplete;
void defaultAutocompleteProps;
void explicitAutocompleteProps;
void duplicateEntryAutocomplete;
void duplicateEntryNodeMessage;
void duplicateEntryWrongMessageArity;
void sortableAutocomplete;
void autocompleteMenuListActions;
void autocompleteMenuListActionsWithoutIcon;
void filterAutocomplete;
void filterAutocompleteProps;
void chipsInputAutocomplete;
void chipsInputWithMultiple;
void chipsInputWithFreeSolo;
void chipsInputWithRecentlyUsed;
void duplicateEntryPasteHandler;
void chipsInputWithSortableChips;
