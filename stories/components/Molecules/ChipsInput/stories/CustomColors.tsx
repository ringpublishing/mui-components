import React from 'react';
import type { StoryObj } from '@storybook/react-vite';
import { Box } from '@mui/material';
import { action } from 'storybook/actions';
import { createCodeStory } from '../../../../helpers.js';
import CustomColorsExampleCode from './code/CustomColorsExample.tsx?raw';
import { AutocompleteChip, ChipColor, ChipsInput } from '../../../../../src/index.js';
import defaultArgs from '../common/defaultArgs.js';

type Story = StoryObj<typeof ChipsInput>;

const Example = (args: React.ComponentProps<typeof ChipsInput>): React.JSX.Element => {
    return (
        <Box sx={{ width: '300px' }}>
            <ChipsInput {...args} />
        </Box>
    );
};

export const CustomColors: Story = {
    args: {
        ...defaultArgs,
        labels: {
            title: 'Email validation',
            inputPlaceholder: 'Enter email address',
            alreadyOnList: 'Email already added',
        },
        validationFunction: (value: AutocompleteChip) => {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

            return emailRegex.test(value.label);
        },
        chipsColors: {
            default: ChipColor.SUCCESS,
            error: ChipColor.WARNING,
        },
        onChange: action('onChange'),
    },
    render: (args, context) => {
        return createCodeStory({
            context,
            customProps: {},
            customCode: CustomColorsExampleCode,
            example: <Example {...args} />,
        });
    },
};
