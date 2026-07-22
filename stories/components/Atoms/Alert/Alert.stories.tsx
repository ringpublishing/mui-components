import type { Meta } from '@storybook/react-vite';

import { Alert } from '../../../../src/index.js';
import { Default } from './stories/Default.js';
import { ContentVariants } from './stories/ContentVariants.js';
import { Severities } from './stories/Severities.js';
import { LayoutVariants } from './stories/LayoutVariants.js';
import { WithAction } from './stories/WithAction.js';
import { WithLinkAction } from './stories/WithLinkAction.js';
import { WithClose } from './stories/WithClose.js';
import { WithActionAndClose } from './stories/WithActionAndClose.js';
import defaultArgs from './common/defaultArgs.js';
import AlertMdx from './Alert.mdx';

const meta: Meta<typeof Alert> = {
    component: Alert,
    parameters: {
        docs: {
            page: AlertMdx,
        },
    },
    args: {
        ...defaultArgs,
    },
    argTypes: {
        title: {
            control: 'text',
            description: 'Alert title rendered as the primary line of content.',
            table: {
                category: 'content',
                type: { summary: 'ReactNode' },
            },
        },
        description: {
            control: 'text',
            description: 'Optional description rendered below the title.',
            table: {
                category: 'content',
                type: { summary: 'ReactNode' },
            },
        },
        severity: {
            control: 'select',
            options: ['info', 'success', 'warning', 'error'],
            description: 'Severity state used by MUI to choose the visual tone and icon.',
            table: {
                category: 'appearance',
                type: { summary: 'AlertProps["severity"]' },
                defaultValue: { summary: 'info' },
            },
        },
        action: {
            control: false,
            description:
                'Action button configuration rendered after the message. Use onClick for actions or href for navigation.',
            table: {
                category: 'content',
                type: {
                    summary:
                        '{ label: string; buttonProps?: ButtonProps & { target?: string; rel?: string } } & ({ onClick: (event: React.MouseEvent<HTMLButtonElement>) => void; href?: never } | { href: string; onClick?: never })',
                },
            },
        },
        actionsPlacement: {
            control: 'select',
            options: ['right', 'bottom'],
            description: 'Placement of the action button relative to the content.',
            table: {
                category: 'appearance',
                type: { summary: "'right' | 'bottom'" },
                defaultValue: { summary: 'right' },
            },
        },
        layoutVariant: {
            control: 'select',
            options: ['outline', 'inline'],
            description: 'Controls the Alert frame treatment.',
            table: {
                category: 'appearance',
                type: { summary: "'outline' | 'inline'" },
                defaultValue: { summary: 'outline' },
            },
        },
        onClose: {
            control: false,
            description: 'Callback fired when the close button is clicked. Renders the shared X icon.',
            table: {
                category: 'callbacks',
                type: { summary: '(event: React.SyntheticEvent) => void' },
            },
        },
        closeText: {
            control: 'text',
            description: 'ARIA label for the close button.',
            table: {
                category: 'customization',
                type: { summary: 'string' },
                defaultValue: { summary: 'Close' },
            },
        },
        role: {
            control: 'text',
            description: 'ARIA role for the alert root.',
            table: {
                category: 'customization',
                type: { summary: 'string' },
            },
        },
        icon: {
            control: false,
            description: 'Overrides the default severity icon.',
            table: {
                category: 'appearance',
                type: { summary: 'ReactNode | false' },
            },
        },
        sx: {
            control: 'object',
            description: 'MUI sx prop for custom styling.',
            table: {
                category: 'customization',
                type: { summary: 'SxProps<Theme>' },
            },
        },
        className: {
            control: 'text',
            description: 'Additional class name applied to the root element.',
            table: {
                category: 'customization',
                type: { summary: 'string' },
            },
        },
        dataTestIdSuffix: {
            control: 'text',
            description: 'Suffix appended to the root data-testid.',
            table: {
                category: 'testing',
                type: { summary: 'string' },
            },
        },
    },
};

export default meta;

export {
    Default,
    ContentVariants,
    Severities,
    LayoutVariants,
    WithAction,
    WithLinkAction,
    WithClose,
    WithActionAndClose,
};
