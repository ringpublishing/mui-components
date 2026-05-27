import type { Meta } from '@storybook/react-vite';
import { ChipsGroup } from '../../../../src/index.js';
import defaultArgs from './common/defaultArgs.js';
import { Default } from './stories/Default.js';
import { ChipsExpandable } from './stories/ChipsExpandable.js';
import { ChipsExpandableAndCollapsable } from './stories/ChipsExpandableAndCollapsable.js';
import { CustomLabels } from './stories/CustomLabels.js';
import { DeleteAll } from './stories/DeleteAll.js';
import ChipsGroupMDX from './ChipsGroup.mdx';

const meta: Meta<typeof ChipsGroup> = {
    component: ChipsGroup,
    parameters: {
        docs: {
            page: ChipsGroupMDX,
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
                type: { summary: 'string' },
            },
        },
        dataTestIdSuffix: {
            control: 'text',
            description: 'Suffix appended to the data-testid attribute for testing purposes.',
            table: {
                category: 'testing',
                type: { summary: 'string' },
            },
        },
        chips: {
            control: 'object',
            description:
                'Array of MUI ChipProps defining the chips to display. Each chip can have custom properties like label, color, variant, onClick, and onDelete.',
            table: {
                category: 'state',
                type: { summary: 'ChipProps[]' },
            },
        },
        expandable: {
            control: 'boolean',
            description:
                'When true, clicking "+N" expands hidden chips inline. When false, shows chips in a dropdown menu.',
            table: {
                category: 'behavior',
                defaultValue: { summary: 'false' },
                type: { summary: 'boolean' },
            },
        },
        collapsable: {
            control: 'boolean',
            description:
                'When true and chips are expanded, shows a "Show less" button to collapse back. Only works when expandable is true.',
            table: {
                category: 'behavior',
                defaultValue: { summary: 'false' },
                type: { summary: 'boolean' },
            },
        },
        customLabels: {
            control: 'object',
            description: 'Custom text labels for actions.',
            table: {
                category: 'content',
                type: { summary: '{ deleteAll?: string; showLess?: string }' },
                defaultValue: { summary: '{ deleteAll: "Clear", showLess: "Show less" }' },
            },
        },
        onDeleteAll: {
            control: false,
            description:
                'Callback fired when "Clear" button is clicked. When provided, displays a delete all button at the end of the chips group.',
            table: {
                category: 'callbacks',
                type: { summary: '() => void' },
            },
        },
    },
};

export default meta;

export { Default, ChipsExpandable, ChipsExpandableAndCollapsable, DeleteAll, CustomLabels };
