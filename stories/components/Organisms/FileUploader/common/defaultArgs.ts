import { FileUploaderProps, FileUploaderSize } from '../../../../../src/index.js';

const defaultArgs: Partial<FileUploaderProps> = {
    headline: 'Upload File',
    labels: {
        dropzone: 'Drag and drop file to add or',
        hint: 'PDF, DOC, DOCX (max. 10MB)',
        uploadButton: 'upload from disk',
        description: 'You can upload PDF, DOC and DOCX file formats.',
        filesUploaded: '{uploaded} of {total} files uploaded',
    },
    maxFileSize: 10 * 1024 * 1024,
    accept: '.pdf,.doc,.docx,.txt, .jpg',
    slotProps: {
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
    },
    size: FileUploaderSize.Medium,
    files: [],
    sx: { maxWidth: 600, margin: '0 auto' },
};

export default defaultArgs;
