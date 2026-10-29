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

/** Why a selected or dropped file was not passed to `onFilesSelected`. */
export enum FileUploaderRejectionReason {
    /** Larger than `maxFileSize`. */
    FileTooLarge = 'file-too-large',
    /** Matches none of the types in `accept`. */
    FileInvalidType = 'file-invalid-type',
    /** A second file while `multiple` is off — only the first acceptable one is taken. */
    TooManyFiles = 'too-many-files',
}

export interface FileUploaderRejection {
    file: File;
    reason: FileUploaderRejectionReason;
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
    /**
     * Accessible name of a file's remove button. Use {name} as the placeholder for the file name.
     * @default 'Remove {name}'
     */
    removeFile?: string;
    /**
     * Accessible name of a failed file's retry button. Use {name} as the placeholder for the file name.
     * @default 'Retry upload of {name}'
     */
    retryFile?: string;
    /**
     * Accessible name of the button that clears the URL field.
     * @default 'Clear URL'
     */
    clearUrl?: string;
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
     * Callback fired with the files that were selected or dropped but not taken, each with its reason (a file of
     * the wrong type that is also too large is `FileInvalidType`). The taken files of the same selection go to
     * `onFilesSelected`, which is called first.
     */
    onFilesRejected?: (rejections: FileUploaderRejection[]) => void;
    /**
     * Maximum file size in bytes
     */
    maxFileSize?: number;
    /**
     * Accepted file types, comma-separated (e.g., 'image/*', '.pdf'), checked for picked and dropped files and a
     * file row's replacement. A MIME type is compared with the type the browser reports, which differs between
     * browsers for some formats, so list the extensions too (e.g., 'audio/mpeg,.mp3').
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
