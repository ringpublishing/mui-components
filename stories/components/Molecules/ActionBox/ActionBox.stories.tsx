import type { Meta } from '@storybook/react-vite';
import { ActionBox } from '../../../../src/index.js';
import ActionBoxMDX from './ActionBox.mdx';
import defaultArgs from './common/defaultArgs.js';
import { Default as DefaultStory } from './stories/Default.js';
import { PopperPlacement as PopperPlacementStory } from './stories/PopperPlacement.js';
import { VisibleElements as VisibleElementsStory } from './stories/VisibleElements.js';
import { FocusAfterAction as FocusAfterActionStory } from './stories/FocusAfterAction.js';
import { LongLabels as LongLabelsStory } from './stories/LongLabels.js';
import { CustomStyling as CustomStylingStory } from './stories/CustomStyling.js';

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
            description: 'Actions shown in the menu',
            table: {
                type: { summary: 'ActionBoxItem[]' },
                category: 'data',
            },
        },
        placement: {
            description: 'Side of the trigger the menu opens on',
            table: {
                type: { summary: 'PopperProps["placement"]' },
                defaultValue: { summary: 'below the trigger, left-aligned' },
                category: 'positioning',
            },
        },
        tooltipPlacement: {
            description:
                "Side of an action's tooltip (its disabled reason or cut-off label). Moves above or below when there is no room beside the menu",
            table: {
                type: { summary: 'TooltipProps["placement"]' },
                defaultValue: { summary: 'right' },
                category: 'positioning',
            },
        },
        hasScroll: {
            description:
                'Lets the actions beyond `visibleActionsCount` scroll; when false they are cut off. Without `visibleActionsCount` it has no effect',
            table: {
                type: { summary: 'boolean' },
                defaultValue: { summary: 'true' },
                category: 'behavior',
            },
        },
        visibleActionsCount: {
            description:
                'Number of actions the menu is tall enough for, counted as 36px items (48px on small screens), so taller items show fewer',
            table: {
                type: { summary: 'number' },
                defaultValue: { summary: 'every action, up to the screen height' },
                category: 'behavior',
            },
        },
        zIndex: {
            description: 'Z-index of the menu',
            table: {
                type: { summary: 'number' },
                defaultValue: { summary: 'theme.zIndex.modal' },
                category: 'customization',
            },
        },
        anchorEl: {
            control: false,
            description:
                'Ref to the trigger. A click on it opens and closes the menu. Pass the ref object, not `ref.current`',
            table: {
                type: { summary: 'RefObject<HTMLElement | null>' },
                category: 'data',
            },
        },
        sx: {
            control: false,
            description: 'Styles of the menu surface (the Paper)',
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

export const Default = DefaultStory;
export const PopperPlacement = { ...PopperPlacementStory, name: 'Placement' };
export const VisibleElements = { ...VisibleElementsStory, name: 'Visible actions count' };
export const FocusAfterAction = { ...FocusAfterActionStory, name: 'Focus after an action' };
export const LongLabels = { ...LongLabelsStory, name: 'Long labels' };
export const CustomStyling = { ...CustomStylingStory, name: 'Custom styling' };
