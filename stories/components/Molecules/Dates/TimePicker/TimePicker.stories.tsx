import React from 'react';
import { LocalizationProvider } from '@mui/x-date-pickers-pro';
import { AdapterDayjs } from '@mui/x-date-pickers-pro/AdapterDayjs';
import type { Meta } from '@storybook/react-vite';
import 'dayjs/locale/en';
import { TimePicker } from '../../../../../src/index.js';
import { Default as DefaultStory } from './stories/Default.js';
import { Disabled as DisabledStory } from './stories/Disabled.js';
import { Label as LabelStory } from './stories/Label.js';
import { DefaultValue as DefaultValueStory } from './stories/DefaultValue.js';
import { CustomStyles as CustomStylesStory } from './stories/CustomStyles.js';
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
                "Props passed to internal sub-components (field, textField, openPickerButton, clearButton, etc.). The field defaults to `outlined`; `textField.variant: 'standard'` renders a standard field.",
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
            description: 'Optional suffix for the generated test id (base: ring-timepicker).',
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
        disabled: {
            control: 'boolean',
            description: 'Disables the time picker input and clock button.',
            table: {
                category: 'behavior',
                defaultValue: { summary: 'false' },
                type: { summary: 'boolean' },
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

export const Default = DefaultStory;
export const Disabled = DisabledStory;
export const Label = LabelStory;
export const DefaultValue = { ...DefaultValueStory, name: 'Default value' };
export const CustomStyles = { ...CustomStylesStory, name: 'Custom styles' };
