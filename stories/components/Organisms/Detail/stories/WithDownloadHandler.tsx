import React, { useState } from 'react';
import type { StoryObj } from '@storybook/react-vite';
import { Box, Button, Stack } from '@mui/material';
import { action } from 'storybook/actions';
import { createCodeStory } from '../../../../helpers.js';
import WithDownloadHandlerExampleCode from './code/WithDownloadHandlerExample.tsx?raw';
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
                        title: 'Custom download handling',
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
                        },
                    }}
                />
            </Box>
        </Stack>
    );
};

export const WithDownloadHandler: Story = {
    name: 'With Download Handler',
    parameters: {
        docs: {
            description: {
                story:
                    'The media toolbar download icon can be hidden via `main.mediaProps.enableDownloadIcon` ' +
                    '(default `true`) and its behavior overridden via `main.mediaProps.handleImageDownload`. ' +
                    'When `handleImageDownload` is provided it replaces the default `downloadImage(...)` call and ' +
                    'receives the resolved image (`fullScreenImageUrl || image`). Both props mirror the LightBox API.',
            },
        },
    },
    // eslint-disable-next-line @typescript-eslint/naming-convention -- render args unused (story is self-contained); underscore-prefixed param marks intent
    render: (_args, context) =>
        createCodeStory({
            context,
            customProps: {},
            customCode: WithDownloadHandlerExampleCode,
            example: <Example />,
        }),
};
