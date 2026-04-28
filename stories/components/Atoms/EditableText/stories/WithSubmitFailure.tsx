import React from 'react';
import type { StoryObj } from '@storybook/react-vite';
import { action } from 'storybook/actions';
import { createCodeStory } from '../../../../helpers.js';
import WithSubmitFailureExampleCode from './code/WithSubmitFailureExample.tsx?raw';
import { EditableText } from '../../../../../src/index.js';
import defaultArgs from '../common/defaultArgs.js';
import { Box } from '@mui/material';

type Story = StoryObj<typeof EditableText>;

const Example = (args: React.ComponentProps<typeof EditableText>): React.JSX.Element => {
    const handleSubmit = (value: string): Promise<boolean> => {
        action('onSubmit')(value);

        // Simulate a failed submission — text will revert to the previous value
        return Promise.resolve(false);
    };

    return (
        <Box sx={{ width: 300 }}>
            <EditableText {...args} onSubmit={handleSubmit} />
        </Box>
    );
};

export const WithSubmitFailure: Story = {
    args: {
        ...defaultArgs,
        text: 'Try editing me, changes will not be saved',
        slotProps: {
            ...defaultArgs.slotProps,
            textField: {
                fullWidth: true,
            },
        },
    },
    render: (args, context) => {
        return createCodeStory({
            context,
            customProps: {},
            customCode: WithSubmitFailureExampleCode,
            example: <Example {...args} />,
        });
    },
};
