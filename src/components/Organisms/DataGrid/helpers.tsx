import React, { RefObject, ReactNode } from 'react';
import { Chip } from '@mui/material';
import { GridApi, GridRowHeightReturnValue, GridRowId, GridRowParams } from '@mui/x-data-grid';

import { ComboCellChips } from './renderComboCell.js';
import { Placeholder, PlaceholderStateLabels, PlaceholderVariant } from '../../Molecules/Placeholder/Placeholder.js';
import { Action } from '../../../types.js';
import { CommonLanguages } from '../../../helpers/commonTypes.js';
import { GridRowSelectionModel } from '@mui/x-data-grid-pro';

interface preparedChipsType {
    chips: ReactNode[];
    additionalChips: Pick<Action, 'label'>[];
}

export const prepareChips = (chips: ComboCellChips): preparedChipsType => {
    const result: preparedChipsType = {
        chips: [],
        additionalChips: [],
    };

    if (typeof chips === 'string') {
        result.chips.push(<Chip label={chips} size="small" key={'combo-chip'} />);
    } else if (Array.isArray(chips)) {
        for (let i = 0; i < chips.length; i++) {
            const chip = chips[i];

            if (i < 3) {
                const data = typeof chip === 'string' ? { label: chip } : chip;

                result.chips.push(<Chip {...data} size="small" key={`combo-chip-${i}`} />);
            } else if (typeof chip === 'string') {
                result.additionalChips.push({ label: chip });
            } else {
                const label = chip?.label;

                if (typeof label === 'string') {
                    result.additionalChips.push({ label });
                }
            }
        }
    }

    return result;
};

interface getCellViewModeProps {
    getRowHeight: GridRowHeightReturnValue;
    rowHeight: number;
    density?: string;
}

export const getCellViewMode = ({ getRowHeight, rowHeight, density }: getCellViewModeProps): string => {
    if (getRowHeight === 'auto' || (typeof getRowHeight === 'number' && getRowHeight >= 100) || rowHeight >= 100) {
        return 'full';
    } else if (
        (typeof getRowHeight === 'number' && getRowHeight > 52 && getRowHeight <= 105) ||
        (rowHeight > 53 && rowHeight <= 105) ||
        density === 'standard'
    ) {
        return 'medium';
    } else {
        return 'small';
    }
};

export interface CanSelectRowParams {
    allSelected: boolean;
    enableBulkActions?: boolean;
    rowSelectionModel: GridRowSelectionModel;
    maxRowsCount: number;
    deselectedRowIds: Set<GridRowId>;
    apiRef: RefObject<GridApi | null>;
}

export const canSelectRow =
    ({
        allSelected,
        enableBulkActions,
        rowSelectionModel,
        maxRowsCount,
        deselectedRowIds,
        apiRef,
    }: CanSelectRowParams) =>
    (params: GridRowParams): boolean => {
        const id = params.id;

        if (!apiRef.current) {
            return false;
        }

        const alreadySelected = [...apiRef.current.state.rowSelection.ids];

        if (typeof id === 'string' && id.includes('spacer')) {
            return false;
        }

        if (allSelected && enableBulkActions) {
            const itemsLeftToSelect = maxRowsCount - alreadySelected.length + deselectedRowIds.size > 0;
            const areAllSelectedVisible = rowSelectionModel.ids.size < maxRowsCount;

            return itemsLeftToSelect || areAllSelectedVisible || rowSelectionModel.ids.has(id);
        }

        return rowSelectionModel.ids.size < maxRowsCount || rowSelectionModel.ids.has(id);
    };

export function CustomNoRowsOverlay(
    error: boolean,
    language: CommonLanguages,
    onClick?: () => void,
    placeholderLabels?: PlaceholderStateLabels,
): React.JSX.Element {
    const buttonLabel =
        placeholderLabels?.tryAgainButton ?? (language === CommonLanguages.plPL ? 'Spróbuj ponownie' : 'Try again');

    if (error) {
        return (
            <Placeholder
                {...(onClick ? { buttons: [{ children: buttonLabel, variant: 'contained', onClick }] } : {})}
                variant={PlaceholderVariant.ERROR_LIST}
                labels={placeholderLabels?.error}
            />
        );
    } else {
        return <Placeholder variant={PlaceholderVariant.NOT_FOUND} labels={placeholderLabels?.empty} />;
    }
}

interface GetSpacerAndNonSpacerRowIds {
    spacerRowIds: Set<string>;
    nonSpacerRowIds: Set<GridRowId>;
}

export const getSpacerAndNonSpacerRowIds = (allRows: any): GetSpacerAndNonSpacerRowIds => {
    const spacerRowIds = new Set<string>();
    const nonSpacerRowIds = new Set<GridRowId>();

    allRows.forEach((row: unknown, id: string | GridRowId) => {
        if (typeof id === 'string' && id.includes('spacer')) {
            spacerRowIds.add(id);
        } else {
            nonSpacerRowIds.add(id);
        }
    });

    return { spacerRowIds, nonSpacerRowIds };
};
