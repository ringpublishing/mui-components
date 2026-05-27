import type { Meta } from '@storybook/react-vite';
import { FileUploader, FileUploaderSize } from '../../../../src/index.js';
import { Default } from './stories/Default.js';
import { UploadFileStates } from './stories/UploadFileStates.js';
import { UrlUpload } from './stories/UrlUpload.js';
import { CustomAction } from './stories/CustomAction.js';
import defaultArgs from './common/defaultArgs.js';
import FileUploaderMdx from './FileUploader.mdx';

const meta = {
    component: FileUploader,
    parameters: {
        docs: {
            page: FileUploaderMdx,
        },
    },
    args: {
        ...defaultArgs,
    },
    argTypes: {
        sx: {
            control: 'object',
            description: 'MUI System properties to customize the main element style.',
            table: {
                category: 'customization',
                type: { summary: 'SxProps<Theme>' },
                defaultValue: { summary: '{}' },
            },
        },
        className: {
            control: 'text',
            type: 'string',
            description: 'CSS class name applied to the main element.',
            table: {
                category: 'customization',
                type: { summary: 'string' },
            },
        },
        headline: {
            control: 'text',
            description: 'Optional headline text',
            table: {
                category: 'content',
                type: { summary: 'string' },
            },
        },
        labels: {
            control: 'object',
            description: 'Text labels for the component (required)',
            table: {
                category: 'content',
                type: {
                    summary:
                        '{ dropzone: string; hint?: string; uploadButton: string; description?: string; filesUploaded?: string }',
                },
            },
        },
        errorMessage: {
            control: 'text',
            description:
                'Error message to display. When set, dropzone shows error state with red background and solid border',
            table: {
                category: 'content',
                type: { summary: 'string' },
            },
        },
        maxFileSize: {
            control: 'number',
            description: 'Maximum file size in bytes',
            table: {
                category: 'validation',
                type: { summary: 'number' },
            },
        },
        accept: {
            control: 'text',
            description: 'Accepted file types (e.g., "image/*", ".pdf")',
            table: {
                category: 'validation',
                type: { summary: 'string' },
            },
        },
        multiple: {
            control: 'boolean',
            description: 'Allow multiple file selection',
            table: {
                category: 'behavior',
                type: { summary: 'boolean' },
                defaultValue: { summary: 'false' },
            },
        },
        initiallyCollapsed: {
            control: 'boolean',
            description: 'Whether files list is initially collapsed (for multiple files)',
            table: {
                category: 'behavior',
                type: { summary: 'boolean' },
                defaultValue: { summary: 'false' },
            },
        },
        size: {
            control: 'radio',
            options: Object.values(FileUploaderSize),
            description:
                'Size of the dropzone and other components. ' +
                'Available options: Small (compact, horizontal layout), Medium (balanced, vertical layout), Large (spacious, prominent)',
            table: {
                category: 'appearance',
                type: { summary: 'FileUploaderSize' },
                defaultValue: { summary: `'${FileUploaderSize.Medium}'` },
            },
        },
        onFilesSelected: {
            description:
                'Callback fired when files are selected (via drag & drop or file browser). ' +
                'Receives an array of File objects containing file metadata (name, size, type) and binary data for upload.',
            table: {
                category: 'callbacks',
                type: { summary: '(files: File[]) => void' },
            },
        },
        onRemove: {
            description: 'Callback fired when a file is removed from the list',
            table: {
                category: 'callbacks',
                type: { summary: '(fileId: string) => void' },
            },
        },
        onRetry: {
            description: 'Callback fired when user clicks retry on a failed upload item',
            table: {
                category: 'callbacks',
                type: { summary: '(fileId: string) => void' },
            },
        },
        files: {
            control: 'object',
            description:
                'List of files for controlled component mode. Each file uses the FileUploaderFile model — no native File object required.',
            table: {
                category: 'state',
                type: { summary: 'FileUploaderFile[]' },
            },
        },
        slotProps: {
            control: 'object',
            description:
                'Props for internal components. See [URL Upload](#url-upload) section above for detailed usage and examples.',
            table: {
                category: 'customization',
                type: {
                    summary: '{ urlUploadSection?: UrlUploadSectionProps }',
                },
            },
        },
        action: {
            control: false,
            description:
                'Slot for custom React node to display next to the upload button. ' +
                'See [Action Slot](#custom-action) section above for usage examples.',
            table: {
                category: 'customization',
                type: {
                    summary: 'React.ReactNode',
                },
            },
        },
        dataTestIdSuffix: {
            control: 'text',
            description: 'Optional suffix for generated test id (base: ring-file-uploader).',
            table: {
                category: 'customization',
                type: { summary: 'string' },
            },
        },
    },
} satisfies Meta<typeof FileUploader>;

export default meta;

export { Default, UploadFileStates, UrlUpload, CustomAction };
