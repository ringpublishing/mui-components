import { useCallback, useRef, useState } from 'react';
import { CommentContainer } from './CommentContainer.js';
import { useComments } from './CommentsContextApi.js';
import { CardHeader, TextField } from '@mui/material';
import { CommentActions } from './CommentActions.js';
import { HandleTextChangeType } from './comments.types.js';
import { useRingDataTestId } from '../../../helpers/hooks/useRingDataTestId.js';

export const CreatePanel = (): React.JSX.Element => {
    const { addComment, setAddCommentMode, exitEditing, isAddModeEnabled, labels, minLength, dataTestIdSuffix } =
        useComments();
    const [textValue, setTextValue] = useState('');
    const [isPendingAdd, setIsPendingAdd] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const textFieldRef = useRef<HTMLInputElement>(null);
    const isSubmitDisabled = textValue.length < minLength || isPendingAdd;
    const dataTestId = useRingDataTestId('comments', dataTestIdSuffix);

    const handleShowAddComment = useCallback((): void => {
        if (isAddModeEnabled) {
            return;
        }

        setAddCommentMode();
        textFieldRef.current?.focus();
    }, [isAddModeEnabled, setAddCommentMode]);

    const handleTextChange: HandleTextChangeType = useCallback((event) => {
        setTextValue(event.target.value);
    }, []);

    return (
        <CommentContainer
            isActive={isAddModeEnabled}
            onClick={handleShowAddComment}
            canHover={true}
            canAway={isSubmitDisabled}
        >
            <CardHeader
                subheader={
                    <TextField
                        slotProps={{
                            htmlInput: { 'data-testid': `${dataTestId}-text` },
                        }}
                        onChange={handleTextChange}
                        inputRef={textFieldRef}
                        placeholder={labels.placeholder}
                        fullWidth={true}
                        value={textValue}
                        error={Boolean(errorMessage)}
                        helperText={errorMessage}
                        multiline={true}
                        maxRows={5}
                    />
                }
            />
            {isAddModeEnabled && (
                <CommentActions
                    isCancelDisabled={isPendingAdd}
                    isSubmitDisabled={isSubmitDisabled}
                    dataTestId={`${dataTestId}-new`}
                    callbacks={{
                        onCancel: (): void => {
                            exitEditing();
                            setTextValue('');
                            setErrorMessage('');
                        },
                        onSubmit: async (): Promise<void> => {
                            setIsPendingAdd(true);
                            const { status, errorMessage } = await addComment(textValue);

                            if (status === 'success') {
                                exitEditing();
                                setTextValue('');
                                setErrorMessage('');
                                setIsPendingAdd(false);
                            }

                            if (status === 'error') {
                                setErrorMessage(errorMessage);
                                setIsPendingAdd(false);
                            }
                        },
                    }}
                />
            )}
        </CommentContainer>
    );
};
