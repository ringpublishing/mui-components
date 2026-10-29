import React, { useRef, useState, useCallback, useId } from 'react';
import { Box, Typography, Button, Collapse, Tooltip, CircularProgress, Link } from '@mui/material';
import { visuallyHidden } from '@mui/utils';
import { ChevronDown, Info, X } from 'lucide-react';
import type { RingFileUploaderOwnerState } from '@ringpublishing/mui-theme';
import {
    FileUploaderProps,
    FileUploaderRejectionReason,
    FileUploaderSize,
    FileUploaderStatus,
    type FileUploaderLabels,
    type FileUploaderRejection,
} from './fileUploader.types.js';
import { UploadIcon, FileItem } from './components/index.js';
import {
    Dropzone,
    DropzoneActions,
    DropzoneBody,
    DropzoneLinkGroup,
    DropzoneText,
    FileList,
    FilesCounter,
    FileUploaderHeader,
    FileUploaderRoot,
    HintIcon,
    UrlRow,
    UrlSection,
    UrlSubmit,
} from './components/slots.js';
import { TextField } from '../../Molecules/TextField/TextField.js';
import { RingLucideIcon } from '../../../helpers/RingLucideIcon.js';
import { useRingDataTestId } from '../../../helpers/hooks/useRingDataTestId.js';
import { WithOwnerDataTestId } from '../../../helpers/dataTestId.js';

const DEFAULT_LABELS = {
    filesUploaded: '{uploaded} of {total} files uploaded',
    removeFile: 'Remove {name}',
    retryFile: 'Retry upload of {name}',
    clearUrl: 'Clear URL',
} as const;

/**
 * Whether a file matches `accept`: `.ext` against the name, `type/*` against the MIME group and `type/subtype`
 * exactly against the type the browser reports for the file, all case-insensitive. A missing or empty `accept`, or
 * the any-type wildcard, takes any file.
 */
function matchesAccept(file: File, accept?: string): boolean {
    const tokens = (accept ?? '')
        .split(',')
        .map((token) => token.trim().toLowerCase())
        .filter(Boolean);

    if (tokens.length === 0) {
        return true;
    }

    const name = file.name.toLowerCase();
    const type = file.type.toLowerCase();

    return tokens.some((token) => {
        if (token === '*' || token === '*/*') {
            return true;
        }

        if (token.startsWith('.')) {
            return name.endsWith(token);
        }

        if (token.endsWith('/*')) {
            return type.startsWith(token.slice(0, -1));
        }

        return type === token;
    });
}

/**
 * Splits the label's last word off, so in the small drop area it wraps together with the link that follows it
 * ("… file to add" / "or upload from disk"). A one-word label goes with the link whole.
 */
function splitLastWord(label: string): [string, string] {
    const trimmed = label.trimEnd();
    const cut = trimmed.lastIndexOf(' ');

    return cut === -1 ? ['', trimmed] : [trimmed.slice(0, cut), trimmed.slice(cut + 1)];
}

interface DropzoneContentProps extends WithOwnerDataTestId {
    labels: FileUploaderLabels;
    errorMessage?: string;
    ownerState: RingFileUploaderOwnerState;
    onBrowseClick: () => void;
    actionSlot?: React.ReactNode;
}

const SmallDropzoneContent: React.FC<DropzoneContentProps> = ({
    labels,
    errorMessage,
    ownerState,
    onBrowseClick,
    actionSlot,
    dataTestId,
}) => {
    const [labelHead, labelTail] = splitLastWord(labels.dropzone);

    return (
        <>
            <DropzoneBody ownerState={ownerState}>
                <UploadIcon
                    isError={ownerState.error}
                    isDragging={ownerState.dragOver}
                    size={ownerState.size}
                    dataTestId={`${dataTestId}-placeholder-icon`}
                />
                <DropzoneText ownerState={ownerState}>
                    <Typography variant="body1">
                        {labelHead && `${labelHead} `}
                        <DropzoneLinkGroup ownerState={ownerState}>
                            {labelTail}
                            <Link
                                data-testid={`${dataTestId}-browse`}
                                component="button"
                                type="button"
                                variant="body1"
                                onClick={onBrowseClick}
                            >
                                {labels.uploadButton}
                            </Link>
                            {labels.hint && (
                                <Tooltip title={labels.hint} arrow={true} placement="top">
                                    <HintIcon tabIndex={0} role="img" ownerState={ownerState}>
                                        <RingLucideIcon icon={Info} fontSize="inherit" />
                                    </HintIcon>
                                </Tooltip>
                            )}
                        </DropzoneLinkGroup>
                    </Typography>
                    {errorMessage && (
                        <Typography variant="body2" color="error">
                            {errorMessage}
                        </Typography>
                    )}
                </DropzoneText>
            </DropzoneBody>
            {actionSlot && <DropzoneActions ownerState={ownerState}>{actionSlot}</DropzoneActions>}
        </>
    );
};

const StackedDropzoneContent: React.FC<DropzoneContentProps> = ({
    labels,
    errorMessage,
    ownerState,
    onBrowseClick,
    actionSlot,
    dataTestId,
}) => (
    <>
        <UploadIcon
            isError={ownerState.error}
            isDragging={ownerState.dragOver}
            size={ownerState.size}
            dataTestId={`${dataTestId}-placeholder-icon`}
        />
        <DropzoneBody ownerState={ownerState}>
            <Typography variant="subtitle1">{labels.dropzone}</Typography>
            <DropzoneActions ownerState={ownerState}>
                <Button data-testid={`${dataTestId}-browse`} variant="contained" size="medium" onClick={onBrowseClick}>
                    {labels.uploadButton}
                </Button>
                {actionSlot}
            </DropzoneActions>
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
        </DropzoneBody>
    </>
);

interface UrlUploadSectionProps extends WithOwnerDataTestId {
    title?: string;
    placeholder?: string;
    submitButton?: string;
    clearLabel: string;
    urlValue: string;
    onUrlValueChange: (value: string) => void;
    onSubmit: () => void;
    onClear?: () => void;
    textFieldProps?: React.ComponentProps<typeof TextField>;
    loading?: boolean;
    ownerState: RingFileUploaderOwnerState;
}

const UrlUploadSection: React.FC<UrlUploadSectionProps> = ({
    title,
    placeholder,
    submitButton,
    clearLabel,
    urlValue,
    onUrlValueChange,
    onSubmit,
    onClear,
    textFieldProps,
    loading = false,
    ownerState,
    dataTestId,
}) => {
    const titleId = useId();

    return (
        <UrlSection ownerState={ownerState}>
            <Typography id={titleId} variant="subtitle2">
                {title}
            </Typography>
            <UrlRow ownerState={ownerState}>
                <TextField
                    /*
                     * `dataTestId` is already a complete `ring-fileuploader-…` id, so it is set
                     * directly — passing it as a suffix would yield `ring-textfield-ring-…`.
                     * The input below it inherits the prefix and becomes `…-url-input`.
                     */
                    data-testid={`${dataTestId}-url`}
                    actions={
                        urlValue
                            ? [
                                  {
                                      icon: <X size={24} />,
                                      onClick: (): void => {
                                          onUrlValueChange('');
                                          onClear?.();
                                      },
                                      label: clearLabel,
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
                    slotProps={{
                        ...textFieldProps?.slotProps,
                        htmlInput: {
                            ...(title ? { 'aria-labelledby': titleId } : {}),
                            ...textFieldProps?.slotProps?.htmlInput,
                        },
                    }}
                />
                <UrlSubmit
                    data-testid={`${dataTestId}-url-submit`}
                    variant="outlined"
                    size="small"
                    onClick={onSubmit}
                    disabled={loading}
                    aria-busy={loading || undefined}
                    startIcon={loading ? <CircularProgress size={20} color="inherit" aria-hidden={true} /> : undefined}
                    ownerState={ownerState}
                >
                    {submitButton}
                </UrlSubmit>
            </UrlRow>
        </UrlSection>
    );
};

export function FileUploader(props: FileUploaderProps): React.JSX.Element {
    const {
        sx = {},
        onFilesSelected,
        onFilesRejected,
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
    // Entering a child of the drop area fires `dragleave` on the area itself; counting the enters and leaves
    // keeps the drag-over state on until the pointer really leaves it.
    const dragDepth = useRef(0);
    const [isDragging, setIsDragging] = useState(false);
    const [urlValue, setUrlValue] = useState('');
    const [isCollapsed, setIsCollapsed] = useState(initiallyCollapsed);
    const fileListId = useId();

    const dataTestId = useRingDataTestId('FileUploader', dataTestIdSuffix);

    const files = controlledFiles || [];
    const ownerState: RingFileUploaderOwnerState = {
        size,
        dragOver: isDragging,
        error: Boolean(errorMessage),
        collapsed: isCollapsed,
    };

    const rejectionReason = useCallback(
        (file: File): FileUploaderRejectionReason | null => {
            if (!matchesAccept(file, accept)) {
                return FileUploaderRejectionReason.FileInvalidType;
            }

            if (maxFileSize && file.size > maxFileSize) {
                return FileUploaderRejectionReason.FileTooLarge;
            }

            return null;
        },
        [accept, maxFileSize],
    );

    // Every way a file comes in — the picker, a drop, a file row's replacement — goes through here.
    const handleFiles = useCallback(
        (selectedFiles: FileList | File[] | null): void => {
            if (!selectedFiles) {
                return;
            }

            const accepted: File[] = [];
            const rejections: FileUploaderRejection[] = [];

            Array.from(selectedFiles).forEach((file) => {
                const reason = rejectionReason(file);

                if (reason) {
                    rejections.push({ file, reason });
                } else if (!multiple && accepted.length > 0) {
                    rejections.push({ file, reason: FileUploaderRejectionReason.TooManyFiles });
                } else {
                    accepted.push(file);
                }
            });

            if (accepted.length > 0) {
                onFilesSelected?.(accepted);
            }

            if (rejections.length > 0) {
                onFilesRejected?.(rejections);
            }
        },
        [multiple, onFilesRejected, onFilesSelected, rejectionReason],
    );

    const handleDragEnter = (e: React.DragEvent): void => {
        e.preventDefault();
        e.stopPropagation();
        dragDepth.current += 1;
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent): void => {
        e.preventDefault();
        e.stopPropagation();
        dragDepth.current = Math.max(0, dragDepth.current - 1);

        if (dragDepth.current === 0) {
            setIsDragging(false);
        }
    };

    const handleDragOver = (e: React.DragEvent): void => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleDrop = (e: React.DragEvent): void => {
        e.preventDefault();
        e.stopPropagation();
        dragDepth.current = 0;
        setIsDragging(false);
        handleFiles(e.dataTransfer.files);
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
    // A file without a status is idle — already in place, like the row draws it.
    const uploadedCount = files.filter((f) => {
        const status = f.status ?? FileUploaderStatus.Idle;

        return (
            status === FileUploaderStatus.Completed ||
            status === FileUploaderStatus.Success ||
            status === FileUploaderStatus.Idle
        );
    }).length;
    const filesUploadedText = (labels.filesUploaded ?? DEFAULT_LABELS.filesUploaded)
        .replace('{uploaded}', String(uploadedCount))
        .replace('{total}', String(files.length));
    // Status changes are read out from one polite region: the errors and, with several files, the progress.
    const announcement = [
        errorMessage,
        ...files.map((f) => (f.status === FileUploaderStatus.Error ? f.errorMessage : undefined)),
        hasFiles && multiple ? filesUploadedText : undefined,
    ]
        .filter((part): part is string => Boolean(part))
        // A message that already ends its sentence gets no second full stop.
        .map((part, index, parts) => (index < parts.length - 1 && !/[.!?…]$/.test(part) ? `${part}.` : part))
        .join(' ');

    const dropzoneContentProps: DropzoneContentProps = {
        labels,
        errorMessage,
        ownerState,
        onBrowseClick: handleBrowseClick,
        actionSlot: action,
        dataTestId,
    };

    const fileItems = files.map((file) => (
        <FileItem
            key={file.id}
            uploadedFile={file}
            ownerState={ownerState}
            onRemove={handleRemove}
            onRetry={onRetry}
            onFilesSelected={handleFiles}
            accept={accept}
            removeLabel={labels.removeFile ?? DEFAULT_LABELS.removeFile}
            retryLabel={labels.retryFile ?? DEFAULT_LABELS.retryFile}
            dataTestIdPrefix={dataTestId}
        />
    ));

    return (
        <FileUploaderRoot data-testid={dataTestId} ownerState={ownerState} sx={sx} {...otherProps}>
            {(headline || labels.description) && (
                <FileUploaderHeader ownerState={ownerState}>
                    {headline && <Typography variant="subtitle2">{headline}</Typography>}
                    {labels.description && (
                        <Typography variant="body1" color="text.secondary">
                            {labels.description}
                        </Typography>
                    )}
                </FileUploaderHeader>
            )}

            {shouldShowDropzone && (
                <Dropzone
                    data-testid={`${dataTestId}-dropzone`}
                    className={isDragging ? 'drag-over' : undefined}
                    ownerState={ownerState}
                    onDragEnter={handleDragEnter}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                >
                    {size === FileUploaderSize.Small ? (
                        <SmallDropzoneContent {...dropzoneContentProps} />
                    ) : (
                        <StackedDropzoneContent {...dropzoneContentProps} />
                    )}
                </Dropzone>
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
                    clearLabel={labels.clearUrl ?? DEFAULT_LABELS.clearUrl}
                    textFieldProps={slotProps?.urlUploadSection?.textFieldProps}
                    loading={slotProps?.urlUploadSection?.loading}
                    onClear={slotProps?.urlUploadSection?.onClear}
                    urlValue={urlValue}
                    onUrlValueChange={setUrlValue}
                    onSubmit={(): void => handleUrlSubmit(urlValue)}
                    ownerState={ownerState}
                    dataTestId={dataTestId}
                />
            )}

            {hasFiles && multiple && (
                <Box>
                    <FilesCounter
                        data-testid={`${dataTestId}-expand`}
                        onClick={(): void => setIsCollapsed(!isCollapsed)}
                        variant="text"
                        aria-expanded={!isCollapsed}
                        aria-controls={fileListId}
                        startIcon={<RingLucideIcon icon={ChevronDown} />}
                        ownerState={ownerState}
                    >
                        {filesUploadedText}
                    </FilesCounter>
                    <Collapse in={!isCollapsed}>
                        <FileList id={fileListId} role="list" ownerState={ownerState}>
                            {fileItems}
                        </FileList>
                    </Collapse>
                </Box>
            )}

            {hasFiles && !multiple && (
                <FileList role="list" ownerState={ownerState}>
                    {fileItems}
                </FileList>
            )}

            <Box component="span" aria-live="polite" sx={visuallyHidden}>
                {announcement}
            </Box>
        </FileUploaderRoot>
    );
}

export { FileUploaderRejectionReason, FileUploaderSize, FileUploaderStatus } from './fileUploader.types.js';
export type { FileUploaderProps, FileUploaderFile, FileUploaderRejection, UploadedFile } from './fileUploader.types.js';
