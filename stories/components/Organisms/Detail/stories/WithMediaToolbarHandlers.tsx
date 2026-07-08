import React, { useState } from 'react';
import type { StoryObj } from '@storybook/react-vite';
import { Box, Button, Stack } from '@mui/material';
import { action } from 'storybook/actions';
import { createCodeStory } from '../../../../helpers.js';
import WithMediaToolbarHandlersExampleCode from './code/WithMediaToolbarHandlersExample.tsx?raw';
import { Detail } from '../../../../../src/index.js';
import { getImagePath, ImageSize, TestImage } from '../../../../../src/helpers/stories/imagesData.js';

type Story = StoryObj<typeof Detail>;

const Example = (): React.JSX.Element => {
    const [showDownload, setShowDownload] = useState(true);

    return (
        <Stack spacing={2} alignItems="center">
            <Button variant="outlined" onClick={(): void => setShowDownload((value) => !value)}>
                {showDownload ? 'Hide download icon' : 'Show download icon'}
            </Button>
            <Box display={'flex'} justifyContent={'center'}>
                <Detail
                    main={{
                        title: 'Custom media toolbar handlers',
                        onCloseClick: (): void => undefined,
                        mediaProps: {
                            ratio: '4/3',
                            objectFit: 'cover',
                            imageFullScreenPreview: true,
                            image: {
                                src: getImagePath(TestImage.CAR, ImageSize.LARGE),
                                title: TestImage.CAR,
                            },
                            enableDownloadIcon: showDownload,
                            handleImageDownload: action('handleImageDownload'),
                            handleFullScreenPreview: action('handleFullScreenPreview'),
                        },
                    }}
                />
            </Box>
        </Stack>
    );
};

export const WithMediaToolbarHandlers: Story = {
    name: 'With Media Toolbar Handlers',
    parameters: {
        docs: {
            description: {
                story:
                    'The media toolbar buttons can be hidden and/or have their behavior overridden via ' +
                    '`main.mediaProps`. Both handlers receive the resolved image (`fullScreenImageUrl || image`) ' +
                    'and mirror the LightBox API:\n\n' +
                    '- **Download** — `enableDownloadIcon` (default `true`) toggles the icon; ' +
                    '`handleImageDownload` replaces the default `downloadImage(...)` call.\n' +
                    '- **Full-screen preview (zoom)** — `handleFullScreenPreview` overrides the button; ' +
                    'when provided, the built-in LightBox is not rendered so the consumer can open its own viewer.',
            },
        },
    },
    // eslint-disable-next-line @typescript-eslint/naming-convention -- render args unused (story is self-contained); underscore-prefixed param marks intent
    render: (_args, context) =>
        createCodeStory({
            context,
            customProps: {},
            customCode: WithMediaToolbarHandlersExampleCode,
            example: <Example />,
        }),
};
