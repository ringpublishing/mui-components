import type { Meta } from '@storybook/react-vite';

import { Switch } from '../../../../src/index.js';
import { Default as DefaultStory } from './stories/Default.js';
import { Sizes as SizesStory } from './stories/Sizes.js';
import { Colors as ColorsStory } from './stories/Colors.js';
import { Disabled as DisabledStory } from './stories/Disabled.js';
import { WithLabel as WithLabelStory } from './stories/WithLabel.js';
import { WithFormGroup as WithFormGroupStory } from './stories/WithFormGroup.js';
import defaultArgs from './common/defaultArgs.js';
import SwitchMdx from './Switch.mdx';

const meta: Meta<typeof Switch> = {
    component: Switch,
    tags: ['new@2.0'],
    parameters: {
        docs: {
            page: SwitchMdx,
        },
    },
    args: {
        ...defaultArgs,
    },
    argTypes: {
        checked: {
            control: false,
            description: 'Controlled checked state. Pair with onChange.',
            table: {
                category: 'state',
                type: { summary: 'boolean' },
            },
        },
        defaultChecked: {
            control: 'boolean',
            description: 'Initial checked state for the uncontrolled usage.',
            table: {
                category: 'state',
                type: { summary: 'boolean' },
            },
        },
        color: {
            control: 'select',
            options: ['primary', 'error'],
            description: 'Switch color. The design defines the default (primary) and error variants.',
            table: {
                category: 'appearance',
                type: { summary: "'primary' | 'error'" },
                defaultValue: { summary: 'primary' },
            },
        },
        size: {
            control: 'select',
            options: ['medium', 'small'],
            description: 'Switch size.',
            table: {
                category: 'appearance',
                type: { summary: "'medium' | 'small'" },
                defaultValue: { summary: 'medium' },
            },
        },
        disabled: {
            control: 'boolean',
            description: 'Disables the switch.',
            table: {
                category: 'state',
                type: { summary: 'boolean' },
                defaultValue: { summary: 'false' },
            },
        },
        onChange: {
            control: false,
            description: 'Callback fired when the checked state changes.',
            table: {
                category: 'callbacks',
                type: { summary: '(event: React.ChangeEvent<HTMLInputElement>, checked: boolean) => void' },
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
            description: 'Suffix appended to the root and input data-testid.',
            table: {
                category: 'testing',
                type: { summary: 'string' },
            },
        },
    },
};

export default meta;

export const Default = DefaultStory;
export const Sizes = SizesStory;
export const Colors = { ...ColorsStory, name: 'Colours' };
export const Disabled = DisabledStory;
export const WithLabel = { ...WithLabelStory, name: 'Label' };
export const WithFormGroup = { ...WithFormGroupStory, name: 'In FormGroup' };
