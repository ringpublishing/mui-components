import React from 'react';
import { Box } from '@mui/material';
import type { StoryObj } from '@storybook/react-vite';
import { createCodeStory } from '../../../../helpers.js';
import { Accordion } from '../../../../../src/index.js';
import WithBorderExampleCode from './code/WithBorderExample.tsx?raw';

type Story = StoryObj<typeof Accordion>;

const Example = (args: React.ComponentProps<typeof Accordion>): React.JSX.Element => {
    return <Accordion {...args} />;
};

export const WithBorder: Story = {
    args: {
        label: 'With Border',
        children: <div>Opened accordion</div>,
        variant: 'outlined',
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
            customCode: WithBorderExampleCode,
            example: <Example {...args} />,
        });
    },
};
