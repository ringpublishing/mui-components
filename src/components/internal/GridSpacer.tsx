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
}

export const GridSpacer = ({
    separator,
    withTopBorder = true,
    withBottomBorder = true,
    sx,
}: GridSpacerProps): React.JSX.Element => {
    return (
        <Box
            role="separator"
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
            {separator.icon}
            <Typography sx={{ ml: 1 }} variant="caption" color={separator.color}>
                {separator.title}
            </Typography>
        </Box>
    );
};
