import React from 'react';
import type { StoryObj } from '@storybook/react-vite';
import { Alert, Box } from '@mui/material';
import { action } from 'storybook/actions';
import { createCodeStory } from '../../../../helpers.js';
import DefaultExampleCode from './code/DefaultExample.tsx?raw';
import { Comments } from '../../../../../src/index.js';
import defaultArgs from '../common/defaultArgs.js';

type Story = StoryObj<typeof Comments>;

function formatCreationTime(): string {
    const time = new Date().toLocaleString('pl-PL', { hour: '2-digit', minute: '2-digit' }).replace(',', '');
    const date = new Date()
        .toLocaleString('pl-PL', { day: '2-digit', month: '2-digit', year: 'numeric' })
        .split('.')
        .join('-');

    return `${time} | ${date}`;
}

const Example = (args: React.ComponentProps<typeof Comments>): React.JSX.Element => {
    return (
        <Box width={'420px'}>
            <Comments
                {...args}
                onAdd={async (text, { addComment, setError }): Promise<void> => {
                    action('onAdd')(text, { addComment, setError });
                    await new Promise((resolve) => setTimeout(resolve, 700));
                    addComment({
                        id: crypto.randomUUID(),
                        text,
                        isOwner: true,
                        creationTime: formatCreationTime(),
                        author: 'John Doe',
                    });
                }}
                onUpdate={async (id, text, { updateComment, setError }): Promise<void> => {
                    action('onUpdate')(id, text, { updateComment, setError });

                    if (id === null) {
                        return;
                    }

                    await new Promise((resolve) => setTimeout(resolve, 700));
                    updateComment({
                        text,
                        isModified: true,
                        creationTime: formatCreationTime(),
                    });
                }}
                onDelete={async (id, { deleteComment, setError }): Promise<void> => {
                    action('onDelete')(id, { deleteComment, setError });

                    if (id === null) {
                        return;
                    }

                    await new Promise((resolve) => setTimeout(resolve, 700));
                    deleteComment();
                }}
            />
            <Alert variant="outlined" severity="info" sx={{ mt: 4 }}>
                Note: <code>onAdd</code>, <code>onUpdate</code>, and <code>onDelete</code> callbacks are configured for
                demonstration purposes in this story and are not editable via storybook controls.
            </Alert>
        </Box>
    );
};

export const Default: Story = {
    args: {
        ...defaultArgs,
    },
    render: (args, context) =>
        createCodeStory({
            context,
            customProps: {},
            customCode: DefaultExampleCode,
            example: <Example {...args} />,
        }),
};
