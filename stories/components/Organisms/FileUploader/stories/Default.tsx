import React from 'react';
import type { StoryObj } from '@storybook/react-vite';
import { action } from 'storybook/actions';
import { createCodeStory } from '../../../../helpers.js';
import DefaultExampleCode from './code/DefaultExample.tsx?raw';
import { FileUploader } from '../../../../../src/index.js';
import defaultArgs from '../common/defaultArgs.js';

type Story = StoryObj<typeof FileUploader>;

const Example = (args: React.ComponentProps<typeof FileUploader>): React.JSX.Element => {
    const handleFilesSelected = (files: File[]): void => {
        action('onFilesSelected')(files.map((f) => ({ name: f.name, size: f.size, type: f.type, file: f })));
    };

    return <FileUploader {...args} onFilesSelected={handleFilesSelected} />;
};

export const Default: Story = {
    args: {
        ...defaultArgs,
    },
    render: (args, context) => {
        if (context?.viewMode === 'story') {
            return <Example {...args} />;
        }

        return createCodeStory({
            context,
            customProps: {},
            customCode: DefaultExampleCode,
            example: <Example {...args} />,
        });
    },
};
