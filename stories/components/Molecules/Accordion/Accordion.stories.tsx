import type { Meta } from '@storybook/react-vite';
import { Accordion } from '../../../../src/index.js';
import { Default as DefaultStory } from './stories/Default.js';
import { WithBorder as WithBorderStory } from './stories/WithBorder.js';
import { WithButton as WithButtonStory } from './stories/WithButton.js';
import { Composition as CompositionStory } from './stories/Composition.js';
import { Multiple as MultipleStory } from './stories/Multiple.js';
import { Group as GroupStory } from './stories/Group.js';
import AccordionMDX from './Accordion.mdx';

const meta: Meta<typeof Accordion> = {
    component: Accordion,
    parameters: {
        docs: {
            page: AccordionMDX,
        },
    },
    args: {
        label: 'Accordion',
    },
    argTypes: {
        label: {
            control: 'text',
            description:
                'Header content. A string is rendered as a `body1` label; pass nodes to compose extra columns (see the Composition story)',
            table: {
                category: 'content',
                defaultValue: { summary: 'Test' },
                type: { summary: 'ReactNode' },
            },
        },
        children: {
            control: false,
            description: 'Content displayed when accordion is expanded',
            table: {
                category: 'content',
                type: { summary: 'ReactNode' },
            },
        },
        buttonLabel: {
            control: 'text',
            description: 'Label for the action button in accordion header',
            table: {
                category: 'action',
                type: { summary: 'string' },
            },
        },
        buttonOnClick: {
            control: false,
            description: 'Click handler for the action button',
            table: {
                category: 'action',
                type: { summary: 'React.MouseEventHandler<HTMLButtonElement>' },
            },
        },
        variant: {
            control: 'select',
            options: ['elevation', 'outlined', 'borderless'],
            description: 'Accordion variant style',
            table: {
                category: 'style',
                defaultValue: { summary: 'borderless' },
                type: { summary: "'elevation' | 'outlined' | 'borderless'" },
            },
        },
        expanded: {
            control: 'boolean',
            description: 'If true, the accordion is expanded',
            table: {
                category: 'behavior',
                type: { summary: 'boolean' },
            },
        },
        defaultExpanded: {
            control: 'boolean',
            description: 'If true, the accordion is expanded by default',
            table: {
                category: 'behavior',
                type: { summary: 'boolean' },
            },
        },
        disabled: {
            control: 'boolean',
            description: 'If true, the accordion is disabled',
            table: {
                category: 'behavior',
                type: { summary: 'boolean' },
            },
        },
        onChange: {
            control: false,
            description: 'Callback fired when the expand/collapse state changes',
            table: {
                category: 'behavior',
                type: { summary: '(event: SyntheticEvent, expanded: boolean) => void' },
            },
        },
        dataTestIdSuffix: {
            control: 'text',
            description: 'Optional suffix added to data-testid attributes for testing',
            table: {
                category: 'testing',
                type: { summary: 'string' },
            },
        },
        sx: {
            control: 'object',
            description: 'Custom styles using MUI sx prop',
            table: {
                category: 'customization',
                type: { summary: 'SxProps<Theme>' },
            },
        },
        className: {
            control: 'text',
            description: 'CSS class name applied to the root element',
            table: {
                category: 'customization',
                type: { summary: 'string' },
            },
        },
    },
};

export default meta;

export const Default = DefaultStory;
export const WithBorder = { ...WithBorderStory, name: 'Border' };
export const WithButton = { ...WithButtonStory, name: 'Header button' };
export const Composition = { ...CompositionStory, tags: ['new@2.0'] };
export const Multiple = MultipleStory;
export const Group = { ...GroupStory, tags: ['new@2.0'] };
