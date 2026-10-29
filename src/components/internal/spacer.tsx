import React from 'react';
import { Box, Typography } from '@mui/material';
import { GridRow, GridRowProps, GridRowHeightParams, GridRowHeightReturnValue, DataGridProps } from '@mui/x-data-grid';
import { CalendarDays } from 'lucide-react';
import { getLucideSizeFromFontSize } from '../../helpers/lucideSize.js';
import { CommonComponentProps } from '../../helpers/commonTypes.js';

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
            icon: icon || <CalendarDays size={getLucideSizeFromFontSize('small')} />,
        },
    };
};

export interface GridSpacerProps extends CommonComponentProps {
    separator: SpacerItemProps;
    /**
     * Determines whether the separator should have a top border
     * @default true
     */
    withTopBorder?: boolean;
    /**
     * Determines whether the separator should have a bottom border
     * @default true
     */
    withBottomBorder?: boolean;
    /**
     * ARIA role for the spacer container
     * @default separator
     */
    role?: React.AriaRole;
}

export const GridSpacer = ({
    separator,
    withTopBorder = true,
    withBottomBorder = true,
    sx,
    role = 'separator',
}: GridSpacerProps): React.JSX.Element => {
    const isRow = role === 'row';

    const content = (
        <>
            {separator.icon}
            <Typography sx={{ ml: 1 }} variant="caption" color={separator.color}>
                {separator.title}
            </Typography>
        </>
    );

    return (
        <Box
            role={role}
            sx={{
                height: `${SEPARATOR_ROW_HEIGHT}px`,
                minHeight: `${SEPARATOR_ROW_HEIGHT}px`,
                maxHeight: `${SEPARATOR_ROW_HEIGHT}px`,
                width: '100%',
                boxSizing: 'border-box',
                borderTop: withTopBorder ? '1px solid' : 'none',
                borderBottom: withBottomBorder ? '1px solid' : 'none',
                // Inside a Data Grid the line takes the grid's own row-line colour; the divider is the fallback elsewhere.
                borderColor: (theme): string => `var(--DataGrid-rowBorderColor, ${theme.palette.divider})`,
                display: 'inline-flex',
                alignItems: 'center',
                paddingLeft: 2,
                ...sx,
            }}
        >
            {isRow ? (
                <Box
                    role="gridcell"
                    sx={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        width: '100%',
                    }}
                >
                    {content}
                </Box>
            ) : (
                content
            )}
        </Box>
    );
};

export const CustomGridRow = (props: GridRowProps): React.ReactNode => {
    if (props?.row && props.row.separator) {
        return (
            <GridSpacer
                separator={props.row.separator}
                withTopBorder={Boolean(props?.index)}
                withBottomBorder={false}
                role="row"
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
