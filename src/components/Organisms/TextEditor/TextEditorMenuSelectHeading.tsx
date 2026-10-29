import React, { useEffect, useState } from 'react';
import { MenuItem, Select } from '@mui/material';
import { Level } from '@tiptap/extension-heading';
import { useCurrentEditor } from '@tiptap/react';
import { useMenuControlDataTestId } from './textEditorMenuTestIdContext.js';

export interface TextEditorMenuSelectHeadingProps {
    levels: number[];
    /**
     * `data-testid` for the heading select. Matches `TextEditorMenuToggleButton`'s API so
     * every menu control is tagged the same way.
     * @default 'ring-texteditor-menu-heading'
     */
    dataTestId?: string;
}

export function TextEditorMenuSelectHeading(props: TextEditorMenuSelectHeadingProps): React.JSX.Element | null {
    const { levels, dataTestId: explicitDataTestId } = props;
    const dataTestId = useMenuControlDataTestId(explicitDataTestId, 'heading');
    const { editor } = useCurrentEditor();
    const [currentLevel, setCurrentLevel] = useState<number | 'p'>('p');

    useEffect(() => {
        if (!editor) {
            return;
        }

        const updateCurrentLevel = (): void => {
            const level = editor.getAttributes('heading').level || 'p';
            setCurrentLevel(level);
        };

        // Set initial value
        updateCurrentLevel();

        // Subscribe to editor updates
        editor.on('selectionUpdate', updateCurrentLevel);
        editor.on('transaction', updateCurrentLevel);

        return () => {
            editor.off('selectionUpdate', updateCurrentLevel);
            editor.off('transaction', updateCurrentLevel);
        };
    }, [editor]);

    if (!editor) {
        return null;
    }

    return (
        <Select
            data-testid={dataTestId}
            value={currentLevel}
            onChange={(event): void => {
                if (event.target.value === 'p') {
                    editor.chain().focus().setParagraph().run();

                    return;
                }

                editor
                    .chain()
                    .focus()
                    .setHeading({ level: event.target.value as Level })
                    .run();
            }}
            sx={{
                padding: '4px',
                color: (theme): string => theme.palette.text.secondary,
                '&::before': { display: 'none' },
            }}
            variant={'standard'}
        >
            {levels.map((level): React.JSX.Element => (
                <MenuItem key={level} value={level}>
                    Heading {level}
                </MenuItem>
            ))}
            <MenuItem value={'p'}>Paragraph</MenuItem>
        </Select>
    );
}
