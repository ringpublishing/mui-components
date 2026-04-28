import React from 'react';
import { FileUploader, FileUploaderSize } from '@ringpublishing/mui-components';

export default function DefaultExample(): React.JSX.Element {
    const handleFilesSelected = (files: File[]): void => {
        void files;
    };

    return (
        <FileUploader
            headline="Upload File"
            labels={{
                dropzone: 'Drag and drop file to add or',
                hint: 'PDF, DOC, DOCX (max. 10MB)',
                uploadButton: 'upload from disk',
                description: 'You can upload PDF, DOC and DOCX file formats.',
            }}
            maxFileSize={10 * 1024 * 1024}
            accept=".pdf,.doc,.docx"
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
            size={FileUploaderSize.Medium}
            files={[]}
            onFilesSelected={handleFilesSelected}
            sx={{ maxWidth: 600, margin: '0 auto' }}
        />
    );
}
