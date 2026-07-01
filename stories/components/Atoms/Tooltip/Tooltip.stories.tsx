import type { Meta } from '@storybook/react-vite';
import { Tooltip } from '../../../../src/index.js';
import { Default } from './stories/Default.js';
import { WithSubtitle } from './stories/WithSubtitle.js';
import { WithHint } from './stories/WithHint.js';
import { WithCustomTitle } from './stories/WithCustomTitle.js';
import defaultArgs from './common/defaultArgs.js';
import TooltipMdx from './Tooltip.mdx';

const meta: Meta<typeof Tooltip> = {
    component: Tooltip,
    parameters: {
        docs: {
            page: TooltipMdx,
        },
    },
    args: {
        ...defaultArgs,
    },
    argTypes: {
        title: {
            control: 'text',
            description: 'The main title text displayed inside the tooltip.',
            table: {
                category: 'content',
                type: { summary: 'string | React.ReactNode' },
            },
        },
        subTitle: {
            control: 'text',
            description: 'Optional subtitle displayed below the title.',
            table: {
                category: 'content',
                type: { summary: 'string' },
            },
        },
        hint: {
            control: 'text',
            description: 'Optional hint displayed next to tooltip title.',
            table: {
                category: 'content',
                type: { summary: 'string' },
            },
        },
        children: {
            control: false,
            description: 'The element that triggers the tooltip on hover.',
            table: {
                category: 'content',
                type: { summary: 'React.ReactElement' },
            },
        },
        placement: {
            control: 'select',
            options: [
                'bottom-end',
                'bottom-start',
                'bottom',
                'left-end',
                'left-start',
                'left',
                'right-end',
                'right-start',
                'right',
                'top-end',
                'top-start',
                'top',
            ],
            description: 'Tooltip placement relative to the anchor element.',
            table: {
                category: 'appearance',
                type: { summary: 'TooltipProps["placement"]' },
                defaultValue: { summary: "'bottom'" },
            },
        },
        arrow: {
            control: 'boolean',
            description: 'If true, adds an arrow pointing to the anchor element.',
            table: {
                category: 'appearance',
                type: { summary: 'boolean' },
                defaultValue: { summary: 'false' },
            },
        },
        open: {
            control: 'boolean',
            description: 'Controls the open state of the tooltip (controlled mode).',
            table: {
                category: 'state',
                type: { summary: 'boolean' },
            },
        },
        disableHoverListener: {
            control: 'boolean',
            description: 'If true, the tooltip will not open on hover.',
            table: {
                category: 'behavior',
                type: { summary: 'boolean' },
                defaultValue: { summary: 'false' },
            },
        },
        disableFocusListener: {
            control: 'boolean',
            description: 'If true, the tooltip will not open on focus.',
            table: {
                category: 'behavior',
                type: { summary: 'boolean' },
                defaultValue: { summary: 'false' },
            },
        },
        disableTouchListener: {
            control: 'boolean',
            description: 'If true, the tooltip will not open on touch.',
            table: {
                category: 'behavior',
                type: { summary: 'boolean' },
                defaultValue: { summary: 'false' },
            },
        },
        enterDelay: {
            control: 'number',
            description: 'Delay in milliseconds before the tooltip appears.',
            table: {
                category: 'behavior',
                type: { summary: 'number' },
                defaultValue: { summary: '100' },
            },
        },
        leaveDelay: {
            control: 'number',
            description: 'Delay in milliseconds before the tooltip disappears.',
            table: {
                category: 'behavior',
                type: { summary: 'number' },
                defaultValue: { summary: '0' },
            },
        },
        onOpen: {
            description: 'Callback fired when the tooltip opens.',
            table: {
                category: 'callbacks',
                type: { summary: '(event: React.SyntheticEvent) => void' },
            },
        },
        onClose: {
            description: 'Callback fired when the tooltip closes.',
            table: {
                category: 'callbacks',
                type: { summary: '(event: React.SyntheticEvent) => void' },
            },
        },
        sx: {
            control: 'object',
            description: 'MUI sx prop for custom styling of the root element.',
            table: {
                category: 'customization',
                type: { summary: 'SxProps' },
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

export { Default, WithSubtitle, WithHint, WithCustomTitle };
