import React from 'react';
import type { StoryObj } from '@storybook/react-vite';
import { Box } from '@mui/material';
import { action } from 'storybook/actions';
import { createCodeStory } from '../../../../helpers.js';
import NoValidationExampleCode from './code/NoValidationExample.tsx?raw';
import { ChipsInput } from '../../../../../src/index.js';
import defaultArgs from '../common/defaultArgs.js';

type Story = StoryObj<typeof ChipsInput>;

const Example = (args: React.ComponentProps<typeof ChipsInput>): React.JSX.Element => {
    return (
        <Box sx={{ width: '300px' }}>
            <ChipsInput {...args} />
        </Box>
    );
};

export const NoValidation: Story = {
    args: {
        ...defaultArgs,
        labels: {
            title: 'Tags',
            inputPlaceholder: 'Add any tag',
            alreadyOnList: 'Tag already exists',
        },
        onChange: action('onChange'),
    },
    render: (args, context) => {
        return createCodeStory({
            context,
            customProps: {},
            customCode: NoValidationExampleCode,
            example: <Example {...args} />,
        });
    },
};
