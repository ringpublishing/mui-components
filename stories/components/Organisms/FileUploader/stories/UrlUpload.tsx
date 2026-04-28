import { useState } from 'react';
import type { StoryObj } from '@storybook/react-vite';
import { createCodeStory } from '../../../../helpers.js';
import { FileUploader } from '../../../../../src/index.js';
import defaultArgs from '../common/defaultArgs.js';
import UrlUploadExampleCode from './code/UrlUploadExample.tsx?raw';

type Story = StoryObj<typeof FileUploader>;

const Example = (args: React.ComponentProps<typeof FileUploader>): React.JSX.Element => {
    const [isUploading, setIsUploading] = useState(false);

    const handleUrlSubmit = async (url: string): Promise<void> => {
        setIsUploading(true);

        try {
            // Simulate API call
            await new Promise((resolve) => setTimeout(resolve, 2000));

            // Handle URL upload
            // In a real app, you would fetch and process the file here
            void url;
        } catch (error) {
            // Handle error
            void error;
        } finally {
            setIsUploading(false);
        }
    };

    const handleClear = (): void => {
        // Optional callback when URL is cleared
    };

    return (
        <FileUploader
            {...args}
            slotProps={{
                ...args.slotProps,
                urlUploadSection: {
                    ...args.slotProps?.urlUploadSection,
                    onSubmit: handleUrlSubmit,
                    loading: isUploading,
                    onClear: handleClear,
                },
            }}
        />
    );
};

export const UrlUpload: Story = {
    args: {
        ...defaultArgs,
        slotProps: {
            urlUploadSection: {
                ...defaultArgs.slotProps?.urlUploadSection,
                enabled: true,
            },
        },
    },
    render: (args, context) => {
        return createCodeStory({
            context,
            customProps: {},
            customCode: UrlUploadExampleCode,
            example: <Example {...args} />,
        });
    },
};
