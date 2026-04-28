import React from 'react';
import { Box, Typography, IconButton, LinearProgress, CircularProgress, Button, useTheme } from '@mui/material';
import UploadFileOutlinedIcon from '@mui/icons-material/UploadFileOutlined';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import RefreshIcon from '@mui/icons-material/Refresh';
import { FileUploaderFile, FileUploaderStatus } from '../fileUploader.types.js';
import { FileItemContainer } from './FileItemContainer.js';
import { ThumbnailBox } from './ThumbnailBox.js';
import { formatFileSize } from '../helpers/formatFileSize.js';
import { tv } from '../../../../helpers/typographyMode.js';

interface FileItemProps {
    uploadedFile: FileUploaderFile;
    onRemove: (fileId: string) => void;
    onRetry?: (fileId: string) => void;
    onFilesSelected?: (files: File[]) => void;
    accept?: string;
    dataTestIdPrefix: string;
}

export function FileItem({
    uploadedFile,
    onRemove,
    onRetry,
    onFilesSelected,
    accept,
    dataTestIdPrefix,
}: FileItemProps): React.JSX.Element {
    const fileInputRef = React.useRef<HTMLInputElement>(null);
    const theme = useTheme();
    const status = uploadedFile.status ?? FileUploaderStatus.Idle;
    const isIdle = status === FileUploaderStatus.Idle;
    const isUploading = status === FileUploaderStatus.Uploading;
    const isCompleted = status === FileUploaderStatus.Success || status === FileUploaderStatus.Completed;
    const isError = status === FileUploaderStatus.Error;
    const fileName = uploadedFile.name || uploadedFile.file?.name || 'Unknown file';
    const totalSizeBytes = uploadedFile.size ?? uploadedFile.file?.size ?? 0;
    const progress = uploadedFile.progress ?? 0;
    const showProgressBar = uploadedFile.showProgressBar !== undefined ? uploadedFile.showProgressBar : !isIdle;

    const uploadedBytes =
        uploadedFile.uploadedBytes !== undefined
            ? uploadedFile.uploadedBytes
            : totalSizeBytes > 0
              ? (progress / 100) * totalSizeBytes
              : 0;

    const hasAction = Boolean(uploadedFile.action);

    const handleRemove = (): void => {
        onRemove(uploadedFile.id);
    };

    const handleActionClick = (): void => {
        if (uploadedFile.action?.onClick) {
            uploadedFile.action.onClick();
        } else {
            fileInputRef.current?.click();
        }
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
        const selectedFiles = event.target.files;

        if (selectedFiles && selectedFiles.length > 0 && onFilesSelected) {
            onFilesSelected([selectedFiles[0]]);
        }

        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const iconColor = isError
        ? 'error.main'
        : isCompleted
          ? 'success.main'
          : isIdle
            ? 'text.secondary'
            : 'primary.main';

    const iconFontSize = tv('1.5rem')(theme);

    const defaultIcon = (
        <UploadFileOutlinedIcon
            sx={{
                fontSize: iconFontSize,
                color: iconColor,
            }}
        />
    );

    return (
        <FileItemContainer data-testid={`${dataTestIdPrefix}-file-${uploadedFile.id}`} isError={isError}>
            <ThumbnailBox>
                {uploadedFile.icon
                    ? React.cloneElement(uploadedFile.icon as React.ReactElement<{ sx?: Record<string, unknown> }>, {
                          sx: {
                              fontSize: iconFontSize,
                              color: iconColor,
                              ...(uploadedFile.icon as React.ReactElement<{ sx?: Record<string, unknown> }>).props?.sx,
                          },
                      })
                    : defaultIcon}
            </ThumbnailBox>
            <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography
                    variant="subtitle1"
                    color={isError ? 'error.main' : 'text.primary'}
                    sx={{
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                    }}
                >
                    {fileName}
                </Typography>
                {!hasAction && !isError && (
                    <Typography variant="body2" color="text.secondary">
                        {progress < 100
                            ? `${formatFileSize(uploadedBytes)} / ${formatFileSize(totalSizeBytes)}`
                            : formatFileSize(totalSizeBytes)}
                    </Typography>
                )}
                {!hasAction && isError && uploadedFile.errorMessage && (
                    <Typography variant="body2" color="error.main" sx={{ mt: 0.5 }}>
                        {uploadedFile.errorMessage}
                    </Typography>
                )}
                {!hasAction && showProgressBar && (
                    <Box sx={{ mt: '4px' }}>
                        <LinearProgress
                            variant="determinate"
                            value={progress}
                            color={isError ? 'error' : isCompleted ? 'success' : 'primary'}
                        />
                    </Box>
                )}
            </Box>
            <Box sx={{ minWidth: 14, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 2 }}>
                {hasAction && uploadedFile.action && (
                    <Button
                        data-testid={`${dataTestIdPrefix}-file-${uploadedFile.id}-action`}
                        variant="text"
                        onClick={handleActionClick}
                        sx={{ textTransform: 'none' }}
                    >
                        {uploadedFile.action.label}
                    </Button>
                )}

                {!hasAction && !isError && !isIdle && (
                    <Typography variant="body2" color="text.secondary" sx={{ minWidth: 4, textAlign: 'right' }}>
                        {isUploading ? `${progress}%` : '100%'}
                    </Typography>
                )}
                {!hasAction && isUploading && <CircularProgress size={16} />}
                {!hasAction && isCompleted && (
                    <CheckCircleOutlineIcon fontSize="small" sx={{ color: 'success.main' }} />
                )}
                {!hasAction && isError && <ErrorOutlineIcon fontSize="small" sx={{ color: 'error.main' }} />}
                {!hasAction && isError && onRetry && (
                    <IconButton
                        data-testid={`${dataTestIdPrefix}-file-${uploadedFile.id}-retry`}
                        size="small"
                        onClick={(): void => onRetry(uploadedFile.id)}
                        sx={{ color: 'text.secondary' }}
                    >
                        <RefreshIcon fontSize="small" />
                    </IconButton>
                )}

                {uploadedFile?.showRemove && (
                    <IconButton
                        data-testid={`${dataTestIdPrefix}-file-${uploadedFile.id}-remove`}
                        size="small"
                        onClick={handleRemove}
                        sx={{ color: 'text.secondary' }}
                    >
                        <DeleteOutlineOutlinedIcon fontSize="small" />
                    </IconButton>
                )}
            </Box>
            {hasAction && (
                <input
                    data-testid={`${dataTestIdPrefix}-file-${uploadedFile.id}-input`}
                    ref={fileInputRef}
                    type="file"
                    accept={accept}
                    style={{ display: 'none' }}
                    onChange={handleFileChange}
                />
            )}
        </FileItemContainer>
    );
}
