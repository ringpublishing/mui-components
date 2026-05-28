import { Action } from '../../../types.js';
import React from 'react';
import { ClearIcon, usePickerContext } from '@mui/x-date-pickers-pro';
import { IconButton } from '@mui/material';
import { MoreVert } from '@mui/icons-material';
import { ActionBox } from '../../Molecules/ActionBox/ActionBox.js';

export function ActionsWithClearIconButton({
    actions,
    anchorRef,
}: {
    actions: Action[];
    anchorRef: React.RefObject<HTMLButtonElement | null>;
}) {
    const pickerContext = usePickerContext();

    return (
        <>
            <IconButton size="small" aria-label="Clear">
                <ClearIcon fontSize="small" onClick={() => pickerContext.clearValue()} />
            </IconButton>
            <IconButton size="small" aria-label="More" ref={anchorRef} sx={{ ml: '1', p: '0.5' }}>
                <MoreVert />
            </IconButton>
            <ActionBox actions={actions} anchorEl={anchorRef} placement="bottom-end" tooltipPlacement="right" />
        </>
    );
}
