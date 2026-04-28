import type { Meta } from '@storybook/react-vite';
import { ActionBox } from '../../../../src/index.js';
import ActionBoxMDX from './ActionBox.mdx';
import defaultArgs from './common/defaultArgs.js';
import { CustomStyling } from './stories/CustomStyling.js';
import { PopperPlacement } from './stories/PopperPlacement.js';
import { Default } from './stories/Default.js';

const meta: Meta<typeof ActionBox> = {
    component: ActionBox,
    parameters: {
        layout: 'fullscreen',
        docs: {
            page: ActionBoxMDX,
        },
    },
    args: {
        ...defaultArgs,
    },
    argTypes: {
        actions: {
            control: false,
            description: 'Actions list shown in Action Box',
            table: {
                type: { summary: 'ActionBoxItem[]' },
                defaultValue: { summary: '[]' },
                category: 'data',
            },
        },
        placement: {
            description: 'Placement of the Action Box relative to the anchor element',
            table: {
                type: { summary: 'PopperProps["placement"]' },
                defaultValue: { summary: 'bottom-end' },
                category: 'positioning',
            },
        },
        tooltipPlacement: {
            description: 'Placement of the disabled reason for the action tooltip',
            table: {
                type: { summary: 'TooltipProps["placement"]' },
                defaultValue: { summary: 'right' },
                category: 'positioning',
            },
        },
        hasScroll: {
            description: 'If true, Action Box will have a scroll if actions exceed visibleActionsCount',
            table: {
                type: { summary: 'boolean' },
                defaultValue: { summary: 'true' },
                category: 'behavior',
            },
        },
        visibleActionsCount: {
            description: 'Number of actions visible without scrolling',
            table: {
                type: { summary: 'number' },
                defaultValue: { summary: 'actions.length' },
                category: 'behavior',
            },
        },
        zIndex: {
            description: 'Z-index of the Action Box',
            table: {
                type: { summary: 'number' },
                defaultValue: { summary: 'theme.zIndex.modal' },
                category: 'customization',
            },
        },
        anchorEl: {
            control: false,
            description: 'Ref to the anchor element used to position the Action Box',
            table: {
                type: { summary: 'RefObject<HTMLElement>' },
                category: 'data',
            },
        },
        sx: {
            control: false,
            description: 'Overrides the Paper styles for the Action Box',
            table: {
                type: { summary: 'SxProps<Theme>' },
                category: 'customization',
            },
        },
        dataTestIdSuffix: {
            control: 'text',
            description: 'Optional suffix added to data-testid attributes',
            table: {
                type: { summary: 'string' },
                category: 'testing',
            },
        },
        ref: {
            table: { disable: true },
        },
        className: {
            table: { disable: true },
        },
    },
};

export default meta;

export { Default, PopperPlacement, CustomStyling };
