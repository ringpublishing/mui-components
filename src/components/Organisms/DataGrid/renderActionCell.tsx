import React, { useRef } from 'react';
import { MoreVert } from '@mui/icons-material';
import { IconButton, Box } from '@mui/material';
import { GridRenderCellParams, useGridRootProps } from '@mui/x-data-grid';
import { Action } from '../../../types.js';
import { ActionBox } from '../../Molecules/ActionBox/ActionBox.js';

export interface ActionCellProps {
    /**
     * Actions list shown in Action Box
     */
    actions: Action[];
}

export function renderActionCell<T extends ActionCellProps>(params: GridRenderCellParams<Array<T>>): React.JSX.Element {
    const { value: actions } = params;
    const anchorRef = useRef<HTMLButtonElement>(null);
    const rootProps = useGridRootProps();
    const size = rootProps.density === 'compact' ? 'small' : 'medium';

    return (
        <Box sx={{ height: '100%', alignContent: 'center' }}>
            <IconButton
                ref={anchorRef}
                size={size}
                onClick={(e): void => {
                    document.dispatchEvent(new MouseEvent('click', {}));
                }}
            >
                <MoreVert fontSize={size} />
            </IconButton>
            <ActionBox actions={actions} anchorEl={anchorRef} />
        </Box>
    );
}
