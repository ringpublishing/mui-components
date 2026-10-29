import type { Meta } from '@storybook/react-vite';
import { CopyIconButton } from '../../../../src/index.js';
import { Default as DefaultStory } from './stories/Default.js';
import { InTextField as InTextFieldStory } from './stories/InTextField.js';
import defaultArgs from './common/defaultArgs.js';
import CopyIconButtonMdx from './CopyIconButton.mdx';

const meta: Meta<typeof CopyIconButton> = {
    component: CopyIconButton,
    tags: ['new@2.0'],
    parameters: {
        docs: {
            page: CopyIconButtonMdx,
        },
    },
    args: {
        ...defaultArgs,
    },
    argTypes: {
        value: {
            control: 'text',
            description: 'The text written to the clipboard.',
            table: {
                category: 'content',
                type: { summary: 'string' },
            },
        },
        labels: {
            control: 'object',
            description:
                'Labels for the tooltip and the accessible name: `copy` before the click, `copied` while the confirmation shows.',
            table: {
                category: 'content',
                type: { summary: '{ copy?: string; copied?: string }' },
                defaultValue: { summary: "{ copy: 'Copy', copied: 'Copied' }" },
            },
        },
        ariaLabels: {
            control: 'object',
            description:
                'Accessible names of the button when they should differ from the visible `labels`: `copy` before the click, `copied` while the confirmation shows. Default to `labels`.',
            table: {
                category: 'content',
                type: { summary: '{ copy?: string; copied?: string }' },
                defaultValue: { summary: 'labels' },
            },
        },
        copiedForMs: {
            control: 'number',
            description:
                'How long the confirmation stays before the button returns to its copy state, in milliseconds.',
            table: {
                category: 'behavior',
                type: { summary: 'number' },
                defaultValue: { summary: '1500' },
            },
        },
        size: {
            control: 'select',
            options: ['small', 'medium', 'large'],
            description: 'Size of the button outside a field; inside a field the theme sizes it.',
            table: {
                category: 'appearance',
                type: { summary: "'small' | 'medium' | 'large'" },
                defaultValue: { summary: "'medium'" },
            },
        },
        disabled: {
            control: 'boolean',
            description: 'Disables the button.',
            table: {
                category: 'state',
                type: { summary: 'boolean' },
                defaultValue: { summary: 'false' },
            },
        },
        onCopied: {
            action: 'onCopied',
            description: 'Called after the value has been written to the clipboard.',
            table: {
                category: 'callbacks',
                type: { summary: '(value: string) => void' },
            },
        },
        onCopyError: {
            action: 'onCopyError',
            description: 'Called when writing to the clipboard fails; the button then shows no confirmation.',
            table: {
                category: 'callbacks',
                type: { summary: '(error: unknown) => void' },
            },
        },
        sx: {
            control: 'object',
            description: 'MUI sx prop for custom styling of the button.',
            table: {
                category: 'customization',
                type: { summary: 'SxProps<Theme>' },
            },
        },
        className: {
            control: 'text',
            description: 'CSS class name applied to the button.',
            table: {
                category: 'customization',
                type: { summary: 'string' },
            },
        },
        dataTestIdSuffix: {
            control: 'text',
            description: 'Suffix appended to the data-testid attribute.',
            table: {
                category: 'customization',
                type: { summary: 'string' },
            },
        },
    },
};

export default meta;

export const Default = DefaultStory;
export const InTextField = { ...InTextFieldStory, name: 'In TextField' };
