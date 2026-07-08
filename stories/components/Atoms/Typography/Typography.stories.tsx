import type { Meta } from '@storybook/react-vite';
import { Typography } from '../../../../src/index.js';
import { Default } from './stories/Default.js';
import { WithOverflowAndTooltip } from './stories/WithOverflowAndTooltip.js';
import { WithCustomTooltip } from './stories/WithCustomTooltip.js';
import TypographyMDX from './Typography.mdx';

const meta: Meta<typeof Typography> = {
    component: Typography,
    parameters: {
        docs: {
            page: TypographyMDX,
        },
        controls: {
            include: ['enableOverflow', 'children'],
        },
    },
    argTypes: {
        enableOverflow: {
            control: 'boolean',
            description: 'Enable overflow handling with ellipsis and tooltip',
            table: {
                category: 'behavior',
                defaultValue: { summary: 'false' },
                type: { summary: 'boolean' },
            },
        },
        alwaysShowTooltip: {
            control: 'boolean',
            description: 'Always render the tooltip on hover, regardless of whether the text overflows',
            table: {
                category: 'behavior',
                defaultValue: { summary: 'false' },
                type: { summary: 'boolean' },
            },
        },
        tooltipTitle: {
            control: false,
            description: 'Custom tooltip content. When omitted, the tooltip shows the Typography children.',
            table: {
                category: 'content',
                type: { summary: 'React.ReactNode' },
            },
        },
    },
};

export default meta;

export { Default, WithOverflowAndTooltip, WithCustomTooltip };
