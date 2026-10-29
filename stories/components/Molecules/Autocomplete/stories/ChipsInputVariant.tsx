import React, { useState } from 'react';
import type { StoryObj } from '@storybook/react-vite';
import { createCodeStory } from '../../../../helpers.js';
import ChipsInputVariantExampleCode from './code/ChipsInputVariantExample.tsx?raw';
import { Autocomplete, ChipsInputAutocompleteProps } from '../../../../../src/index.js';

type Story = StoryObj<typeof Autocomplete>;

const isSameTag = (option: string, value: string): boolean => option.toLowerCase() === value.toLowerCase();

const ChipsInputVariantExample = (props: ChipsInputAutocompleteProps<string>): React.JSX.Element => {
    const [entries, setEntries] = useState<string[]>(['design']);

    return (
        <Autocomplete<string>
            {...props}
            variant="chipsInput"
            value={entries}
            onChange={(event, newValue): void => setEntries(newValue as string[])}
            isOptionEqualToValue={isSameTag}
            duplicateEntryMessage={(entry): string => `"${entry}" is already on the list`}
        />
    );
};

export const ChipsInputVariant: Story = {
    args: {
        variant: 'chipsInput',
        options: ['design', 'editorial', 'news', 'sport', 'video'],
        labels: { title: 'Tags', inputPlaceholder: 'Type a tag and press Enter' },
    },
    render: (args, context) =>
        createCodeStory({
            context,
            customProps: args,
            customCode: ChipsInputVariantExampleCode,
            example: <ChipsInputVariantExample {...(args as ChipsInputAutocompleteProps<string>)} />,
        }),
};
