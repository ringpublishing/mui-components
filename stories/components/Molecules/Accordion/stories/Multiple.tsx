import React from 'react';
import { Box, Stack } from '@mui/material';
import type { StoryObj } from '@storybook/react-vite';
import { createCodeStory } from '../../../../helpers.js';
import { Accordion } from '../../../../../src/index.js';
import MultipleExampleCode from './code/MultipleExample.tsx?raw';

type Story = StoryObj<typeof Accordion>;

const Example = (args: React.ComponentProps<typeof Accordion>): React.JSX.Element => (
    <Stack direction={'column'}>
        <Accordion {...args} />
        <Accordion {...args} />
        <Accordion {...args} />
    </Stack>
);

export const Multiple: Story = {
    args: {
        label: 'Accordion',
        children: <div>Opened accordion</div>,
    },
    render: (args, context) => {
        if (context?.viewMode === 'story') {
            return (
                <Box style={{ margin: '0 auto', width: '300px', marginTop: '50vh' }}>
                    <Example {...args} />
                </Box>
            );
        }

        return createCodeStory({
            context,
            customProps: {},
            customCode: MultipleExampleCode,
            example: <Example {...args} />,
        });
    },
};
