import React, { useState } from 'react';
import type { StoryObj } from '@storybook/react-vite';
import { createCodeStory } from '../../../../helpers.js';
import ChipsInputWithPasteExampleCode from './code/ChipsInputWithPasteExample.tsx?raw';
import { Autocomplete, ChipsInputAutocompleteProps } from '../../../../../src/index.js';

type Story = StoryObj<typeof Autocomplete>;

const ChipsInputWithPasteExample = (props: ChipsInputAutocompleteProps<string>): React.JSX.Element => {
    const [entries, setEntries] = useState<string[]>([]);

    return (
        <Autocomplete<string>
            {...props}
            variant="chipsInput"
            value={entries}
            onChange={(event, newValue): void => setEntries(newValue as string[])}
            createChipsOnPaste={true}
            chipMaxWidth={120}
            duplicateEntryMessage={(entry): string => `"${entry}" is already on the list`}
        />
    );
};

export const ChipsInputWithPaste: Story = {
    args: {
        variant: 'chipsInput',
        options: [],
        labels: { title: 'Article IDs', inputPlaceholder: 'Paste a list of IDs' },
    },
    render: (args, context) =>
        createCodeStory({
            context,
            customProps: args,
            customCode: ChipsInputWithPasteExampleCode,
            example: <ChipsInputWithPasteExample {...(args as ChipsInputAutocompleteProps<string>)} />,
        }),
};
