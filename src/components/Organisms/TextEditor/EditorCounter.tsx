import React from 'react';
import { useCurrentEditor } from '@tiptap/react';
import { Grid } from '@mui/material';
import { Warning } from '@mui/icons-material';

export interface EditorCounterProps {
    /**
     * The character limit.
     */
    limit: number;
}

export function EditorCounter(props: EditorCounterProps): React.JSX.Element | null {
    const { limit } = props;
    const { editor } = useCurrentEditor();

    if (!editor) {
        return null;
    }

    const characterCount = editor.storage.characterCount?.characters() || 0;
    const limitExceeded = characterCount > limit;

    return (
        <Grid container={true} justifyContent="flex-end" spacing="2" sx={{ paddingRight: '16px' }}>
            {limitExceeded && <Warning sx={{ color: '#f5ca1d', marginRight: '5px' }} />}
            <span style={limitExceeded ? { color: 'red' } : {}}>{characterCount}</span>&nbsp;/&nbsp;<span>{limit}</span>
        </Grid>
    );
}
