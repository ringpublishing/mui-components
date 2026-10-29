import React, { useRef } from 'react';
import { EllipsisVertical } from 'lucide-react';
import { IconButton, Box } from '@mui/material';
import { GridRenderCellParams, useGridRootProps } from '@mui/x-data-grid';
import { Action } from '../../../types.js';
import { getLucideSizeFromComponentSize } from '../../../helpers/lucideSize.js';
import { resolveMoreActionsAriaLabel } from '../../../helpers/moreActionsAriaLabel.js';
import { ActionBox } from '../../Molecules/ActionBox/ActionBox.js';
import { useCellDataTestId } from './dataGridTestIdContext.js';

export interface ActionCellProps {
    /**
     * Actions list shown in Action Box
     */
    actions: Action[];
}

export interface ActionCellLabels {
    /**
     * Accessible name of the row actions button.
     * @defaultValue 'More actions'
     */
    moreActions?: string;
}

/**
 * Creates a `renderCell` renderer for a row actions column with localizable labels.
 */
export function createActionCellRenderer(
    labels?: ActionCellLabels,
): <T extends ActionCellProps>(params: GridRenderCellParams<Array<T>>) => React.JSX.Element {
    const moreActionsLabel = resolveMoreActionsAriaLabel(labels?.moreActions);

    return function actionCellRenderer<T extends ActionCellProps>(
        params: GridRenderCellParams<Array<T>>,
    ): React.JSX.Element {
        const { value: actions } = params;
        const anchorRef = useRef<HTMLButtonElement>(null);
        const dataTestId = useCellDataTestId(params.id as string | number, params.field);
        const rootProps = useGridRootProps();
        const size = rootProps.density === 'compact' ? 'small' : 'medium';
        const iconSize = getLucideSizeFromComponentSize(size);

        return (
            <Box sx={{ height: '100%', alignContent: 'center' }}>
                <IconButton
                    ref={anchorRef}
                    data-testid={dataTestId}
                    size={size}
                    aria-label={moreActionsLabel}
                    onClick={(e): void => {
                        e.stopPropagation();
                        document.dispatchEvent(new MouseEvent('click', {}));
                    }}
                >
                    <EllipsisVertical size={iconSize} />
                </IconButton>
                <ActionBox actions={actions} anchorEl={anchorRef} dataTestId={`${dataTestId}-menu`} />
            </Box>
        );
    };
}

const defaultActionCellRenderer = createActionCellRenderer();

export function renderActionCell<T extends ActionCellProps>(params: GridRenderCellParams<Array<T>>): React.JSX.Element {
    return defaultActionCellRenderer(params);
}
