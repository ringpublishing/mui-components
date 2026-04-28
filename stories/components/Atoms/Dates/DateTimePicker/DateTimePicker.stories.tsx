import React from 'react';
import { LocalizationProvider } from '@mui/x-date-pickers-pro';
import { AdapterDayjs } from '@mui/x-date-pickers-pro/AdapterDayjs';
import type { Meta } from '@storybook/react-vite';
import 'dayjs/locale/en';
import { DateTimePicker } from '../../../../../src/index.js';
import { Default } from './stories/Default.js';
import { Disabled } from './stories/Disabled.js';
import { CustomStyles } from './stories/CustomStyles.js';
import { DefaultValue } from './stories/DefaultValue.js';
import { Label } from './stories/Label.js';
import { Actions } from './stories/Actions.js';
import { Outlined } from './stories/Outlined.js';
import defaultArgs from './common/defaultArgs.js';
import DateTimePickerMdx from './DateTimePicker.mdx';

const meta = {
    component: DateTimePicker,
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
            page: DateTimePickerMdx,
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
            description: 'Optional suffix for the generated test id (base: ring-date-time-picker).',
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
        actions: {
            control: 'object',
            description: 'Custom action buttons displayed at the end of the input field.',
            table: {
                category: 'behavior',
                type: { summary: 'Action[]' },
            },
        },
        disabled: {
            control: 'boolean',
            description: 'Disables the date-time picker input and calendar button.',
            table: {
                category: 'behavior',
                defaultValue: { summary: 'false' },
            },
        },
        defaultValue: {
            control: false,
            description: 'Initial date-time value. Accepts a dayjs instance.',
            table: {
                category: 'state',
                type: { summary: 'Dayjs' },
            },
        },
        value: {
            control: false,
            description: 'Controlled date-time value. Use with `onChange` for controlled mode.',
            table: {
                category: 'state',
                type: { summary: 'Dayjs' },
            },
        },
        onChange: {
            description: 'Callback fired when the date-time value changes.',
            table: {
                category: 'callbacks',
                type: { summary: '(value: Dayjs | null) => void' },
            },
        },
        onAccept: {
            description: 'Callback fired when the date-time is accepted (popup closed or value selected).',
            table: {
                category: 'callbacks',
                type: { summary: '(value: Dayjs | null) => void' },
            },
        },
        onOpen: {
            description: 'Callback fired when the calendar popup opens.',
            table: {
                category: 'callbacks',
                type: { summary: '() => void' },
            },
        },
        onClose: {
            description: 'Callback fired when the calendar popup closes.',
            table: {
                category: 'callbacks',
                type: { summary: '() => void' },
            },
        },
    },
} satisfies Meta<typeof DateTimePicker>;

export default meta;

export { Default, Disabled, CustomStyles, DefaultValue, Label, Actions, Outlined };
