import React, { useEffect, useState } from 'react';
import { ToggleButton } from '@mui/material';

import { Editor } from '@tiptap/core';
import { useCurrentEditor } from '@tiptap/react';

export interface TextEditorMenuToggleButtonProps {
    icon: React.JSX.Element;
    onClick: (editor: Editor) => void;
    active: ((editor: Editor) => boolean) | boolean;
    label?: string;
    disabled?: ((editor: Editor) => boolean) | boolean;
    dataTestId?: string;
}

export function TextEditorMenuToggleButton(props: TextEditorMenuToggleButtonProps): React.JSX.Element | null {
    const { icon, onClick, active, disabled, dataTestId } = props;

    const { editor } = useCurrentEditor();
    const [buttonActive, setButtonActive] = useState<boolean>(false);
    const [buttonDisabled, setButtonDisabled] = useState<boolean>(false);

    useEffect(() => {
        if (!editor) {
            return;
        }

        const updateButtonState = (): void => {
            const newActive = typeof active === 'function' ? active(editor) : active;
            const newDisabled = typeof disabled === 'function' ? disabled(editor) : disabled;

            setButtonActive(newActive);
            setButtonDisabled(Boolean(newDisabled));
        };

        // Set initial state
        updateButtonState();

        // Subscribe to editor updates
        editor.on('selectionUpdate', updateButtonState);
        editor.on('transaction', updateButtonState);

        return () => {
            editor.off('selectionUpdate', updateButtonState);
            editor.off('transaction', updateButtonState);
        };
    }, [editor, active, disabled]);

    if (!editor) {
        return null;
    }

    return (
        <ToggleButton
            value={buttonActive}
            selected={buttonActive}
            onClick={(): void => onClick(editor)}
            disabled={buttonDisabled}
            size={'small'}
            data-testid={dataTestId}
            sx={{
                border: 'none',
                color: (theme): string => theme.palette.text.secondary,
                '&.Mui-disabled': {
                    border: 'none',
                },
            }}
        >
            {icon}
        </ToggleButton>
    );
}
