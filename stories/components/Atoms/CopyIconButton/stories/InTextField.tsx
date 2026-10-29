import React, { useState } from 'react';
import type { StoryObj } from '@storybook/react-vite';
import { InputAdornment } from '@mui/material';
import { createCodeStory } from '../../../../helpers.js';
import InTextFieldExampleCode from './code/InTextFieldExample.tsx?raw';
import { CopyIconButton, TextField } from '../../../../../src/index.js';

type Story = StoryObj<typeof CopyIconButton>;

const Example = (args: React.ComponentProps<typeof CopyIconButton>): React.JSX.Element => {
    const [value, setValue] = useState('0ebeedf7-aebc-4f09-8888-37715df857c0');

    return (
        <TextField
            label="Identifier (UUID)"
            value={value}
            onChange={(event: React.ChangeEvent<HTMLInputElement>): void => setValue(event.target.value)}
            slotProps={{
                input: {
                    endAdornment: (
                        <InputAdornment position="end">
                            <CopyIconButton {...args} value={value} />
                        </InputAdornment>
                    ),
                },
            }}
        />
    );
};

export const InTextField: Story = {
    args: {
        labels: { copy: 'Copy', copied: 'Copied' },
    },
    render: (args, context) => {
        return createCodeStory({
            context,
            customProps: {},
            customCode: InTextFieldExampleCode,
            example: <Example {...args} />,
        });
    },
};
