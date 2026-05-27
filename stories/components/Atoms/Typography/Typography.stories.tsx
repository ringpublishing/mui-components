import type { Meta } from '@storybook/react-vite';
import { Typography } from '../../../../src/index.js';
import { Default } from './stories/Default.js';
import { WithOverflowAndTooltip } from './stories/WithOverflowAndTooltip.js';
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
    },
};

export default meta;

export { Default, WithOverflowAndTooltip };
