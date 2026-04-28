import { CommonComponentProps } from '../../../helpers/commonTypes.js';
import { TextFieldProps } from '@mui/material';

export enum FileUploaderSize {
    Small = 'small',
    Medium = 'medium',
    Large = 'large',
}

export enum FileUploaderStatus {
    Idle = 'idle',
    Uploading = 'uploading',
    Completed = 'completed',
    Success = 'success',
    Error = 'error',
}

export interface FileUploaderFile {
    id: string;
    /** Display name of the file. Falls back to file.name if not provided. */
    name?: string;
    /** File size in bytes. Falls back to file.size if not provided. */
    size?: number;
    /** MIME type of the file. */
    type?: string;
    /**
     * Upload status.
     * @default FileUploaderStatus.Idle
     */
    status?: FileUploaderStatus;
    progress?: number;
    errorMessage?: string;
    uploadedBytes?: number;
    /** @default true for Uploading/Success/Completed/Error, false for Idle */
    showProgressBar?: boolean;
    showRemove?: boolean;
    icon?: React.ReactNode;
    action?: {
        label: string;
        onClick?: () => void;
    };
    /** Native File object. Required only for browser-initiated uploads. */
    file?: File;
}

/** @deprecated Use FileUploaderFile instead */
export type UploadedFile = FileUploaderFile;

export interface FileUploaderLabels {
    dropzone: string;
    hint?: string;
    uploadButton: string;
    description?: string;
    /**
     * Label for the files counter in multiple files mode.
     * Use {uploaded} and {total} as placeholders.
     * @default '{uploaded} of {total} files uploaded'
     */
    filesUploaded?: string;
}

export interface FileUploaderProps extends CommonComponentProps {
    /**
     * Callback fired when files are selected
     */
    onFilesSelected?: (files: File[]) => void;
    /**
     * Callback when file is removed
     * @param fileId - ID of the file to remove
     */
    onRemove?: (fileId: string) => void;
    /**
     * Callback fired when user clicks retry button on failed upload
     * @param fileId - ID of the file to retry
     */
    onRetry?: (fileId: string) => void;
    /**
     * Maximum file size in bytes
     */
    maxFileSize?: number;
    /**
     * Accepted file types (e.g., 'image/*', '.pdf')
     */
    accept?: string;
    /**
     * Allow multiple file selection
     * @default false
     */
    multiple?: boolean;
    /**
     * Optional headline text
     */
    headline?: string;
    /**
     * Labels for dropzone content
     */
    labels: FileUploaderLabels;
    /**
     * List of uploaded files (for controlled component)
     */
    files?: FileUploaderFile[];
    /**
     * Whether files list is initially collapsed (for multiple files)
     * @default false
     */
    initiallyCollapsed?: boolean;
    /**
     * Size of the dropzone and other components
     * @default 'medium'
     */
    size?: FileUploaderSize;
    /**
     * Error message to display
     */
    errorMessage?: string;
    /**
     * Slot for custom action component to display next to the upload button
     */
    action?: React.ReactNode;
    /**
     * Props to pass to internal components
     */
    slotProps?: {
        urlUploadSection?: {
            enabled?: boolean;
            onSubmit?: (url: string) => void;
            onClear?: () => void;
            title?: string;
            placeholder?: string;
            submitButton?: string;
            textFieldProps?: Partial<TextFieldProps>;
            loading?: boolean;
        };
    };
}
