import React from 'react';
import { Box, Typography } from '@mui/material';
import type { StoryObj } from '@storybook/react-vite';
import { createCodeStory } from '../../../../helpers.js';
import { Accordion } from '../../../../../src/index.js';
import CompositionExampleCode from './code/CompositionExample.tsx?raw';

type Story = StoryObj<typeof Accordion>;

const Example = (args: React.ComponentProps<typeof Accordion>): React.JSX.Element => {
    return <Accordion {...args} />;
};

export const Composition: Story = {
    args: {
        label: (
            <>
                <Typography variant="body1" component="span">
                    Accordion
                </Typography>
                <Typography variant="body1" component="span" color="text.secondary">
                    Secondary
                </Typography>
            </>
        ),
        children: <div>Opened accordion</div>,
    },
    parameters: {
        docs: {
            description: {
                story: "A second column is composed from `label` nodes instead of being configured through a prop, the same way MUI's own `AccordionSummary` accepts arbitrary children. Note that the story sets no column widths — the summary lays the columns out, so every consumer gets the same geometry for free.",
            },
        },
    },
    render: (args, context) => {
        if (context?.viewMode === 'story') {
            return (
                <Box style={{ margin: '0 auto', width: '600px', marginTop: '50vh' }}>
                    <Example {...args} />
                </Box>
            );
        }

        return createCodeStory({
            context,
            customProps: {},
            customCode: CompositionExampleCode,
            example: <Example {...args} />,
        });
    },
};
