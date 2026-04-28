import React from 'react';
import { LocalizationProvider } from '@mui/x-date-pickers-pro';
import { AdapterDayjs } from '@mui/x-date-pickers-pro/AdapterDayjs';
import type { Meta } from '@storybook/react-vite';
import 'dayjs/locale/en';
import { TimePicker } from '../../../../../src/index.js';
import { Default } from './stories/Default.js';
import { Disabled } from './stories/Disabled.js';
import { CustomStyles } from './stories/CustomStyles.js';
import { DefaultValue } from './stories/DefaultValue.js';
import { Label } from './stories/Label.js';
import { Outlined } from './stories/Outlined.js';
import { Comparison } from './stories/Comparison.js';
import defaultArgs from './common/defaultArgs.js';
import TimePickerMdx from './TimePicker.mdx';

const meta = {
    component: TimePicker,
    decorators: [
        (Story): React.JSX.Element => (
            <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="en">
                <div style={{ padding: '20px' }}>
                    <Story />
                </div>
            </LocalizationProvider>
        ),
    ],
    parameters: {
        docs: {
            page: TimePickerMdx,
        },
    },
    args: {
        ...defaultArgs,
    },
    argTypes: {
        sx: {
            control: 'object',
            description: 'MUI System properties to customize the component style.',
            table: {
                category: 'customization',
                type: { summary: 'SxProps<Theme>' },
            },
        },
        slotProps: {
            control: 'object',
            description:
                'Props passed to internal sub-components (field, textField, openPickerButton, clearButton, etc.). Use `textField.variant` to switch between "standard" and "outlined".',
            table: {
                category: 'customization',
                type: { summary: 'object' },
            },
        },
        className: {
            control: 'text',
            type: 'string',
            description: 'CSS class name applied to the root element.',
            table: {
                category: 'customization',
            },
        },
        dataTestIdSuffix: {
            control: 'text',
            description: 'Optional suffix for the generated test id (base: ring-time-picker).',
            table: {
                category: 'customization',
                type: { summary: 'string' },
            },
        },
        label: {
            control: 'text',
            description: 'Floating label text displayed above the input field.',
            table: {
                category: 'content',
            },
        },
        disabled: {
            control: 'boolean',
            description: 'Disables the time picker input and clock button.',
            table: {
                category: 'behavior',
                defaultValue: { summary: 'false' },
            },
        },
        defaultValue: {
            control: false,
            description: 'Initial time value. Accepts a dayjs instance.',
            table: {
                category: 'state',
                type: { summary: 'Dayjs' },
            },
        },
        value: {
            control: false,
            description: 'Controlled time value. Use with `onChange` for controlled mode.',
            table: {
                category: 'state',
                type: { summary: 'Dayjs' },
            },
        },
        onChange: {
            description: 'Callback fired when the time value changes.',
            table: {
                category: 'callbacks',
                type: { summary: '(value: Dayjs | null) => void' },
            },
        },
        onAccept: {
            description: 'Callback fired when the time is accepted (popup closed or value selected).',
            table: {
                category: 'callbacks',
                type: { summary: '(value: Dayjs | null) => void' },
            },
        },
        onOpen: {
            description: 'Callback fired when the clock popup opens.',
            table: {
                category: 'callbacks',
                type: { summary: '() => void' },
            },
        },
        onClose: {
            description: 'Callback fired when the clock popup closes.',
            table: {
                category: 'callbacks',
                type: { summary: '() => void' },
            },
        },
    },
} satisfies Meta<typeof TimePicker>;

export default meta;

export { Default, Disabled, CustomStyles, DefaultValue, Label, Outlined, Comparison };
