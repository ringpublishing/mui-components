import { Button, CardActions } from '@mui/material';
import React from 'react';
import { useComments } from './CommentsContextApi.js';
import type { CommentActionsProps } from './comments.types.js';

export const CommentActions: React.FC<CommentActionsProps> = ({
    callbacks,
    isSubmitDisabled = false,
    isCancelDisabled = false,
    isEdit = false,
    dataTestId,
}) => {
    const { labels } = useComments();
    const submitLabel = isEdit ? labels.update : labels.add;

    return (
        <CardActions sx={{ justifyContent: 'flex-end', gap: 1 }}>
            <Button
                size="small"
                color="secondary"
                onClick={callbacks?.onCancel}
                disabled={isCancelDisabled}
                data-testid={`${dataTestId}-cancel`}
            >
                {labels.cancel}
            </Button>
            <Button
                size="small"
                color="primary"
                disabled={isSubmitDisabled}
                onClick={callbacks?.onSubmit}
                data-testid={`${dataTestId}-add`}
            >
                {submitLabel}
            </Button>
        </CardActions>
    );
};
