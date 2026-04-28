import React from 'react';
import type { StoryObj } from '@storybook/react-vite';
import { Alert, Box } from '@mui/material';
import { action } from 'storybook/actions';
import { createCodeStory } from '../../../../helpers.js';
import ErrorHandlingExampleCode from './code/ErrorHandlingExample.tsx?raw';
import { Comments } from '../../../../../src/index.js';
import defaultArgs from '../common/defaultArgs.js';

type Story = StoryObj<typeof Comments>;

const Example = (args: React.ComponentProps<typeof Comments>): React.JSX.Element => {
    return (
        <Box width={'420px'}>
            <Comments
                {...args}
                onAdd={async (text, { addComment, setError }): Promise<void> => {
                    action('onAdd')(text, { addComment, setError });
                    await new Promise((resolve) => setTimeout(resolve, 700));
                    setError('Unable to add comment. Please try again later.');
                }}
                onUpdate={async (id, text, { updateComment, setError }): Promise<void> => {
                    action('onUpdate')(id, text, { updateComment, setError });
                    await new Promise((resolve) => setTimeout(resolve, 700));
                    setError('Unable to update comment. Please try again later.');
                }}
                onDelete={async (id, { deleteComment, setError }): Promise<void> => {
                    action('onDelete')(id, { deleteComment, setError });
                    await new Promise((resolve) => setTimeout(resolve, 700));
                    setError('Unable to delete comment. Please try again later.');
                }}
            />
            <Alert variant="outlined" severity="info" sx={{ mt: 4 }}>
                Note: <code>onAdd</code>, <code>onUpdate</code>, and <code>onDelete</code> callbacks are configured for
                demonstration purposes in this story and are not editable via storybook controls.
            </Alert>
        </Box>
    );
};

export const ErrorHandling: Story = {
    args: {
        ...defaultArgs,
        initialComments: [
            {
                id: '1',
                isOwner: true,
                text: 'Intro needs more historical context.',
                creationTime: '15:45 | 26-10-2020',
                author: 'Anna Kowalska',
            },
        ],
    },
    render: (args, context) =>
        createCodeStory({
            context,
            customProps: {},
            customCode: ErrorHandlingExampleCode,
            example: <Example {...args} />,
        }),
};
