import React, { useState } from 'react';
import type { StoryObj } from '@storybook/react-vite';
import { Box } from '@mui/material';
import { action } from 'storybook/actions';
import { createCodeStory } from '../../../../helpers.js';
import WithEditableCaptionExampleCode from './code/WithEditableCaptionExample.tsx?raw';
import { Media } from '../../../../../src/index.js';
import { getImagePath, TestImage, ImageSize } from '../../../../../src/helpers/stories/imagesData.js';
import defaultArgs from '../common/defaultArgs.js';

type Story = StoryObj<typeof Media>;

const Example = (args: React.ComponentProps<typeof Media>): React.JSX.Element => {
    const [title, setTitle] = useState(
        args.title ?? 'The Cat Takes a Long and Peaceful Nap in a Warm Patch of Afternoon Sunlight.',
    );
    const [description, setDescription] = useState(args.description ?? '(James Veysey / Shutterstock)');

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
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '50vw' }}>
            <Media
                {...args}
                title={title}
                description={description}
                onTitleSubmit={handleTitleSubmit}
                onDescriptionSubmit={handleDescriptionSubmit}
            />
        </Box>
    );
};

export const WithEditableCaption: Story = {
    args: {
        ...defaultArgs,
        image: {
            src: getImagePath(TestImage.BEACH, ImageSize.LARGE),
            thumbnailSrc: getImagePath(TestImage.BEACH, ImageSize.LARGE),
            title: TestImage.BEACH,
        },
        title: 'The Cat Takes a Long and Peaceful Nap in a Warm Patch of Afternoon Sunlight.',
        description: '(James Veysey / Shutterstock)',
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
            customCode: WithEditableCaptionExampleCode,
            example: <Example {...args} />,
        }),
};
