import React from 'react';
import type { StoryObj } from '@storybook/react-vite';
import { Box } from '@mui/material';
import { createCodeStory } from '../../../../helpers.js';
import WithFullScreenImageExampleCode from './code/WithFullScreenImageExample.tsx?raw';
import { Detail } from '../../../../../src/index.js';
import { getImagePath, ImageSize, TestImage } from '../../../../helpers/imagesData.js';

type Story = StoryObj<typeof Detail>;

const Example = (): React.JSX.Element => (
    <Box display={'flex'} justifyContent={'center'}>
        <Detail
            main={{
                title: 'Full-screen image',
                onCloseClick: (): void => undefined,
                mediaProps: {
                    image: {
                        src: getImagePath(TestImage.BEACH, ImageSize.MEDIUM),
                        title: 'A person walking a dog on a rocky beach below white cliffs',
                    },
                    ratio: '16/9',
                    objectFit: 'cover',
                    imageFullScreenPreview: true,
                    fullScreenImageUrl: getImagePath(TestImage.BEACH, ImageSize.LARGE),
                },
            }}
        />
    </Box>
);

export const WithFullScreenImage: Story = {
    parameters: {
        docs: {
            description: {
                story:
                    'The complete set of image props on `main.mediaProps`. `image` renders the thumbnail; ' +
                    '`imageFullScreenPreview` adds the download and zoom buttons; `fullScreenImageUrl` is the ' +
                    'file the download button fetches.',
            },
        },
    },
    // eslint-disable-next-line @typescript-eslint/naming-convention -- render args unused (story is self-contained); underscore-prefixed param marks intent
    render: (_args, context) =>
        createCodeStory({
            context,
            customProps: {},
            customCode: WithFullScreenImageExampleCode,
            example: <Example />,
        }),
};
