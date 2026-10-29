import React, { useCallback, useEffect, useState } from 'react';
import { Box, ClickAwayListener, IconButton, TextField, TextFieldProps } from '@mui/material';
import { Pencil } from 'lucide-react';
import classNames from 'classnames';
import { CommonComponentProps } from '../../../helpers/commonTypes.js';
import { useRingDataTestId } from '../../../helpers/hooks/useRingDataTestId.js';
import { tv } from '../../../helpers/typographyMode.js';
import { Typography, OverflowTypographyProps } from '../Typography/Typography.js';
import { RingLucideIcon } from '../../../helpers/RingLucideIcon.js';

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
     * Called with the submitted text; resolves to `true` when the submission succeeded and `false`
     * otherwise.
     */
    onSubmit: (value: string) => Promise<boolean>;

    /**
     * Optional label for the TextField in edit mode.
     */
    label?: string;

    /**
     * Placeholder shown when text is empty.
     */
    placeholder?: string;

    /**
     * Props to customize the internal component slots.
     */
    slotProps?: EditableTextSlotProps;
}

function EditableText(props: EditableTextProps): React.JSX.Element {
    const {
        text,
        onSubmit,
        label,
        placeholder,
        sx,
        className,
        dataTestIdSuffix,
        slotProps: componentSlotProps,
    } = props;

    const dataTestId = useRingDataTestId('EditableText', dataTestIdSuffix);

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
        const isTextEmpty = editedText === '';
        const displayText = isTextEmpty ? (placeholder ?? '') : editedText;

        return (
            <Box
                sx={[
                    { display: 'flex', alignItems: 'center', minHeight: '26px' },
                    ...(Array.isArray(sx) ? sx : sx ? [sx] : []),
                ]}
                className={classNames('ring-editabletext', className)}
                data-testid={dataTestId}
            >
                <Typography
                    {...restTypographyProps}
                    data-testid={`${dataTestId}-text`}
                    sx={[
                        {
                            color: (theme): string =>
                                isTextEmpty && placeholder !== undefined
                                    ? theme.palette.text.secondary
                                    : theme.palette.text.primary,
                            fontSize: tv('0.75rem'),
                            lineHeight: tv('1.25rem'),
                        },
                        ...(Array.isArray(typographySx) ? typographySx : typographySx ? [typographySx] : []),
                    ]}
                >
                    {displayText}
                </Typography>
                <IconButton
                    size="small"
                    color="primary"
                    data-testid={`${dataTestId}-edit`}
                    aria-label="Edit"
                    onClick={openEditMode}
                    sx={{ ml: 1, p: '3px' }}
                >
                    <RingLucideIcon
                        icon={Pencil}
                        sx={(theme): { fontSize: string } => ({ fontSize: theme.typography.pxToRem(20) })}
                    />
                </IconButton>
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
            data-testid={dataTestId}
        >
            <ClickAwayListener onClickAway={handleSubmit}>
                <TextField
                    variant="standard"
                    {...restTextFieldProps}
                    label={label}
                    placeholder={restTextFieldProps.placeholder ?? placeholder}
                    autoFocus={true}
                    onChange={(e): void => {
                        !isSubmitting && setEditedText(e.target.value);
                    }}
                    value={editedText}
                    sx={[
                        {
                            width: '100%',
                            // The theme sizes a standard input as a 40px form field; the edit field
                            // keeps the 32px of the display row it replaces (the edit button's height),
                            // so toggling edit mode does not move the content below.
                            '& .MuiInputBase-root': {
                                minHeight: '32px',
                                lineHeight: tv('1.25rem'),
                            },
                            '& .MuiInputBase-input': {
                                fontSize: tv('0.75rem'),
                                lineHeight: tv('1.25rem'),
                                height: 'auto',
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
