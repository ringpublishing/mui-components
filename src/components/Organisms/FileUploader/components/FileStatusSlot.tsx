import React from 'react';
import { Box, Typography, IconButton, CircularProgress, useTheme } from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import RefreshIcon from '@mui/icons-material/Refresh';
import { FileUploaderStatus } from '../fileUploader.types.js';
import { tv } from '../../../../helpers/typographyMode.js';

interface FileStatusSlotProps {
    status?: FileUploaderStatus;
    progress: number;
    onRetry?: () => void;
    retryDataTestId?: string;
}

export const FileStatusSlot: React.FC<FileStatusSlotProps> = ({
    status = FileUploaderStatus.Uploading,
    progress,
    onRetry,
    retryDataTestId,
}) => {
    const theme = useTheme();
    const iconFontSize = tv('1.25rem')(theme);

    const statusComponents: Record<string, React.ReactNode> = {
        [FileUploaderStatus.Uploading]: (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, justifyContent: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                    {progress}%
                </Typography>
                <CircularProgress size={16} />
            </Box>
        ),

        [FileUploaderStatus.Success]: (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, justifyContent: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                    100%
                </Typography>
                <CheckCircleOutlineIcon sx={{ fontSize: iconFontSize, color: 'success.main' }} />
            </Box>
        ),

        [FileUploaderStatus.Completed]: (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, justifyContent: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                    100%
                </Typography>
                <CheckCircleOutlineIcon sx={{ fontSize: iconFontSize, color: 'success.main' }} />
            </Box>
        ),

        /** Idle renders no status indicator — grey icon and no progress bar are handled at the file row level. */
        [FileUploaderStatus.Idle]: null,

        [FileUploaderStatus.Error]: (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, justifyContent: 'center' }}>
                <ErrorOutlineIcon sx={{ fontSize: iconFontSize, color: 'error.main' }} />
                {onRetry && (
                    <IconButton
                        data-testid={retryDataTestId}
                        size="small"
                        onClick={onRetry}
                        sx={{ color: 'text.secondary' }}
                    >
                        <RefreshIcon fontSize="small" />
                    </IconButton>
                )}
            </Box>
        ),
    };

    return <>{statusComponents[status] || null}</>;
};
