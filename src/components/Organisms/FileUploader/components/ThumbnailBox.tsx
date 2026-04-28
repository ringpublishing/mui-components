import { Box, styled } from '@mui/material';

export const ThumbnailBox = styled(Box)(({ theme }) => ({
    width: theme.spacing(7),
    height: theme.spacing(7),
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '4px',
    flexShrink: 0,
}));
