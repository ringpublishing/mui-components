import React from 'react';
import type { StoryObj } from '@storybook/react-vite';
import { Box } from '@mui/material';
import { action } from 'storybook/actions';
import { createCodeStory } from '../../../../helpers.js';
import DefaultExampleCode from './code/DefaultExample.tsx?raw';
import { AutocompleteChip, ChipsInput } from '../../../../../src/index.js';
import defaultArgs from '../common/defaultArgs.js';

type Story = StoryObj<typeof ChipsInput>;

const Example = (args: React.ComponentProps<typeof ChipsInput>): React.JSX.Element => {
    return (
        <Box sx={{ width: '300px' }}>
            <ChipsInput {...args} />
        </Box>
    );
};

export const Default: Story = {
    args: {
        ...defaultArgs,
        validationFunction: (value: AutocompleteChip) => {
            return !isNaN(parseInt(value.label));
        },
        onChange: action('onChange'),
    },
    render: (args, context) => {
        return createCodeStory({
            context,
            customProps: {},
            customCode: DefaultExampleCode,
            example: <Example {...args} />,
        });
    },
};
