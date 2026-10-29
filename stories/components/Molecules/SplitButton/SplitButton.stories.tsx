import type { Meta } from '@storybook/react-vite';
import { SplitButton } from '../../../../src/index.js';
import { Default as DefaultStory } from './stories/Default.js';
import { WithOneAction as WithOneActionStory } from './stories/WithOneAction.js';
import { MainActionDisabled as MainActionDisabledStory } from './stories/MainActionDisabled.js';
import { CustomizationFromButtonGroupAPI as CustomizationFromButtonGroupAPIStory } from './stories/CustomizationFromButtonGroupAPI.js';
import defaultArgs from './common/defaultArgs.js';
import SplitButtonMdx from './SplitButton.mdx';

const meta: Meta<typeof SplitButton> = {
    component: SplitButton,
    parameters: {
        docs: {
            page: SplitButtonMdx,
        },
    },
    args: {
        ...defaultArgs,
    },
    argTypes: {
        actions: {
            description:
                'Array of action objects defining the main action and additional dropdown actions. Each action object includes label, onClick callback, optional disabled state, disabled reason for tooltips, and optional icon.',
            table: {
                category: 'content',
                type: {
                    summary:
                        '{ label: string; onClick: () => void; disabled?: boolean; disabledReason?: string; icon?: React.JSX.Element; }[]',
                },
            },
        },
        size: {
            description: 'The size of the button group. Applies to both main action and dropdown trigger buttons.',
            control: 'select',
            options: ['small', 'medium', 'large'],
            table: {
                category: 'customization',
                defaultValue: { summary: 'medium' },
                type: { summary: "'small' | 'medium' | 'large'" },
            },
        },
        variant: {
            description: 'The variant style of the button group. Inherited from MUI ButtonGroup API.',
            control: 'select',
            options: ['text', 'outlined', 'contained'],
            table: {
                category: 'customization',
                defaultValue: { summary: 'outlined' },
                type: { summary: "'contained' | 'outlined' | 'text'" },
            },
        },
        color: {
            description: 'The color of the button group. Inherited from MUI ButtonGroup API.',
            control: 'select',
            options: ['inherit', 'primary', 'secondary', 'success', 'error', 'info', 'warning'],
            table: {
                category: 'customization',
                defaultValue: { summary: 'primary' },
                type: { summary: "'primary' | 'secondary'" },
            },
        },
        orientation: {
            description: 'The orientation of the button group layout. Inherited from MUI ButtonGroup API.',
            control: 'select',
            options: ['horizontal', 'vertical'],
            table: {
                category: 'customization',
                defaultValue: { summary: 'horizontal' },
                type: { summary: "'horizontal' | 'vertical'" },
            },
        },
        className: {
            description: 'Custom CSS class name to apply to the root element.',
            control: 'text',
            table: {
                category: 'customization',
                type: { summary: 'string' },
            },
        },
        sx: {
            description: 'MUI sx prop for applying custom styles to the root element.',
            table: {
                category: 'customization',
                type: { summary: 'SxProps' },
            },
        },
        dataTestIdSuffix: {
            description: 'Suffix for the data-testid attribute used in testing.',
            control: 'text',
            table: {
                category: 'testing',
                type: { summary: 'string' },
            },
        },
    },
};

export default meta;

export const Default = DefaultStory;
export const WithOneAction = { ...WithOneActionStory, name: 'One action' };
export const MainActionDisabled = { ...MainActionDisabledStory, name: 'Main action disabled' };
export const CustomizationFromButtonGroupAPI = { ...CustomizationFromButtonGroupAPIStory, name: 'ButtonGroup props' };
