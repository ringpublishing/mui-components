import React from 'react';
import type { StoryObj } from '@storybook/react-vite';
import { action } from 'storybook/actions';
import { FileUploader, FileUploaderSize, FileUploaderStatus } from '../../../../../src/index.js';
import defaultArgs from '../common/defaultArgs.js';
import { Stack } from '@mui/material';
import { createCodeStory } from '../../../../helpers.js';
import UploadFileStatesExampleCode from './code/UploadFileStatesExample.tsx?raw';

type Story = StoryObj<typeof FileUploader>;

const Example = (args: React.ComponentProps<typeof FileUploader>): React.JSX.Element => {
    return (
        <Stack alignItems="center" justifyContent="center" p={2}>
            <FileUploader {...args} sx={{ maxWidth: 600 }} />
        </Stack>
    );
};

export const UploadFileStates: Story = {
    args: {
        ...defaultArgs,
        headline: 'File Upload - All States Demo',
        multiple: true,
        size: FileUploaderSize.Small,
        initiallyCollapsed: false,
        onRemove: action('onRemove'),
        onRetry: action('onRetry'),
        files: [
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
        ],
    },
    render: (args, context) => {
        if (context?.viewMode === 'story') {
            return <Example {...args} />;
        }

        return createCodeStory({
            context,
            customProps: {},
            customCode: UploadFileStatesExampleCode,
            example: <Example {...args} />,
        });
    },
};
