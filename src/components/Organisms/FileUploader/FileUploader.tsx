import React, { useRef, useState, useCallback } from 'react';
import { Box, Stack, Typography, Button, Collapse, Tooltip, CircularProgress } from '@mui/material';
import FileUploadOutlinedIcon from '@mui/icons-material/FileUploadOutlined';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import {
    FileUploaderProps,
    FileUploaderSize,
    FileUploaderStatus,
    type FileUploaderLabels,
} from './fileUploader.types.js';
import { DropzoneContainer, UploadIconContainer, FileItem } from './components/index.js';
import { TextField } from '../../Atoms/TextField/TextField.js';
import { ClearOutlined } from '@mui/icons-material';
import { useRingDataTestId } from '../../../helpers/hooks/useRingDataTestId.js';
import { tv } from '../../../helpers/typographyMode.js';

interface DropzoneContentProps {
    labels: FileUploaderLabels;
    errorMessage?: string;
    isDragging: boolean;
    size: FileUploaderSize;
    onBrowseClick: () => void;
    actionSlot?: React.ReactNode;
    dataTestId: string;
}

const SmallDropzoneContent: React.FC<DropzoneContentProps> = ({
    labels,
    errorMessage,
    isDragging,
    size,
    onBrowseClick,
    actionSlot,
    dataTestId,
}) => (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <UploadIconContainer isError={Boolean(errorMessage)} isDragging={isDragging} size={size}>
            <FileUploadOutlinedIcon sx={{ fontSize: tv('1rem') }} />
        </UploadIconContainer>
        <Stack sx={{ gap: '2px' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                <Typography variant="body1">{labels.dropzone} </Typography>
                <Typography
                    data-testid={`${dataTestId}-browse`}
                    variant="body1"
                    color="primary"
                    onClick={onBrowseClick}
                    sx={{
                        textDecoration: 'underline',
                        cursor: 'pointer',
                    }}
                >
                    {labels.uploadButton}
                </Typography>
                {actionSlot}
                {labels.hint && (
                    <Tooltip title={labels.hint} arrow={true} placement="top">
                        <Box
                            component="span"
                            sx={{ display: 'inline-flex', alignItems: 'center', pointerEvents: 'auto' }}
                        >
                            <InfoOutlinedIcon sx={{ fontSize: 'medium', color: 'text.secondary' }} />
                        </Box>
                    </Tooltip>
                )}
            </Box>
            {errorMessage && (
                <Typography variant="body2" color="error">
                    {errorMessage}
                </Typography>
            )}
        </Stack>
    </Box>
);

const MediumDropzoneContent: React.FC<DropzoneContentProps> = ({
    labels,
    errorMessage,
    isDragging,
    size,
    onBrowseClick,
    actionSlot,
    dataTestId,
}) => (
    <Stack spacing={1} alignItems="center">
        <UploadIconContainer isError={Boolean(errorMessage)} isDragging={isDragging} size={size}>
            <FileUploadOutlinedIcon fontSize="large" />
        </UploadIconContainer>
        <Typography variant="subtitle1">{labels.dropzone}</Typography>
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            <Button data-testid={`${dataTestId}-browse`} variant="contained" size="medium" onClick={onBrowseClick}>
                {labels.uploadButton.toUpperCase()}
            </Button>
            {actionSlot}
        </Box>
        {labels.hint && !errorMessage && (
            <Typography variant="body2" color="text.secondary">
                {labels.hint}
            </Typography>
        )}
        {errorMessage && (
            <Typography variant="body2" color="error">
                {errorMessage}
            </Typography>
        )}
    </Stack>
);

const LargeDropzoneContent: React.FC<DropzoneContentProps> = ({
    labels,
    errorMessage,
    isDragging,
    size,
    onBrowseClick,
    actionSlot,
    dataTestId,
}) => (
    <Stack spacing={3} alignItems="center">
        <UploadIconContainer isError={Boolean(errorMessage)} isDragging={isDragging} size={size}>
            <FileUploadOutlinedIcon sx={{ fontSize: (theme) => parseInt(theme.spacing(6)) }} />
        </UploadIconContainer>
        <Stack spacing={1} alignItems="center">
            <Typography variant="subtitle1">{labels.dropzone}</Typography>
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                <Button data-testid={`${dataTestId}-browse`} variant="contained" size="medium" onClick={onBrowseClick}>
                    {labels.uploadButton.toUpperCase()}
                </Button>
                {actionSlot}
            </Box>
            {labels.hint && !errorMessage && (
                <Typography variant="body2" color="text.secondary">
                    {labels.hint}
                </Typography>
            )}
            {errorMessage && (
                <Typography variant="body2" color="error">
                    {errorMessage}
                </Typography>
            )}
        </Stack>
    </Stack>
);

interface UrlUploadSectionProps {
    title?: string;
    placeholder?: string;
    submitButton?: string;
    urlValue: string;
    onUrlValueChange: (value: string) => void;
    onSubmit: () => void;
    onClear?: () => void;
    textFieldProps?: React.ComponentProps<typeof TextField>;
    loading?: boolean;
    dataTestId: string;
}

const UrlUploadSection: React.FC<UrlUploadSectionProps> = ({
    title,
    placeholder,
    submitButton,
    urlValue,
    onUrlValueChange,
    onSubmit,
    onClear,
    textFieldProps,
    loading = false,
    dataTestId,
}) => (
    <Box>
        <Typography variant="subtitle2" sx={{ mb: 1 }}>
            {title}
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
            <TextField
                dataTestIdSuffix={`${dataTestId}-url-input`}
                actions={
                    urlValue
                        ? [
                              {
                                  icon: <ClearOutlined />,
                                  onClick: (): void => {
                                      onUrlValueChange('');
                                      onClear?.();
                                  },
                                  label: 'Clear',
                              },
                          ]
                        : []
                }
                fullWidth={true}
                size="small"
                placeholder={placeholder}
                value={urlValue}
                onChange={(e): void => onUrlValueChange(e.target.value)}
                onKeyPress={(e): void => {
                    if (e.key === 'Enter' && !loading) {
                        onSubmit();
                    }
                }}
                disabled={loading}
                {...textFieldProps}
            />
            <Button
                data-testid={`${dataTestId}-url-submit`}
                variant="outlined"
                onClick={onSubmit}
                disabled={loading}
                sx={{ minWidth: 156 }}
                startIcon={loading ? <CircularProgress size={20} sx={{ color: 'action.disabled' }} /> : undefined}
            >
                {submitButton?.toUpperCase()}
            </Button>
        </Box>
    </Box>
);

export function FileUploader(props: FileUploaderProps): React.JSX.Element {
    const {
        sx = {},
        onFilesSelected,
        onRemove,
        onRetry,
        maxFileSize,
        accept,
        multiple = false,
        headline,
        labels,
        files: controlledFiles,
        initiallyCollapsed = false,
        size = FileUploaderSize.Medium,
        errorMessage,
        action,
        slotProps,
        dataTestIdSuffix,
        ...otherProps
    } = props;

    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [urlValue, setUrlValue] = useState('');
    const [isCollapsed, setIsCollapsed] = useState(initiallyCollapsed);

    const dataTestId = useRingDataTestId(FileUploader.name, dataTestIdSuffix);

    const files = controlledFiles || [];

    const validateFile = useCallback(
        (file: File): string | null => {
            if (maxFileSize && file.size > maxFileSize) {
                return `File size exceeds ${maxFileSize} bytes`;
            }

            return null;
        },
        [maxFileSize],
    );

    const handleFiles = useCallback(
        (selectedFiles: FileList | null): void => {
            if (!selectedFiles) {
                return;
            }

            const filesArray = Array.from(selectedFiles);
            const validFiles: File[] = [];

            filesArray.forEach((file) => {
                const error = validateFile(file);

                if (!error) {
                    validFiles.push(file);
                }
            });

            if (validFiles.length > 0) {
                onFilesSelected?.(validFiles);
            }
        },
        [onFilesSelected, validateFile],
    );

    const handleDragEnter = (e: React.DragEvent): void => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent): void => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    };

    const handleDragOver = (e: React.DragEvent): void => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleDrop = (e: React.DragEvent): void => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);

        const droppedFiles = e.dataTransfer.files;

        handleFiles(droppedFiles);
    };

    const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
        handleFiles(e.target.files);
        // Reset input value to allow selecting the same file again
        e.target.value = '';
    };

    const handleBrowseClick = (): void => {
        fileInputRef.current?.click();
    };

    const handleRemove = (fileId: string): void => {
        onRemove?.(fileId);
    };

    const handleUrlSubmit = (url: string): void => {
        if (url.trim()) {
            slotProps?.urlUploadSection?.onSubmit?.(url);
        }
    };

    const hasFiles = files.length > 0;
    const shouldShowDropzone = multiple || !hasFiles;

    return (
        <Stack spacing={2} sx={{ width: '100%', height: '100%', ...sx }} {...otherProps}>
            <Stack spacing={1}>
                <Box>
                    <Typography variant="headline2" sx={{ mb: 1 }}>
                        {headline}
                    </Typography>
                    {labels.description && (
                        <Typography variant="body1" color="text.secondary">
                            {labels.description}
                        </Typography>
                    )}
                </Box>
            </Stack>

            {shouldShowDropzone && (
                <DropzoneContainer
                    data-testid={dataTestId}
                    size={size}
                    isError={Boolean(errorMessage)}
                    className={isDragging ? 'drag-over' : ''}
                    onDragEnter={handleDragEnter}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                >
                    {size === FileUploaderSize.Small && (
                        <SmallDropzoneContent
                            labels={labels}
                            errorMessage={errorMessage}
                            isDragging={isDragging}
                            size={size}
                            onBrowseClick={handleBrowseClick}
                            actionSlot={action}
                            dataTestId={dataTestId}
                        />
                    )}
                    {size === FileUploaderSize.Medium && (
                        <MediumDropzoneContent
                            labels={labels}
                            errorMessage={errorMessage}
                            isDragging={isDragging}
                            size={size}
                            onBrowseClick={handleBrowseClick}
                            actionSlot={action}
                            dataTestId={dataTestId}
                        />
                    )}
                    {size === FileUploaderSize.Large && (
                        <LargeDropzoneContent
                            labels={labels}
                            errorMessage={errorMessage}
                            isDragging={isDragging}
                            size={size}
                            onBrowseClick={handleBrowseClick}
                            actionSlot={action}
                            dataTestId={dataTestId}
                        />
                    )}
                </DropzoneContainer>
            )}
            <input
                data-testid={`${dataTestId}-input`}
                ref={fileInputRef}
                type="file"
                multiple={multiple}
                accept={accept}
                onChange={handleFileInputChange}
                style={{ display: 'none' }}
            />

            {slotProps?.urlUploadSection?.enabled && (
                <UrlUploadSection
                    title={slotProps?.urlUploadSection?.title}
                    placeholder={slotProps?.urlUploadSection?.placeholder}
                    submitButton={slotProps?.urlUploadSection?.submitButton}
                    textFieldProps={slotProps?.urlUploadSection?.textFieldProps}
                    loading={slotProps?.urlUploadSection?.loading}
                    onClear={slotProps?.urlUploadSection?.onClear}
                    urlValue={urlValue}
                    onUrlValueChange={setUrlValue}
                    onSubmit={(): void => handleUrlSubmit(urlValue)}
                    dataTestId={dataTestId}
                />
            )}

            {hasFiles && multiple && (
                <Box>
                    <Button
                        data-testid={`${dataTestId}-expand`}
                        onClick={(): void => setIsCollapsed(!isCollapsed)}
                        variant="text"
                        startIcon={
                            <ExpandMoreIcon
                                sx={{
                                    transform: isCollapsed ? 'rotate(-90deg)' : 'rotate(0deg)',
                                    transition: 'transform 0.3s',
                                }}
                            />
                        }
                        sx={{
                            textTransform: 'none',
                            color: 'text.secondary',
                            fontWeight: 'normal',
                            mb: 1,
                            p: 0,
                            '&:hover': {
                                backgroundColor: 'transparent',
                                color: 'text.primary',
                            },
                        }}
                    >
                        {(labels.filesUploaded ?? '{uploaded} of {total} files uploaded')
                            .replace(
                                '{uploaded}',
                                String(
                                    files.filter(
                                        (f) =>
                                            f.status === FileUploaderStatus.Completed ||
                                            f.status === FileUploaderStatus.Success ||
                                            f.status === FileUploaderStatus.Idle,
                                    ).length,
                                ),
                            )
                            .replace('{total}', String(files.length))}
                    </Button>
                    <Collapse in={!isCollapsed}>
                        <Stack spacing={1}>
                            {files.map((file) => (
                                <FileItem
                                    key={file.id}
                                    uploadedFile={file}
                                    onRemove={handleRemove}
                                    onRetry={onRetry}
                                    onFilesSelected={onFilesSelected}
                                    accept={accept}
                                    dataTestIdPrefix={dataTestId}
                                />
                            ))}
                        </Stack>
                    </Collapse>
                </Box>
            )}

            {hasFiles && !multiple && (
                <Stack spacing={1}>
                    {files.map((file) => (
                        <FileItem
                            key={file.id}
                            uploadedFile={file}
                            onRemove={handleRemove}
                            onRetry={onRetry}
                            onFilesSelected={onFilesSelected}
                            accept={accept}
                            dataTestIdPrefix={dataTestId}
                        />
                    ))}
                </Stack>
            )}
        </Stack>
    );
}

export { FileUploaderSize, FileUploaderStatus } from './fileUploader.types.js';
export type { FileUploaderProps, FileUploaderFile, UploadedFile } from './fileUploader.types.js';
