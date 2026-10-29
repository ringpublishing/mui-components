import React from 'react';
import { Button } from '@mui/material';
import { FileUploader, FileUploaderSize, FileUploaderStatus } from '@ringpublishing/mui-components';

// Under 400px of its own width the uploader stacks its buttons, puts the URL submit under the field
// and draws the file rows with a small icon and the percentage next to the size.
export default function CompactLayoutExample(): React.JSX.Element {
    return (
        <FileUploader
            sx={{ width: 288 }}
            headline="Upload file"
            multiple={true}
            size={FileUploaderSize.Medium}
            labels={{
                dropzone: 'Drag and drop file to add or',
                uploadButton: 'Upload from disk',
                hint: 'PDF, DOC, DOCX (max. 10MB)',
            }}
            action={<Button variant="outlined">From source</Button>}
            files={[
                {
                    id: '1',
                    name: 'report.pdf',
                    size: 4.7 * 1024 * 1024,
                    status: FileUploaderStatus.Success,
                    showRemove: true,
                },
                {
                    id: '2',
                    name: 'photo.jpg',
                    size: 4 * 1024 * 1024,
                    progress: 42,
                    status: FileUploaderStatus.Uploading,
                    showRemove: true,
                },
                {
                    id: '3',
                    name: 'data.csv',
                    status: FileUploaderStatus.Error,
                    errorMessage: 'Network error: Connection lost',
                    showRemove: true,
                },
            ]}
            onRetry={(): void => undefined}
            slotProps={{
                urlUploadSection: {
                    enabled: true,
                    title: 'Or upload from URL',
                    placeholder: 'https://...',
                    submitButton: 'Upload',
                },
            }}
        />
    );
}
