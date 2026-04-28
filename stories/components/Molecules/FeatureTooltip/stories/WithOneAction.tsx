import React from 'react';
import { Box, Button } from '@mui/material';
import type { StoryObj } from '@storybook/react-vite';
import { FeatureTooltip, FeatureTooltipProps } from '../../../../../src/index.js';
import { createCodeStory } from '../../../../helpers.js';
import defaultArgs from '../common/defaultArgs.js';
import WithOneActionExampleCode from './code/WithOneActionExample.tsx?raw';

type Story = StoryObj<typeof FeatureTooltip>;

const storyActions: FeatureTooltipProps['actions'] = [{ label: 'Default action', href: 'https://ringpublishing.com/' }];

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
            <FeatureTooltip {...(args as FeatureTooltipProps)}>
                <div style={{ width: '200px' }}>Tooltip with one action and video embed</div>
            </FeatureTooltip>

            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mt: 2 }}>
                If you do not see tooltip:
                <Button onClick={clearTooltipData} variant="outlined" color="primary" sx={{ ml: 1 }}>
                    Clear tooltip data
                </Button>
            </Box>
        </Box>
    );
};

export const WithOneAction: Story = {
    args: {
        ...defaultArgs,
        title: 'Tooltip with one action',
        id: 'ring-feature-tooltip-2',
        actions: storyActions,
        videoEmbed: 'https://www.youtube.com/embed/KRphOlc8tKg?si=xUR6gOpAPDcR74Dk',
    },
    render: (args, context) =>
        createCodeStory({
            context,
            customProps: {},
            customCode: WithOneActionExampleCode,
            example: <Example {...args} />,
        }),
};
