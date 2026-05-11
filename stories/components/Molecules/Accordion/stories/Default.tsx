import React from 'react';
import { Box, TextField } from '@mui/material';
import type { StoryObj } from '@storybook/react-vite';
import { createCodeStory } from '../../../../helpers.js';
import { Accordion } from '../../../../../src/index.js';
import DefaultExampleCode from './code/DefaultExample.tsx?raw';

type Story = StoryObj<typeof Accordion>;

const Example = (args: React.ComponentProps<typeof Accordion>): React.JSX.Element => {
    return <Accordion {...args} />;
};

export const Default: Story = {
    args: {
        label: 'Accordion',
        children: <TextField required={true} id="outlined-required" label="Required" defaultValue="Hello World" />,
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
            customCode: DefaultExampleCode,
            example: <Example {...args} />,
        });
    },
};
