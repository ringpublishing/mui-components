import React from 'react';
import { Box, Button } from '@mui/material';
import type { StoryObj } from '@storybook/react-vite';
import { createCodeStory } from '../../../../helpers.js';
import WithNoActionsExampleCode from './code/WithNoActionsExample.tsx?raw';
import { FeatureTooltip, FeatureTooltipProps } from '../../../../../src/index.js';
import defaultArgs from '../common/defaultArgs.js';

type Story = StoryObj<typeof FeatureTooltip>;

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
                <div style={{ width: '200px' }}>Tooltip without action buttons</div>
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

export const WithNoActions: Story = {
    args: {
        ...defaultArgs,
        title: 'Tooltip with no actions',
        id: 'ring-feature-tooltip-3',
        actions: undefined,
    },
    render: (args, context) =>
        createCodeStory({
            context,
            customProps: {},
            customCode: WithNoActionsExampleCode,
            example: <Example {...args} />,
        }),
};
