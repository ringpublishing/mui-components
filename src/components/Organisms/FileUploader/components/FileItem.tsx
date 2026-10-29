import React from 'react';
import { IconButton, LinearProgress, CircularProgress, Button } from '@mui/material';
import { CircleAlert, CircleCheck, FileUp, RotateCw, Trash2 } from 'lucide-react';
import type { RingFileUploaderOwnerState } from '@ringpublishing/mui-theme';
import { RingLucideIcon } from '../../../../helpers/RingLucideIcon.js';
import { FileUploaderFile, FileUploaderStatus } from '../fileUploader.types.js';
import { formatFileSize } from '../helpers/formatFileSize.js';
import {
    FileActions,
    FileContent,
    FileItemRoot,
    FileMessage,
    FileMeta,
    FileMetaPercent,
    FileName,
    FilePercent,
    FileProgress,
    FileThumbnail,
} from './slots.js';

interface FileItemProps {
    uploadedFile: FileUploaderFile;
    ownerState: RingFileUploaderOwnerState;
    onRemove: (fileId: string) => void;
    onRetry?: (fileId: string) => void;
    onFilesSelected?: (files: File[]) => void;
    accept?: string;
    removeLabel: string;
    retryLabel: string;
    dataTestIdPrefix: string;
}

export function FileItem({
    uploadedFile,
    ownerState: uploaderState,
    onRemove,
    onRetry,
    onFilesSelected,
    accept,
    removeLabel,
    retryLabel,
    dataTestIdPrefix,
}: FileItemProps): React.JSX.Element {
    const fileInputRef = React.useRef<HTMLInputElement>(null);
    const nameId = React.useId();
    const status = uploadedFile.status ?? FileUploaderStatus.Idle;
    const isIdle = status === FileUploaderStatus.Idle;
    const isUploading = status === FileUploaderStatus.Uploading;
    const isCompleted = status === FileUploaderStatus.Success || status === FileUploaderStatus.Completed;
    const isError = status === FileUploaderStatus.Error;
    const fileName = uploadedFile.name || uploadedFile.file?.name || 'Unknown file';
    const totalSizeBytes = uploadedFile.size ?? uploadedFile.file?.size ?? 0;
    const progress = uploadedFile.progress ?? 0;
    const showProgressBar = uploadedFile.showProgressBar !== undefined ? uploadedFile.showProgressBar : !isIdle;
    const hasAction = Boolean(uploadedFile.action);
    const ownerState: RingFileUploaderOwnerState = { ...uploaderState, status, hasAction };

    const uploadedBytes =
        uploadedFile.uploadedBytes !== undefined
            ? uploadedFile.uploadedBytes
            : totalSizeBytes > 0
              ? (progress / 100) * totalSizeBytes
              : 0;
    // A file that is not being uploaded shows its size alone.
    const sizeText = isUploading
        ? `${formatFileSize(uploadedBytes)} / ${formatFileSize(totalSizeBytes)}`
        : formatFileSize(totalSizeBytes);
    const percentText = isUploading ? `${progress}%` : '100%';
    const showPercent = !isIdle && !isError;
    // A replacer function, so `$&` or `$$` in a file name is not read as a replacement pattern.
    const fileLabel = (label: string): string => label.replace('{name}', () => fileName);

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

    return (
        <FileItemRoot
            data-testid={`${dataTestIdPrefix}-file-${uploadedFile.id}`}
            role="listitem"
            ownerState={ownerState}
        >
            <FileThumbnail ownerState={ownerState}>
                {uploadedFile.icon ?? <RingLucideIcon icon={FileUp} fontSize="inherit" />}
            </FileThumbnail>
            <FileContent ownerState={ownerState}>
                <FileName id={nameId} variant="subtitle1" variantMapping={{ subtitle1: 'p' }} ownerState={ownerState}>
                    {fileName}
                </FileName>
                {!hasAction && !isError && (
                    <FileMeta variant="body2" ownerState={ownerState}>
                        {sizeText}
                        {showPercent && <FileMetaPercent ownerState={ownerState}> · {percentText}</FileMetaPercent>}
                    </FileMeta>
                )}
                {!hasAction && isError && uploadedFile.errorMessage && (
                    <FileMessage variant="body2" ownerState={ownerState}>
                        {uploadedFile.errorMessage}
                    </FileMessage>
                )}
                {!hasAction && showProgressBar && (
                    <FileProgress ownerState={ownerState}>
                        <LinearProgress
                            aria-labelledby={nameId}
                            variant="determinate"
                            value={progress}
                            color={isError ? 'error' : isCompleted ? 'success' : 'primary'}
                        />
                    </FileProgress>
                )}
            </FileContent>
            <FileActions ownerState={ownerState}>
                {hasAction && uploadedFile.action && (
                    <Button
                        data-testid={`${dataTestIdPrefix}-file-${uploadedFile.id}-action`}
                        variant="text"
                        onClick={handleActionClick}
                    >
                        {uploadedFile.action.label}
                    </Button>
                )}
                {!hasAction && showPercent && (
                    <FilePercent variant="body2" ownerState={ownerState}>
                        {percentText}
                    </FilePercent>
                )}
                {!hasAction && isUploading && <CircularProgress size={16} aria-labelledby={nameId} />}
                {!hasAction && isCompleted && <RingLucideIcon icon={CircleCheck} fontSize="small" color="success" />}
                {!hasAction && isError && <RingLucideIcon icon={CircleAlert} fontSize="small" color="error" />}
                {!hasAction && isError && onRetry && (
                    <IconButton
                        data-testid={`${dataTestIdPrefix}-file-${uploadedFile.id}-retry`}
                        aria-label={fileLabel(retryLabel)}
                        size="small"
                        onClick={(): void => onRetry(uploadedFile.id)}
                    >
                        <RingLucideIcon icon={RotateCw} fontSize="small" />
                    </IconButton>
                )}
                {uploadedFile.showRemove && (
                    <IconButton
                        data-testid={`${dataTestIdPrefix}-file-${uploadedFile.id}-remove`}
                        aria-label={fileLabel(removeLabel)}
                        size="small"
                        onClick={(): void => onRemove(uploadedFile.id)}
                    >
                        <RingLucideIcon icon={Trash2} fontSize="small" />
                    </IconButton>
                )}
            </FileActions>
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
        </FileItemRoot>
    );
}
