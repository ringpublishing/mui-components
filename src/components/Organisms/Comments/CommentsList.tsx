import React from 'react';

import { CommentItem } from './CommentItem.js';
import { useComments } from './CommentsContextApi.js';
import type { CommentProps } from './comments.types.js';

export const CommentsList = (): React.JSX.Element => {
    const { comments } = useComments();

    return (
        <>
            {comments.map((comment: CommentProps) => {
                return <CommentItem key={comment.id} comment={comment} />;
            })}
        </>
    );
};
