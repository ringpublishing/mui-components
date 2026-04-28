import { Box } from '@mui/material';
import classNames from 'classnames';
import React from 'react';
import { CommentsProvider } from './CommentsContextApi.js';
import { CreatePanel } from './CreatePanel.js';
import { CommentsList } from './CommentsList.js';
import { CommentsProps } from './comments.types.js';
import { useRingDataTestId } from '../../../helpers/hooks/useRingDataTestId.js';

export type { CommentsProps, CommentsLabels, OnUpdateType, OnAddType, OnDeleteType } from './comments.types.js';

export const defaultValues = {
    minLength: 1,
    comments: [],
    disableCreatePanel: false,
};

export const Comments: React.FC<CommentsProps> = (props) => {
    const {
        sx,
        className,
        labels,
        minLength = defaultValues.minLength,
        initialComments = defaultValues.comments,
        disableCreatePanel = defaultValues.disableCreatePanel,
        onUpdate,
        onAdd,
        onDelete,
        dataTestIdSuffix,
    } = props;

    const dataTestId = useRingDataTestId('comments', dataTestIdSuffix);

    return (
        <CommentsProvider
            initialComments={initialComments}
            labels={labels}
            minLength={minLength}
            onDelete={onDelete}
            onUpdate={onUpdate}
            onAdd={onAdd}
            dataTestIdSuffix={dataTestIdSuffix}
        >
            <Box
                sx={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 2, ...sx }}
                className={classNames('ring-comments', className)}
                data-testid={dataTestId}
            >
                {disableCreatePanel ? null : <CreatePanel />}
                <CommentsList />
            </Box>
        </CommentsProvider>
    );
};
