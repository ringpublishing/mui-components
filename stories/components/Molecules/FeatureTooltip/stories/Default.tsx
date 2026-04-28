import React from 'react';
import { Box, Button } from '@mui/material';
import type { StoryObj } from '@storybook/react-vite';
import { action } from 'storybook/actions';
import { createCodeStory } from '../../../../helpers.js';
import DefaultExampleCode from './code/DefaultExample.tsx?raw';
import { FeatureTooltip, FeatureTooltipProps } from '../../../../../src/index.js';
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
                    <div style={{ width: '200px' }}>Tooltip shown only once, after closing not visible</div>
                </FeatureTooltip>

                <FeatureTooltip
                    id="ring-feature-tooltip-capping"
                    title="Tooltip with capping"
                    capping={3}
                    message=""
                    videoEmbed="https://www.youtube.com/embed/KRphOlc8tKg?si=xUR6gOpAPDcR74Dk"
                    actions={storyActions}
                    endDate="2026-06-24T10:49:20.823Z"
                >
                    <div style={{ width: '200px' }}>Tooltip with capping (should be visible 3 times)</div>
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

export const Default: Story = {
    args: {
        ...defaultArgs,
        title: 'Standard tooltip',
        id: 'ring-feature-tooltip-1',
        actions: storyActions,
    },
    render: (args, context) =>
        createCodeStory({
            context,
            customProps: {},
            customCode: DefaultExampleCode,
            example: <Example {...args} />,
        }),
};
