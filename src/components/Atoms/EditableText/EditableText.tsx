import React, { useCallback, useEffect, useState } from 'react';
import { Box, Button, ClickAwayListener, TextField, TextFieldProps } from '@mui/material';
import { EditOutlined } from '@mui/icons-material';
import classNames from 'classnames';
import { CommonComponentProps } from '../../../helpers/commonTypes.js';
import { useRingDataTestId } from '../../../helpers/hooks/useRingDataTestId.js';
import { tv } from '../../../helpers/typographyMode.js';
import { Typography, OverflowTypographyProps } from '../Typography/Typography.js';

export interface EditableTextSlotProps {
    /**
     * Props passed to the Typography component rendered in display mode.
     * The `children` prop is managed internally and cannot be overridden.
     */
    typography?: Omit<OverflowTypographyProps, 'children'>;
    /**
     * Props passed to the MUI TextField component rendered in edit mode.
     * The `value`, `onChange`, and `autoFocus` props are managed internally and cannot be overridden.
     */
    textField?: Omit<TextFieldProps, 'value' | 'onChange' | 'autoFocus'>;
}

export interface EditableTextProps extends CommonComponentProps {
    /**
     * The initial text to be displayed.
     */
    text: string;

    /**
     * The function to be called when the text is submitted.
     * This function should return a Promise that resolves to a boolean.
     * The boolean indicates whether the submission was successful (true) or not (false).
     */
    onSubmit: (value: string) => Promise<boolean>;

    /**
     * Optional label for the TextField in edit mode.
     */
    label?: string;

    /**
     * Props to customize the internal component slots.
     */
    slotProps?: EditableTextSlotProps;
}

function EditableText(props: EditableTextProps): React.JSX.Element {
    const { text, onSubmit, label, sx, className, dataTestIdSuffix, slotProps: componentSlotProps } = props;

    const dataTestId = useRingDataTestId(EditableText.name, dataTestIdSuffix);

    const [editMode, setEditMode] = useState(false);
    const [editedText, setEditedText] = useState(text);
    const [previousText, setPreviousText] = useState(text);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const openEditMode = useCallback(() => {
        if (!isSubmitting) {
            setEditMode(true);
        }
    }, [isSubmitting, setEditMode]);

    const closeEditMode = useCallback(() => {
        setEditMode(false);
    }, [setEditMode]);

    const handleSubmit = useCallback(async () => {
        if (editedText !== previousText && !isSubmitting) {
            setIsSubmitting(true);
            const updatedText = editedText;

            try {
                const result = await onSubmit(updatedText);

                if (result) {
                    setPreviousText(updatedText);
                    setIsSubmitting(false);
                    closeEditMode();
                } else {
                    throw new Error('Error while submitting');
                }
            } catch (e) {
                console.error(e);
                setEditedText(previousText);
                setIsSubmitting(false);
            }
        } else {
            setEditMode(false);
        }
    }, [editedText, previousText, isSubmitting, onSubmit, closeEditMode]);

    const handleEnter = useCallback(
        (e: KeyboardEvent) => {
            if (e.key === 'Enter') {
                handleSubmit();
            }
        },
        [handleSubmit],
    );

    const handleEscape = useCallback(
        (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                setEditedText(previousText);
                closeEditMode();
            }
        },
        [closeEditMode, previousText],
    );

    useEffect(() => {
        document.addEventListener('keydown', handleEnter, true);
        document.addEventListener('keydown', handleEscape, true);

        return (): void => {
            document.removeEventListener('keydown', handleEnter, true);
            document.removeEventListener('keydown', handleEscape, true);
        };
    }, [handleEnter, handleEscape]);

    if (!editMode) {
        const { sx: typographySx, ...restTypographyProps } = componentSlotProps?.typography ?? {};

        return (
            <Box
                sx={[
                    { display: 'flex', alignItems: 'center', minHeight: '26px' },
                    ...(Array.isArray(sx) ? sx : sx ? [sx] : []),
                ]}
                className={classNames('ring-editabletext', className)}
            >
                <Typography
                    {...restTypographyProps}
                    data-testid={`${dataTestId}-text`}
                    sx={[
                        {
                            color: (theme): string => theme.palette.text.primary,
                            fontSize: tv('0.75rem'),
                            lineHeight: tv('1.25rem'),
                        },
                        ...(Array.isArray(typographySx) ? typographySx : typographySx ? [typographySx] : []),
                    ]}
                >
                    {editedText}
                </Typography>
                <Button
                    data-testid={`${dataTestId}-edit`}
                    aria-label="Edit"
                    onClick={openEditMode}
                    sx={{ padding: 0, width: 20, minWidth: 20, marginLeft: 1 }}
                >
                    <EditOutlined />{' '}
                </Button>
            </Box>
        );
    }

    const {
        slotProps: externalTextFieldSlotProps,
        sx: textFieldSx,
        ...restTextFieldProps
    } = componentSlotProps?.textField ?? {};

    return (
        <Box
            sx={[{ minHeight: '26px' }, ...(Array.isArray(sx) ? sx : sx ? [sx] : [])]}
            className={classNames('ring-editabletext', className)}
        >
            <ClickAwayListener onClickAway={handleSubmit}>
                <TextField
                    variant="standard"
                    {...restTextFieldProps}
                    label={label}
                    autoFocus={true}
                    onChange={(e): void => {
                        !isSubmitting && setEditedText(e.target.value);
                    }}
                    value={editedText}
                    sx={[
                        {
                            '& .MuiInputBase-input': {
                                fontSize: tv('0.75rem'),
                                lineHeight: tv('1.25rem'),
                            },
                        },
                        ...(Array.isArray(textFieldSx) ? textFieldSx : textFieldSx ? [textFieldSx] : []),
                    ]}
                    slotProps={{
                        ...externalTextFieldSlotProps,
                        htmlInput: {
                            ...(externalTextFieldSlotProps?.htmlInput as object),
                            'data-testid': `${dataTestId}-input`,
                        },
                    }}
                />
            </ClickAwayListener>
        </Box>
    );
}

export { EditableText };
export default EditableText;
