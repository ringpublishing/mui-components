import type { Meta } from '@storybook/react-vite';
import { Detail } from '../../../../src/index.js';
import defaultArgs from './common/defaultArgs.js';
import { Default } from './stories/Default.js';
import { EmptyState } from './stories/EmptyState.js';
import { WithCustomSlots } from './stories/WithCustomSlots.js';
import { WithBottomIconButtons } from './stories/WithBottomIconButtons.js';
import { WithBottomChips } from './stories/WithBottomChips.js';
import DetailMdx from './Detail.mdx';

const meta = {
    component: Detail,
    parameters: {
        docs: {
            page: DetailMdx,
        },
    },
    args: {
        ...defaultArgs,
    },
    argTypes: {
        sx: {
            control: 'object',
            description: 'MUI System properties to customize the main element style.',
            table: {
                category: 'customization',
                type: { summary: 'SxProps<Theme>' },
            },
        },
        className: {
            control: 'text',
            type: 'string',
            description: 'CSS class name applied to the main element.',
            table: {
                category: 'customization',
            },
        },
        main: {
            control: 'object',
            description:
                'Main section of the detail — contains title, Media props and bottom icons. ' +
                'Bottom icons can be either all of type "chip" or all of type "icon".',
            table: {
                category: 'content',
                type: {
                    summary:
                        '{ mediaProps?: DetailMediaProps; title?: string | { value: string } | TitleEditable; onCloseClick?: () => void }',
                },
            },
        },
        descriptionItems: {
            control: 'object',
            description:
                'Description items section of the detail — fields in four types: default, chips, description, and editable.',
            table: {
                category: 'content',
                type: { summary: 'DetailDescriptionItem[]' },
            },
        },
        bottomActions: {
            control: 'object',
            description: 'Bottom actions section of the detail — actions with url or onClick handler.',
            table: {
                category: 'content',
                type: { summary: 'DetailBottomAction[]' },
            },
        },
        empty: {
            control: 'boolean',
            description: 'If true, shows a placeholder for the empty state.',
            table: {
                category: 'behavior',
                defaultValue: { summary: 'false' },
            },
        },
        slots: {
            control: 'object',
            description: 'Overridable slots: afterMain, afterDescriptionItems, afterBottomActions.',
            table: {
                category: 'customization',
                type: {
                    summary:
                        '{ afterMain?: React.JSX.Element; afterDescriptionItems?: React.JSX.Element; afterBottomActions?: React.JSX.Element }',
                },
            },
        },
        dataTestIdSuffix: {
            control: 'text',
            description: 'Optional suffix for the generated test id (base: ring-detail).',
            table: {
                category: 'customization',
                type: { summary: 'string' },
            },
        },
    },
} satisfies Meta<typeof Detail>;

export default meta;

export { Default, EmptyState, WithCustomSlots, WithBottomIconButtons, WithBottomChips };
