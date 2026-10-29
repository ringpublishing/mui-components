import React, { useState } from 'react';
import type { StoryObj } from '@storybook/react-vite';
import { createCodeStory } from '../../../../helpers.js';
import ChipsInputWithValidationExampleCode from './code/ChipsInputWithValidationExample.tsx?raw';
import { Autocomplete, ChipsInputAutocompleteProps } from '../../../../../src/index.js';

type Story = StoryObj<typeof Autocomplete>;

const isEmail = (entry: string): boolean => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(entry);

const ChipsInputWithValidationExample = (props: ChipsInputAutocompleteProps<string>): React.JSX.Element => {
    const [entries, setEntries] = useState<string[]>(['anna@example.com', 'not-an-email']);

    return (
        <Autocomplete<string>
            {...props}
            variant="chipsInput"
            value={entries}
            onChange={(event, newValue): void => setEntries(newValue as string[])}
            validateEntry={(entry): boolean => isEmail(String(entry))}
            duplicateEntryMessage={(entry): string => `"${entry}" is already on the list`}
        />
    );
};

export const ChipsInputWithValidation: Story = {
    args: {
        variant: 'chipsInput',
        options: [],
        labels: { title: 'Recipients', inputPlaceholder: 'Add an address' },
    },
    render: (args, context) =>
        createCodeStory({
            context,
            customProps: args,
            customCode: ChipsInputWithValidationExampleCode,
            example: <ChipsInputWithValidationExample {...(args as ChipsInputAutocompleteProps<string>)} />,
        }),
};
