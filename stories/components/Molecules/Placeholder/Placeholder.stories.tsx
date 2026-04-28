import type { Meta } from '@storybook/react-vite';
import { Placeholder, PlaceholderVariant } from '../../../../src/index.js';
import PlaceholderMDX from './Placeholder.mdx';
import { Default } from './stories/Default.js';
import { Empty } from './stories/Empty.js';
import { NotFound } from './stories/NotFound.js';
import { WithButtonsCustomIconAndCustomLabels } from './stories/WithButtonsCustomIconAndCustomLabels.js';

const meta = {
    component: Placeholder,
    parameters: {
        docs: {
            page: PlaceholderMDX,
        },
        withLanguageSupport: true,
    },
    argTypes: {
        labels: {
            control: 'object',
            description: 'Labels object used to override default text for the selected variant and language.',
            table: {
                category: 'content',
                type: {
                    summary: '{ header?: string; description?: string; footer?: string }',
                },
            },
        },
        variant: {
            control: 'radio',
            options: Object.values(PlaceholderVariant),
            description: 'Controls which predefined placeholder variant is rendered.',
            table: {
                category: 'behavior',
                defaultValue: { summary: `'${PlaceholderVariant.ERROR}'` },
            },
        },
        language: {
            control: false,
            description: 'Language used for default labels. When omitted, the current theme locale is used.',
            table: {
                category: 'behavior',
                defaultValue: { summary: `'enUS' (or current theme locale)` },
                type: { summary: 'CommonLanguages' },
            },
        },
        buttons: {
            control: 'object',
            description: 'Optional list of MUI button props rendered below the main content.',
            table: {
                category: 'actions',
                type: { summary: 'ButtonProps[]' },
                defaultValue: { summary: '[]' },
            },
        },
        img: {
            control: false,
            description: 'Custom icon/image element. When provided, built-in variant icons are not used.',
            table: {
                category: 'content',
                type: { summary: 'React.JSX.Element' },
            },
        },
        dataTestIdSuffix: {
            control: 'text',
            description: 'Optional suffix for generated test id (base: ring-placeholder-{variant}).',
            table: {
                category: 'testing',
                type: { summary: 'string' },
            },
        },
        sx: {
            control: 'object',
            description: 'MUI System properties to customize the main element style.',
            table: {
                category: 'customization',
                type: { summary: 'SxProps<Theme>' },
                defaultValue: { summary: '{}' },
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
    },
} satisfies Meta<typeof Placeholder>;

export default meta;

export { Default, NotFound, Empty, WithButtonsCustomIconAndCustomLabels };
