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

const labels: CommentsLabels = {
    placeholder: 'Add a comment',
    editing: 'Edit comment',
    modified: 'modified',
    add: 'Add',
    cancel: 'Cancel',
    update: 'Update',
};

const initialComments: CommentData[] = [
    {
        id: '1',
        isOwner: true,
        text: 'Intro needs more historical context.',
        creationTime: '15:45 | 26-10-2020',
        author: 'Anna Kowalska',
    },
    {
        id: '2',
        isOwner: false,
        text: 'Fixed typos in research section, check it.',
        creationTime: '09:12 | 27-10-2020',
        author: 'Jan Nowak',
    },
    {
        id: '3',
        isOwner: false,
        text: 'Stats para needs a source, no?',
        creationTime: '14:30 | 27-10-2020',
        author: 'Katarzyna Wisniewska',
    },
    {
        id: '4',
        isOwner: true,
        text: 'Cut last chapter, was too long. Thoughts?',
        creationTime: '18:20 | 28-10-2020',
        isModified: true,
        author: 'Anna Kowalska',
    },
    {
        id: '5',
        isOwner: false,
        text: 'Added data table, could use better visuals.',
        creationTime: '11:15 | 29-10-2020',
        author: 'Piotr Malinowski',
    },
];

function formatCreationTime(): string {
    return (
        new Date().toLocaleString('pl-PL', { hour: '2-digit', minute: '2-digit' }).replace(',', '') +
        ' | ' +
        new Date().toLocaleString('pl-PL', { day: '2-digit', month: '2-digit', year: 'numeric' }).split('.').join('-')
    );
}

const simulateServer = {
    delete(id: string): Promise<{ status: string; id: string }> {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({ status: 'success', id });
            }, 1000);
        });
    },

    add(text: string): Promise<CommentData> {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({
                    id: crypto.randomUUID(),
                    text,
                    isOwner: true,
                    creationTime: formatCreationTime(),
                    author: 'Anna Kowalska',
                });
            }, 1000);
        });
    },

    update(id: string, text: string): Promise<{ status: string; id: string; text: string; creationTime: string }> {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({ text, status: 'success', id, creationTime: formatCreationTime() });
            }, 1000);
        });
    },
};

export default function DefaultExample(): React.JSX.Element {
    const handleDelete: React.ComponentProps<typeof Comments>['onDelete'] = async (id, { setError, deleteComment }) => {
        try {
            await simulateServer.delete(String(id));
            deleteComment();
        } catch (error) {
            setError('Server error: Failed to delete comment');
        }
    };

    const handleAdd: React.ComponentProps<typeof Comments>['onAdd'] = async (text, { addComment, setError }) => {
        try {
            const newComment = await simulateServer.add(text);
            addComment(newComment);
        } catch (error) {
            setError('Error adding comment.');
        }
    };

    const handleUpdate: React.ComponentProps<typeof Comments>['onUpdate'] = async (
        id,
        text,
        { updateComment, setError },
    ) => {
        try {
            const { creationTime } = await simulateServer.update(String(id), text);
            updateComment({ text, isModified: true, creationTime });
        } catch (error) {
            setError('Error updating comment.');
        }
    };

    return (
        <Box display="flex" justifyContent="center">
            <Box width="420px">
                <Comments
                    onDelete={handleDelete}
                    onUpdate={handleUpdate}
                    onAdd={handleAdd}
                    labels={labels}
                    initialComments={initialComments}
                />
            </Box>
        </Box>
    );
}
