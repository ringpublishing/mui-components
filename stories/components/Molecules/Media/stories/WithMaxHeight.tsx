import React from 'react';
import type { StoryObj } from '@storybook/react-vite';
import { Box } from '@mui/material';
import { AccessAlarm, AcUnit } from '@mui/icons-material';
import { createCodeStory } from '../../../../helpers.js';
import WithMaxHeightExampleCode from './code/WithMaxHeightExample.tsx?raw';
import { Media } from '../../../../../src/index.js';
import { getImagePath, TestImage, ImageSize } from '../../../../../src/helpers/stories/imagesData.js';

type Story = StoryObj<typeof Media>;

const Example = (args: React.ComponentProps<typeof Media>): React.JSX.Element => (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '50vw', marginLeft: '25vw' }}>
        <Media {...args} />
    </Box>
);

export const WithMaxHeight: Story = {
    args: {
        image: {
            src: getImagePath(TestImage.BEACH, ImageSize.LARGE),
            thumbnailSrc: getImagePath(TestImage.BEACH, ImageSize.LARGE),
            title: TestImage.BEACH,
        },
        ratio: '1/1',
        objectFit: 'cover',
        height: '200px',
        title: 'Beach image',
        description: 'Sample description rendered below media area',
        disableFullScreenPreview: true,
        statusLabels: [{ label: 'Main Image', color: 'primary', icon: <AccessAlarm /> }],
        actions: [
            { label: 'Action 1', icon: <AcUnit /> },
            { label: 'Action 2', icon: <AccessAlarm /> },
        ],
    },
    render: (args, context) => {
        if (context?.viewMode === 'story') {
            return <Example {...args} />;
        }

        return createCodeStory({
            context,
            customProps: {},
            customCode: WithMaxHeightExampleCode,
            example: <Example {...args} />,
        });
    },
};
