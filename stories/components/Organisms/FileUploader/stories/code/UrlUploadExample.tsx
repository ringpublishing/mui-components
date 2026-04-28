import React, { useState } from 'react';
import { FileUploader } from '@ringpublishing/mui-components';

export default function UrlUploadExample(): React.JSX.Element {
    const [isUploading, setIsUploading] = useState(false);

    const handleUrlSubmit = async (url: string): Promise<void> => {
        setIsUploading(true);

        try {
            // Simulate API call
            await new Promise((resolve) => setTimeout(resolve, 2000));

            // Handle URL upload
            void url;

            // Here you would typically:
            // const response = await fetch(url);
            // const blob = await response.blob();
            // Upload blob to your server...
        } catch (error) {
            void error;
        } finally {
            setIsUploading(false);
        }
    };

    const handleClear = (): void => {
        void 0;
    };

    return (
        <FileUploader
            sx={{ maxWidth: 600, margin: '0 auto' }}
            headline="Upload Your Files"
            labels={{
                dropzone: 'Drag and drop files here or',
                uploadButton: 'Browse files',
                hint: 'PDF, DOC (max. 10MB)',
                description: 'Upload multiple files from your computer or from a URL',
            }}
            multiple={true}
            maxFileSize={10 * 1024 * 1024}
            accept=".pdf,.doc,.docx"
            slotProps={{
                urlUploadSection: {
                    enabled: true,
                    title: 'Or upload from URL',
                    placeholder: 'Enter file URL',
                    submitButton: 'Upload',
                    onSubmit: handleUrlSubmit,
                    loading: isUploading,
                    onClear: handleClear,
                    textFieldProps: { error: false, helperText: 'Enter valid URL' },
                },
            }}
        />
    );
}
