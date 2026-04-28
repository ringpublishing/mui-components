import React, { useState } from 'react';
import type { StoryObj } from '@storybook/react-vite';
import { createCodeStory } from '../../../../helpers.js';
import WithFreeSoloExampleCode from './code/WithFreeSoloExample.tsx?raw';
import { Autocomplete, AutocompleteProps } from '../../../../../src/index.js';
import defaultArgs, { Option } from '../common/defaultArgs.js';

type Story = StoryObj<typeof Autocomplete>;

const WithFreeSoloExample = (props: AutocompleteProps): React.JSX.Element => {
    const [value, setValue] = useState<Option[]>([props.options[0] as Option]);

    return (
        <Autocomplete
            {...props}
            multiple={true}
            freeSolo={true}
            value={value}
            onChange={(event, newValue, reason): void => {
                if (reason === 'createOption') {
                    const newOption = (newValue as string[]).slice(-1)[0];
                    newValue = [...value, { label: newOption, id: value.length + 1 }];
                }

                setValue(newValue as Option[]);
            }}
        />
    );
};

export const WithFreeSolo: Story = {
    args: {
        ...defaultArgs,
        labels: { title: 'Free solo' },
    },
    render: (args, context) =>
        createCodeStory({
            context,
            customProps: args,
            customCode: WithFreeSoloExampleCode,
            example: <WithFreeSoloExample {...(args as AutocompleteProps)} />,
        }),
};
