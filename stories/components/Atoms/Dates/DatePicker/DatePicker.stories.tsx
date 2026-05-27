import { LocalizationProvider } from '@mui/x-date-pickers-pro';
import { AdapterDayjs } from '@mui/x-date-pickers-pro/AdapterDayjs';
import type { Meta } from '@storybook/react-vite';
import 'dayjs/locale/en';
import React from 'react';
import { DatePicker } from '../../../../../src/index.js';
import defaultArgs from './common/defaultArgs.js';
import DatePickerMdx from './DatePicker.mdx';
import { Actions } from './stories/Actions.js';
import { CustomStyles } from './stories/CustomStyles.js';
import { Default } from './stories/Default.js';
import { DefaultValue } from './stories/DefaultValue.js';
import { Disabled } from './stories/Disabled.js';
import { Label } from './stories/Label.js';
import { NowButton } from './stories/NowButton.js';
import { Outlined } from './stories/Outlined.js';

const meta = {
    component: DatePicker,
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
            page: DatePickerMdx,
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
                type: { summary: 'string' },
            },
        },
        dataTestIdSuffix: {
            control: 'text',
            description: 'Optional suffix for the generated test id (base: ring-date-picker).',
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
                type: { summary: 'string' },
            },
        },
        currentDateLabel: {
            control: 'text',
            description:
                'Label for the "Now" shortcut button in the calendar popup. When set, a button appears that selects the current date.',
            table: {
                category: 'content',
                type: { summary: 'string' },
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
            description: 'Disables the date picker input and calendar button.',
            table: {
                category: 'behavior',
                defaultValue: { summary: 'false' },
                type: { summary: 'boolean' },
            },
        },
        defaultValue: {
            control: false,
            description: 'Initial date value. Accepts a dayjs instance.',
            table: {
                category: 'state',
                type: { summary: 'Dayjs' },
            },
        },
        value: {
            control: false,
            description: 'Controlled date value. Use with `onChange` for controlled mode.',
            table: {
                category: 'state',
                type: { summary: 'Dayjs' },
            },
        },
        onChange: {
            description: 'Callback fired when the date value changes.',
            table: {
                category: 'callbacks',
                type: { summary: '(value: Dayjs | null) => void' },
            },
        },
        onAccept: {
            description: 'Callback fired when the date is accepted (calendar closed or date selected).',
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
} satisfies Meta<typeof DatePicker>;

export default meta;

export { Default, Disabled, CustomStyles, DefaultValue, Label, Actions, NowButton, Outlined };
