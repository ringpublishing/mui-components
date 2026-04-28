import { Box, styled } from '@mui/material';

interface FileItemContainerProps {
    isError?: boolean;
}

export const FileItemContainer = styled(Box, {
    shouldForwardProp: (prop) => prop !== 'isError',
})<FileItemContainerProps>(({ theme, isError }) => ({
    width: '100%',
    border: `1px solid ${isError ? theme.palette.error.main : theme.palette.divider}`,
    borderRadius: '4px',
    padding: theme.spacing(2),
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(2),
}));
