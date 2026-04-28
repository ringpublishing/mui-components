import React from 'react';
import { FileUploader, FileUploaderSize, FileUploaderStatus } from '@ringpublishing/mui-components';

export default function UploadFileStatesExample(): React.JSX.Element {
    const handleRemove = (): void => {
        void 0;
    };

    const handleRetry = (): void => {
        void 0;
    };

    return (
        <FileUploader
            headline="File Upload - All States Demo"
            multiple={true}
            size={FileUploaderSize.Small}
            accept={'.pdf,.doc,.docx,.txt, .jpg'}
            maxFileSize={10 * 1024 * 1024}
            initiallyCollapsed={false}
            slotProps={{
                urlUploadSection: {
                    enabled: false,
                    onSubmit: (url: string): void => {
                        void url;
                    },
                    title: 'Or from URL',
                    placeholder: 'Paste URL here',
                    submitButton: 'Send',
                    textFieldProps: { error: false, helperText: 'Enter valid URL' },
                },
            }}
            labels={{
                dropzone: 'Drag and drop file to add or',
                hint: 'PDF, DOC, DOCX (max. 10MB)',
                uploadButton: 'upload from disk',
                description: 'You can upload PDF, DOC and DOCX file formats.',
            }}
            files={[
                {
                    id: '0',
                    name: 'backend-document.pdf',
                    size: 2.1 * 1024 * 1024,
                    type: 'application/pdf',
                    status: FileUploaderStatus.Idle,
                    showRemove: true,
                },
                {
                    id: '1',
                    name: 'uploading-25.pdf',
                    size: 3.5 * 1024 * 1024,
                    type: 'application/pdf',
                    progress: 5,
                    status: FileUploaderStatus.Uploading,
                    uploadedBytes: 0.875 * 1024 * 1024,
                    showRemove: true,
                },
                {
                    id: '2',
                    name: 'completed.pdf',
                    size: 4.7 * 1024 * 1024,
                    type: 'application/pdf',
                    progress: 100,
                    status: FileUploaderStatus.Success,
                    showRemove: true,
                },
                {
                    id: '3',
                    name: 'error.csv',
                    size: 3 * 1024 * 1024,
                    type: 'text/csv',
                    status: FileUploaderStatus.Error,
                    errorMessage: 'Network error: Connection lost',
                },
                {
                    id: '4',
                    name: 'uploading-no-progressbar.pdf',
                    size: 3.5 * 1024 * 1024,
                    type: 'application/pdf',
                    progress: 25,
                    status: FileUploaderStatus.Uploading,
                    uploadedBytes: 0.875 * 1024 * 1024,
                    showProgressBar: false,
                },
                {
                    id: '5',
                    name: 'completed-no-progressbar.pdf',
                    size: 4.7 * 1024 * 1024,
                    type: 'application/pdf',
                    progress: 100,
                    status: FileUploaderStatus.Success,
                    showProgressBar: false,
                },
                {
                    id: '6',
                    name: 'error-no-progressbar.csv',
                    size: 3 * 1024 * 1024,
                    type: 'text/csv',
                    status: FileUploaderStatus.Error,
                    errorMessage: 'Network error: Connection lost',
                    showProgressBar: false,
                },
                {
                    id: '7',
                    name: 'changed-action.pdf',
                    size: 3.5 * 1024 * 1024,
                    type: 'application/pdf',
                    progress: 25,
                    status: FileUploaderStatus.Uploading,
                    uploadedBytes: 0.875 * 1024 * 1024,
                    showProgressBar: false,
                    showRemove: false,
                    action: {
                        label: 'CHANGE',
                    },
                },
            ]}
            onRemove={handleRemove}
            onRetry={handleRetry}
            sx={{ maxWidth: 600, margin: '0 auto' }}
        />
    );
}
