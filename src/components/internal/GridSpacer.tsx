import { Box, Typography } from '@mui/material';
import { SEPARATOR_ROW_HEIGHT, SpacerItemProps } from '../Organisms/DataGrid/spacer.js';
import { CommonComponentProps } from '../../helpers/commonTypes.js';

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
                borderColor: 'components.datagrid.border',
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
