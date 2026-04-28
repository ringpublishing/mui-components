import type { Meta } from '@storybook/react-vite';
import { ChipsInput } from '../../../../src/index.js';
import { Default } from './stories/Default.js';
import { CustomColors } from './stories/CustomColors.js';
import { NoValidation } from './stories/NoValidation.js';
import defaultArgs from './common/defaultArgs.js';
import ChipsInputMdx from './ChipsInput.mdx';

const meta: Meta<typeof ChipsInput> = {
    component: ChipsInput,
    parameters: {
        docs: {
            page: ChipsInputMdx,
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
        dataTestIdSuffix: {
            control: 'text',
            description: 'Test ID suffix for testing purposes.',
            table: {
                category: 'testing',
            },
        },
        labels: {
            control: 'object',
            description:
                'Text labels for the component (required). Includes title, inputPlaceholder, and alreadyOnList message.',
            table: {
                category: 'content',
                type: {
                    summary: '{ title?: string; inputPlaceholder?: string; alreadyOnList: string }',
                },
            },
        },
        validationFunction: {
            control: false,
            description:
                'Optional function to validate chip values. Return true for valid chips, false for invalid. Invalid chips are displayed with error color.',
            table: {
                category: 'validation',
                type: { summary: '(value: AutocompleteChip) => boolean' },
            },
        },
        onChange: {
            control: false,
            description: 'Callback fired when chips are added or removed. Receives the updated array of chips.',
            table: {
                category: 'callbacks',
                type: { summary: '(value: AutocompleteChip[]) => void' },
            },
        },
        value: {
            control: 'object',
            description: 'Controlled value for the chips. When provided, component works in controlled mode.',
            table: {
                category: 'state',
                type: { summary: 'AutocompleteChip[]' },
            },
        },
        chipsColors: {
            control: 'object',
            description: 'Custom colors for chips. Configure colors for valid (default) and invalid (error) states.',
            table: {
                category: 'customization',
                type: { summary: '{ default: ChipColor; error: ChipColor }' },
                defaultValue: { summary: '{ default: ChipColor.DEFAULT, error: ChipColor.ERROR }' },
            },
        },
    },
};

export default meta;

export { Default, CustomColors, NoValidation };
