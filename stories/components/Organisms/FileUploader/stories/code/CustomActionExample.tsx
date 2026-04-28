import React from 'react';
import { Button } from '@mui/material';
import { FileUploader } from '@ringpublishing/mui-components';

export default function CustomActionExample(): React.JSX.Element {
    const handleCustomAction = (): void => {
        // Add your custom logic here
    };

    return (
        <FileUploader
            sx={{ maxWidth: 600, margin: '0 auto' }}
            headline="Upload Your Files"
            labels={{
                dropzone: 'Drag and drop file here or',
                uploadButton: 'Browse file',
                hint: 'PDF, DOC (max. 10MB)',
                description: 'Upload files from your computer or from an external source',
            }}
            maxFileSize={10 * 1024 * 1024}
            accept=".pdf,.doc,.docx"
            action={
                <Button variant="outlined" onClick={handleCustomAction}>
                    From Source
                </Button>
            }
        />
    );
}
