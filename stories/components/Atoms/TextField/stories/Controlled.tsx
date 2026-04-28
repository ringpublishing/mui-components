import React, { ChangeEvent, useState } from 'react';
import type { StoryObj } from '@storybook/react-vite';
import { ClearOutlined } from '@mui/icons-material';
import { createCodeStory } from '../../../../helpers.js';
import ControlledExampleCode from './code/ControlledExample.tsx?raw';
import { TextField, TextFieldProps } from '../../../../../src/index.js';

type Story = StoryObj<typeof TextField>;

function ControlledExample(args: TextFieldProps): React.JSX.Element {
    const [value, setValue] = useState('');

    function handleOnChange(event: ChangeEvent<HTMLInputElement>): void {
        setValue(event.target.value);
    }

    return (
        <TextField
            {...args}
            value={value}
            onChange={handleOnChange}
            actions={
                value
                    ? [
                          {
                              icon: <ClearOutlined />,
                              onClick: () => setValue(''),
                              label: 'Clear',
                          },
                      ]
                    : []
            }
        />
    );
}

export const Controlled: Story = {
    args: {},
    render: (args, context) => {
        return createCodeStory({
            context,
            customProps: {},
            customCode: ControlledExampleCode,
            example: <ControlledExample {...args} />,
        });
    },
};
