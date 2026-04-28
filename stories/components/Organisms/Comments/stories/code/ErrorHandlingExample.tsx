import React from 'react';
import { Box } from '@mui/material';
import { Comments, CommentsLabels } from '@ringpublishing/mui-components';

interface CommentData {
    id: string | number;
    text: string;
    creationTime: string;
    author: string;
    isOwner: boolean;
    isModified?: boolean;
}

const initialComments: CommentData[] = [
    {
        id: '1',
        isOwner: true,
        text: 'Intro needs more historical context.',
        creationTime: '15:45 | 26-10-2020',
        author: 'Anna Kowalska',
    },
];

const labels: CommentsLabels = {
    placeholder: 'Add a comment',
    editing: 'Edit comment',
    modified: 'modified',
    add: 'Add',
    cancel: 'Cancel',
    update: 'Update',
};

export default function ErrorHandlingExample(): React.JSX.Element {
    return (
        <Box display="flex" justifyContent="center">
            <Box width="420px">
                <Comments
                    labels={labels}
                    initialComments={initialComments}
                    onAdd={async (text, { addComment, setError }): Promise<void> => {
                        await new Promise((resolve) => setTimeout(resolve, 700));
                        setError('Unable to add comment. Please try again later.');
                    }}
                    onUpdate={async (id, text, { updateComment, setError }): Promise<void> => {
                        await new Promise((resolve) => setTimeout(resolve, 700));
                        setError('Unable to update comment. Please try again later.');
                    }}
                    onDelete={async (id, { deleteComment, setError }): Promise<void> => {
                        await new Promise((resolve) => setTimeout(resolve, 700));
                        setError('Unable to delete comment. Please try again later.');
                    }}
                />
            </Box>
        </Box>
    );
}
