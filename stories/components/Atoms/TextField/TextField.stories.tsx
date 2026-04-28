import type { Meta } from '@storybook/react-vite';
import { TextField } from '../../../../src/index.js';
import { Default } from './stories/Default.js';
import { WithMultipleActions } from './stories/WithMultipleActions.js';
import { Controlled } from './stories/Controlled.js';
import defaultArgs from './common/defaultArgs.js';
import TextFieldMdx from './TextField.mdx';

const meta: Meta<typeof TextField> = {
    component: TextField,
    parameters: {
        docs: {
            page: TextFieldMdx,
        },
    },
    args: {
        ...defaultArgs,
    },
    argTypes: {
        actions: {
            control: 'object',
            description:
                'Array of actions rendered as icon buttons in the end adornment. A single action shows a standalone button with tooltip; multiple actions collapse into a MoreVert menu.',
            table: {
                category: 'content',
                type: {
                    summary: 'Action[]',
                    detail: '{ label: string; onClick?: (e?) => void; disabled?: boolean; disabledReason?: string; icon?: React.JSX.Element }[]',
                },
            },
        },
        sx: {
            control: 'object',
            description: 'The system prop that allows defining system overrides as well as additional CSS styles.',
            table: {
                category: 'customization',
                type: { summary: 'SxProps<Theme>' },
            },
        },
        className: {
            control: 'text',
            description: 'CSS class name applied to the root element.',
            table: {
                category: 'customization',
                type: { summary: 'string' },
            },
        },
        InputProps: {
            control: false,
            description: 'Props applied to the Input element.',
            table: {
                category: 'customization',
                type: { summary: 'Partial<OutlinedInputProps>' },
            },
        },
        InputLabelProps: {
            control: false,
            description: 'Props applied to the InputLabel element.',
            table: {
                category: 'customization',
                type: { summary: 'Partial<InputLabelProps>' },
            },
        },
        variant: {
            control: 'select',
            options: ['outlined', 'filled', 'standard'],
            description: 'The variant to use.',
            table: {
                category: 'appearance',
                type: { summary: "'outlined' | 'filled' | 'standard'" },
                defaultValue: { summary: 'outlined' },
            },
        },
        size: {
            control: 'select',
            options: ['small', 'medium'],
            description: 'The size of the component.',
            table: {
                category: 'appearance',
                type: { summary: "'small' | 'medium'" },
                defaultValue: { summary: 'medium' },
            },
        },
        disabled: {
            control: 'boolean',
            description: 'If true, the component is disabled.',
            table: {
                category: 'state',
                type: { summary: 'boolean' },
                defaultValue: { summary: 'false' },
            },
        },
        placeholder: {
            control: 'text',
            description: 'The short hint displayed in the input before the user enters a value.',
            table: {
                category: 'content',
                type: { summary: 'string' },
            },
        },
        dataTestIdSuffix: {
            control: 'text',
            description: 'Suffix appended to the data-testid attribute. Results in ring-textfield-{suffix}.',
            table: {
                category: 'testing',
                type: { summary: 'string' },
            },
        },
    },
};

export default meta;

export { Default, WithMultipleActions, Controlled };
