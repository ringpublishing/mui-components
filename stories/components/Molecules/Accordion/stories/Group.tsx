import React from 'react';
import { Box, Stack, Typography } from '@mui/material';
import type { StoryObj } from '@storybook/react-vite';
import { createCodeStory } from '../../../../helpers.js';
import { Accordion } from '../../../../../src/index.js';
import GroupExampleCode from './code/GroupExample.tsx?raw';

type Story = StoryObj<typeof Accordion>;

const rowLabel = (
    <>
        <Typography variant="body1" component="span">
            Accordion
        </Typography>
        <Typography variant="body1" component="span" color="text.secondary">
            Secondary
        </Typography>
    </>
);

const Example = (args: React.ComponentProps<typeof Accordion>): React.JSX.Element => (
    <Stack direction={'column'}>
        <Accordion {...args} />
        <Accordion {...args} defaultExpanded={true}>
            <div>Opened accordion content</div>
        </Accordion>
        <Accordion {...args} disabled={true} />
    </Stack>
);

export const Group: Story = {
    args: {
        label: rowLabel,
    },
    parameters: {
        docs: {
            description: {
                story: 'Rows stacked in a column, each with a two-column label, shown collapsed, expanded with content, and disabled. Each row draws its divider on its own bottom edge; the last row has none.',
            },
        },
    },
    render: (args, context) => {
        if (context?.viewMode === 'story') {
            return (
                <Box style={{ margin: '0 auto', width: '600px', marginTop: '30vh' }}>
                    <Example {...args} />
                </Box>
            );
        }

        return createCodeStory({
            context,
            customProps: {},
            customCode: GroupExampleCode,
            example: <Example {...args} />,
        });
    },
};
