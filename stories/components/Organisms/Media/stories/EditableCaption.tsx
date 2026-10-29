import React, { useState } from 'react';
import type { StoryObj } from '@storybook/react-vite';
import { action } from 'storybook/actions';
import { createCodeStory } from '../../../../helpers.js';
import EditableCaptionExampleCode from './code/EditableCaptionExample.tsx?raw';
import { Media } from '../../../../../src/index.js';
import defaultArgs from '../common/defaultArgs.js';

type Story = StoryObj<typeof Media>;

const Example = (args: React.ComponentProps<typeof Media>): React.JSX.Element => {
    const [title, setTitle] = useState(args.title);
    const [description, setDescription] = useState(args.description);

    const handleTitleSubmit = (value: string): Promise<boolean> => {
        action('onTitleSubmit')(value);
        setTitle(value);

        return Promise.resolve(true);
    };

    const handleDescriptionSubmit = (value: string): Promise<boolean> => {
        action('onDescriptionSubmit')(value);
        setDescription(value);

        return Promise.resolve(true);
    };

    return (
        <Media
            {...args}
            title={title}
            description={description}
            onTitleSubmit={handleTitleSubmit}
            onDescriptionSubmit={handleDescriptionSubmit}
        />
    );
};

export const EditableCaption: Story = {
    args: {
        ...defaultArgs,
        disableFullScreenPreview: true,
    },
    parameters: {
        docs: {
            description: {
                story:
                    'Demonstrates editable `title` and `description` fields. ' +
                    'Passing `onTitleSubmit` enables edit mode for the title; passing `onDescriptionSubmit` enables it for the description. ' +
                    'Each field is independent — you can make only one of them editable. ' +
                    'Click the pencil icon next to a field to enter edit mode. Press **Enter** or click away to submit; press **Escape** to cancel. ' +
                    'On submit failure the value reverts to its previous state.',
            },
        },
    },
    render: (args, context) =>
        createCodeStory({
            context,
            customProps: {},
            customCode: EditableCaptionExampleCode,
            example: <Example {...args} />,
        }),
};
