import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import type {
    CommentsProviderProps,
    CommentsContext,
    CommentsContextProps,
    CommentIdProp,
    UpdateCommentType,
    HandlerResponseStatus as ApiActionsResponseStatus,
    DeleteCommentType,
    AddCommentType,
    SetEditingIdType,
    UpdateCommentByIdType,
} from './comments.types.js';

const COMMENT_ADD_MODE_ID = 'COMMENT_ADD_MODE_ID';
const CommentsContext = createContext<CommentsContext>(undefined);

export const CommentsProvider: React.FC<CommentsProviderProps> = ({
    children,
    initialComments = [],
    labels,
    minLength,
    onDelete,
    onUpdate,
    onAdd,
    dataTestIdSuffix,
}) => {
    const [comments, setComments] = useState(initialComments);
    const [currentEditingId, setCurrentEditingId] = useState<CommentIdProp>(null);

    const updateCommentById: UpdateCommentByIdType = useCallback((id, updatedData) => {
        setComments((prevComments) =>
            prevComments.map((comment) => (comment.id === id ? { ...comment, ...updatedData } : comment)),
        );
    }, []);

    const setEditingId: SetEditingIdType = useCallback((commentId) => {
        setCurrentEditingId(commentId);
    }, []);

    const setAddCommentMode = useCallback(() => {
        setCurrentEditingId(COMMENT_ADD_MODE_ID);
    }, []);

    const exitEditing = useCallback(() => {
        setCurrentEditingId(null);
    }, []);

    const updateComment: UpdateCommentType = useCallback(
        async (commentId, commentData) => {
            let status: ApiActionsResponseStatus = null;
            let errorMessage = '';

            if (!onUpdate) {
                console.warn('onUpdate callback is not provided');

                return { status, errorMessage: '' };
            }

            await onUpdate(commentId, commentData.text ?? '', {
                updateComment: (updatedData) => {
                    updateCommentById(commentId, { ...updatedData });
                    status = 'success';
                },
                setError: (msg) => {
                    status = 'error';
                    errorMessage = msg;
                },
            });

            return { status, errorMessage };
        },
        [onUpdate, updateCommentById],
    );

    const deleteComment: DeleteCommentType = useCallback(
        async (commentId) => {
            let status: ApiActionsResponseStatus = null;
            let errorMessage = '';

            if (!onDelete) {
                console.warn('onDelete callback is not provided');

                return { status: null, errorMessage: '' };
            }

            await onDelete(commentId, {
                deleteComment: () => {
                    setComments((prev) => prev.filter((comment) => comment.id !== commentId));
                    status = 'success';
                },
                setError: (msg) => {
                    errorMessage = msg;
                    status = 'error';
                },
            });

            return { status, errorMessage };
        },
        [onDelete],
    );

    const addComment: AddCommentType = useCallback(
        async (text) => {
            let status: ApiActionsResponseStatus = null;
            let errorMessage = '';

            if (!onAdd) {
                console.warn('onAdd callback is not provided');

                return { status: null, errorMessage: '' };
            }

            await onAdd(text, {
                addComment: (comment) => {
                    setComments((prevComments) => [comment, ...prevComments]);
                    status = 'success';
                },
                setError: (msg) => {
                    errorMessage = msg;
                    status = 'error';
                },
            });

            return { status, errorMessage };
        },
        [onAdd],
    );

    const contextValue = useMemo(() => {
        const isAddModeEnabled = currentEditingId === COMMENT_ADD_MODE_ID;

        return {
            comments,
            labels,
            minLength,
            currentEditingId,
            isAddModeEnabled,
            addComment,
            deleteComment,
            updateComment,
            setEditingId,
            setAddCommentMode,
            exitEditing,
            dataTestIdSuffix,
        };
    }, [
        currentEditingId,
        comments,
        labels,
        minLength,
        addComment,
        deleteComment,
        updateComment,
        setEditingId,
        setAddCommentMode,
        exitEditing,
    ]);

    return <CommentsContext.Provider value={contextValue}>{children}</CommentsContext.Provider>;
};

export const useComments = (): CommentsContextProps => {
    const context = useContext(CommentsContext);

    if (!context) {
        throw new Error('useCommentsContext must be used within a CommentsProvider');
    }

    return context;
};
