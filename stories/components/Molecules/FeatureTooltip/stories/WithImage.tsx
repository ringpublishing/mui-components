import React from 'react';
import { Box, Button } from '@mui/material';
import type { StoryObj } from '@storybook/react-vite';
import { action } from 'storybook/actions';
import { createCodeStory } from '../../../../helpers.js';
import WithImageExampleCode from './code/WithImageExample.tsx?raw';
import { FeatureTooltip, FeatureTooltipProps } from '../../../../../src/index.js';
import { getImagePath, ImageSize, TestImage } from '../../../../../src/helpers/stories/imagesData.js';
import defaultArgs from '../common/defaultArgs.js';

type Story = StoryObj<typeof FeatureTooltip>;

const storyActions: FeatureTooltipProps['actions'] = [
    { label: 'Default action', href: 'https://ringpublishing.com/' },
    { label: 'Secondary action', onClick: action('secondary-action-clicked') },
];

const Example = (args: React.ComponentProps<typeof FeatureTooltip>): React.JSX.Element => {
    const clearTooltipData = (): void => {
        try {
            localStorage.removeItem('FeatureTooltips');
            location.reload();
        } catch (error) {
            console.warn(error);
        }
    };

    return (
        <Box sx={{ width: '80%' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <FeatureTooltip {...(args as FeatureTooltipProps)}>
                    <div style={{ width: '200px' }}>Tooltip with image and two actions</div>
                </FeatureTooltip>

                <FeatureTooltip
                    id="ring-feature-tooltip-4b"
                    title="Tooltip with image, no actions"
                    message=""
                    image={args.image}
                    endDate="2026-06-24T10:49:20.823Z"
                >
                    <div style={{ width: '200px' }}>Tooltip with image and no actions</div>
                </FeatureTooltip>
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mt: 2 }}>
                If you do not see tooltip:
                <Button onClick={clearTooltipData} variant="outlined" color="primary" sx={{ ml: 1 }}>
                    Clear tooltip data
                </Button>
            </Box>
        </Box>
    );
};

export const WithImage: Story = {
    args: {
        ...defaultArgs,
        title: 'Tooltip with an image',
        id: 'ring-feature-tooltip-4',
        message: '',
        actions: storyActions,
        image: getImagePath(TestImage.SEA, ImageSize.LARGE),
    },
    render: (args, context) =>
        createCodeStory({
            context,
            customProps: {},
            customCode: WithImageExampleCode,
            example: <Example {...args} />,
        }),
};
