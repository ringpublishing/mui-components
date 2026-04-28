import { useCallback, useEffect, useRef, useState } from 'react';
import { useComments } from './CommentsContextApi.js';
import { CommentContainer } from './CommentContainer.js';
import { CommentActions } from './CommentActions.js';
import { Alert, CardContent, CardHeader, CircularProgress, IconButton, TextField, Typography } from '@mui/material';
import { DeleteOutline, EditOutlined } from '@mui/icons-material';
import type { CommentItemProps } from './comments.types.js';
import { useRingDataTestId } from '../../../helpers/hooks/useRingDataTestId.js';

export const CommentItem: React.FC<CommentItemProps> = ({ comment }) => {
    const { id, text, author, isOwner, creationTime, isModified } = comment;
    const {
        updateComment,
        setEditingId,
        exitEditing,
        currentEditingId,
        deleteComment,
        minLength,
        labels,
        dataTestIdSuffix,
    } = useComments();
    const [textValue, setTextValue] = useState('');
    const [isHovered, setIsHovered] = useState(false);
    const [isPending, setIsPending] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const previewTextValue = useRef<string>(comment?.text || '');
    const prevIsEdit = useRef<boolean>(false);

    const isEdit = currentEditingId === id;
    const isSubmitDisabled = textValue.length < minLength || textValue === previewTextValue.current || isPending;

    const itemDataTestIdSuffix = dataTestIdSuffix ? `${dataTestIdSuffix}-${id}` : String(id);
    const dataTestId = useRingDataTestId('comments', itemDataTestIdSuffix);

    const onEditClick = useCallback((): void => {
        setEditingId(id);
        setTextValue(text);
        setErrorMessage('');
        previewTextValue.current = text;
    }, [id, setEditingId, text]);

    const handleTextChange = useCallback((event: React.ChangeEvent<HTMLInputElement>): void => {
        setTextValue(event.target.value);
    }, []);

    const onDeleteClick = useCallback(
        async (event: React.MouseEvent<HTMLButtonElement>): Promise<void> => {
            setIsPending(true);
            event.stopPropagation();
            const { status, errorMessage } = await deleteComment(id);

            if (status === 'success') {
                setIsPending(false);
                setErrorMessage('');
            }

            if (status === 'error') {
                setErrorMessage(errorMessage);
                setIsPending(false);
            }
        },
        [deleteComment, id],
    );

    useEffect(() => {
        if (prevIsEdit.current && !isEdit) {
            setIsPending(false);
            setTextValue('');
            setErrorMessage('');
        }

        prevIsEdit.current = isEdit;
    }, [isEdit]);

    const titlesArray = [author, creationTime];

    if (isModified) {
        titlesArray.push(labels.modified);
    }

    const title = (
        <Typography
            variant="body2"
            sx={{
                color: (theme) => (isEdit ? theme.palette.primary.main : theme.palette.text.secondary),
            }}
            component="span"
        >
            {isEdit ? labels.editing : titlesArray.join(' • ')}
        </Typography>
    );

    const renderDeleteIcon = (): React.JSX.Element | null => {
        if (!isOwner || isEdit) {
            return null;
        }

        return (
            <IconButton onClick={onDeleteClick} data-testid={`${dataTestId}-delete`}>
                {isPending ? <CircularProgress size={20} /> : <DeleteOutline />}
            </IconButton>
        );
    };

    const subheader = (
        <>
            <Typography variant="body1" sx={{ color: (theme) => theme.palette.text.primary, whiteSpace: 'pre-line' }}>
                {!isEdit && text}
                {isHovered && !isEdit && (
                    <IconButton
                        data-testid={`${dataTestId}-edit`}
                        onClick={onEditClick}
                        size="small"
                        sx={{ mt: -1, color: (theme) => theme.palette.primary.main }}
                    >
                        <EditOutlined fontSize="small" />
                    </IconButton>
                )}
                {isEdit && (
                    <TextField
                        onChange={handleTextChange}
                        inputRef={(event: HTMLInputElement | null): void => {
                            event?.focus();
                        }}
                        slotProps={{
                            htmlInput: { 'data-testid': `${dataTestId}-text` },
                        }}
                        error={Boolean(errorMessage)}
                        helperText={errorMessage}
                        placeholder={labels.placeholder}
                        fullWidth={true}
                        value={textValue}
                        multiline={true}
                        maxRows={5}
                    />
                )}
            </Typography>
        </>
    );

    return (
        <CommentContainer isActive={isEdit} canHover={isOwner} onHovered={setIsHovered} canAway={isSubmitDisabled}>
            <CardHeader data-testid={dataTestId} action={renderDeleteIcon()} title={title} subheader={subheader} />
            {isEdit && (
                <CommentActions
                    isEdit={isEdit}
                    isSubmitDisabled={isSubmitDisabled}
                    isCancelDisabled={isPending}
                    dataTestId={`${dataTestId}-edit-actions`}
                    callbacks={{
                        onCancel: (): void => {
                            exitEditing();
                            setTextValue(text);
                        },
                        onSubmit: async (): Promise<void> => {
                            setIsPending(true);
                            const { status, errorMessage } = await updateComment(id, {
                                ...comment,
                                text: textValue,
                            });

                            if (status === 'success') {
                                exitEditing();
                                setTextValue('');
                                setIsPending(false);
                                setErrorMessage('');
                            }

                            if (status === 'error') {
                                setErrorMessage(errorMessage);
                                setIsPending(false);
                            }
                        },
                    }}
                />
            )}
            {errorMessage && !isEdit && (
                <CardContent sx={{ mt: 0, pt: 0, '&:last-child': { pb: 2 } }}>
                    <Alert severity="error">{errorMessage}</Alert>
                </CardContent>
            )}
        </CommentContainer>
    );
};
