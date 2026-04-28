import React from 'react';
import { Stack } from '@mui/material';
import type { StoryObj } from '@storybook/react-vite';
import { createCodeStory } from '../../../../helpers.js';
import { Accordion } from '../../../../../src/index.js';
import BorderlessExampleCode from './code/BorderlessExample.tsx?raw';

type Story = StoryObj<typeof Accordion>;

const Example = (args: React.ComponentProps<typeof Accordion>): React.JSX.Element => {
    return (
        <Stack direction={'column'}>
            <Accordion {...args} />
            <Accordion {...args} />
            <Accordion {...args} />
        </Stack>
    );
};

export const Borderless: Story = {
    args: {
        label: 'Accordion',
        variant: 'borderless',
        children: <div>Opened accordion</div>,
    },
    render: (args, context) => {
        return createCodeStory({
            context,
            customProps: {},
            customCode: BorderlessExampleCode,
            example: <Example {...args} />,
        });
    },
};
