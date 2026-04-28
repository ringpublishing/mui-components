import React from 'react';
import { GridRow, GridRowProps, GridRowHeightParams, GridRowHeightReturnValue, DataGridProps } from '@mui/x-data-grid';
import { CalendarMonth } from '@mui/icons-material';
import { GridSpacer } from '../../internal/GridSpacer.js';

export interface SpacerItemProps {
    id?: string | number;
    title: string;
    icon?: React.ReactNode;
    color?: string;
}

export interface SpacerItem {
    id: string | number;
    separator: {
        title: string;
        icon: React.ReactNode;
        color: string;
    };
}

export const SEPARATOR_ROW_HEIGHT = 30;

export const createSpacerItem = (props: SpacerItemProps): SpacerItem => {
    const { id, title, icon, color } = props;

    return {
        id: `spacer-${id || Math.random().toString(16).slice(2)}`,
        separator: {
            title,
            color: color || 'secondary',
            icon: icon || <CalendarMonth fontSize="small" />,
        },
    };
};

export const CustomGridRow = (props: GridRowProps): React.ReactNode => {
    if (props?.row && props.row.separator) {
        return (
            <GridSpacer
                separator={props.row.separator}
                withTopBorder={Boolean(props?.index)}
                withBottomBorder={false}
            />
        );
    }

    return <GridRow {...props} />;
};

export type UseSpacerProps = Pick<DataGridProps, 'getEstimatedRowHeight' | 'getRowHeight' | 'slots'>;

export const useSpacer = (props: UseSpacerProps): UseSpacerProps => {
    return {
        slots: {
            row: CustomGridRow,
            ...(props?.slots ? props?.slots : {}),
        },
        getEstimatedRowHeight: (params: GridRowHeightParams): number | null => {
            if (params.model.separator) {
                return SEPARATOR_ROW_HEIGHT;
            } else if (props.getEstimatedRowHeight) {
                return props.getEstimatedRowHeight(params);
            }

            return null;
        },
        getRowHeight: (params: GridRowHeightParams): GridRowHeightReturnValue => {
            if (params.model.separator) {
                return SEPARATOR_ROW_HEIGHT;
            } else if (props?.getRowHeight) {
                return props.getRowHeight(params);
            }

            return null;
        },
    };
};
