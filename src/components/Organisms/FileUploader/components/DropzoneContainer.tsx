import { Box, styled } from '@mui/material';
import { FileUploaderSize } from '../fileUploader.types.js';

interface DropzoneContainerProps {
    size?: FileUploaderSize;
    isError?: boolean;
}

const sizeConfig = {
    [FileUploaderSize.Small]: {
        width: '100%',
        height: 'auto',
        minHeight: 40,
        padding: { vertical: 1, horizontal: 3 }, // 8px 24px
    },
    [FileUploaderSize.Medium]: {
        width: '100%',
        height: 'auto',
        minHeight: undefined,
        padding: { vertical: 3, horizontal: 3 }, // 24px 24px
    },
    [FileUploaderSize.Large]: {
        width: '100%',
        height: '100%',
        minHeight: undefined,
        padding: { vertical: 3, horizontal: 2 }, // 24px 16px
    },
};

export const DropzoneContainer = styled(Box, {
    shouldForwardProp: (prop) => prop !== 'isError' && prop !== 'size',
})<DropzoneContainerProps>(({ theme, size = FileUploaderSize.Medium, isError = false }) => {
    const config = sizeConfig[size];

    return {
        width: config.width,
        height: config.height,
        ...(config.minHeight ? { minHeight: `${config.minHeight}px` } : {}),
        border: isError ? `1px solid ${theme.palette.error.main}` : `1px dashed ${theme.colors.RingGrey[200]}`,
        borderRadius: theme.shape.borderRadius,
        backgroundColor: isError ? theme.colors.RingBrandRed[50] : 'transparent',
        padding: theme.spacing(config.padding.vertical, config.padding.horizontal),
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: theme.spacing(3),
        transition: 'border-color 0.2s',
        '&:hover': !isError
            ? {
                  borderColor: theme.colors.RingBlue[500],
              }
            : {},
        '&.drag-over': {
            backgroundColor: theme.colors.RingBlue[50],
            borderColor: theme.colors.RingBlue[500],
            '& *': {
                pointerEvents: 'none',
            },
        },
    };
});
