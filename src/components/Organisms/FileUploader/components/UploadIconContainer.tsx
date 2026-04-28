import { Box, styled } from '@mui/material';
import { FileUploaderSize } from '../fileUploader.types.js';

interface UploadIconContainerProps {
    isError?: boolean;
    isDragging?: boolean;
    size?: FileUploaderSize;
}

export const UploadIconContainer = styled(Box, {
    shouldForwardProp: (prop) => prop !== 'isError' && prop !== 'isDragging',
})<UploadIconContainerProps>(({ theme, isError = false, isDragging = false, size = FileUploaderSize.Medium }) => {
    const getContainerSize = (): number => {
        switch (size) {
            case FileUploaderSize.Small:
                return 3; // 24px
            case FileUploaderSize.Medium:
                return 8; // 64px
            case FileUploaderSize.Large:
                return 11; // 88px
            default:
                return 8; // 64px
        }
    };

    const containerSize = getContainerSize();

    return {
        width: theme.spacing(containerSize),
        height: theme.spacing(containerSize),
        borderRadius: '50%',
        backgroundColor: isError
            ? theme.colors.RingBrandRed[100]
            : isDragging
              ? theme.colors.RingBlue[100]
              : theme.palette.grey[100],
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'background-color 0.2s, color 0.2s',
        color: isError
            ? theme.palette.error.main
            : isDragging
              ? theme.colors.RingBlue[500]
              : theme.palette.action.active,
        '& .MuiSvgIcon-root': {
            color: 'inherit',
        },
    };
});
