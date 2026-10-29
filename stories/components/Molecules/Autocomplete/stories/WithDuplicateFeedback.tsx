import React, { useState } from 'react';
import type { StoryObj } from '@storybook/react-vite';
import { createCodeStory } from '../../../../helpers.js';
import WithDuplicateFeedbackExampleCode from './code/WithDuplicateFeedbackExample.tsx?raw';
import { Autocomplete, DefaultAutocompleteProps } from '../../../../../src/index.js';
import defaultArgs from '../common/defaultArgs.js';

type Story = StoryObj<typeof Autocomplete>;

const isSameTag = (option: unknown, value: unknown): boolean =>
    String(option).toLowerCase() === String(value).toLowerCase();

const WithDuplicateFeedbackExample = (props: DefaultAutocompleteProps): React.JSX.Element => {
    const [tags, setTags] = useState<string[]>(['design']);

    return (
        <Autocomplete
            {...props}
            options={[]}
            multiple={true}
            freeSolo={true}
            value={tags}
            onChange={(event, newValue): void => {
                setTags(newValue as string[]);
            }}
            isOptionEqualToValue={isSameTag}
            duplicateEntryMessage={(entry): string => `"${entry}" is already on the list`}
            slotProps={{ textField: { helperText: 'Press Enter to add a tag' } }}
        />
    );
};

export const WithDuplicateFeedback: Story = {
    args: {
        ...defaultArgs,
        labels: { title: 'Tags' },
    },
    render: (args, context) =>
        createCodeStory({
            context,
            customProps: args,
            customCode: WithDuplicateFeedbackExampleCode,
            example: <WithDuplicateFeedbackExample {...(args as DefaultAutocompleteProps)} />,
        }),
};
