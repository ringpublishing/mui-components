import type { Meta } from '@storybook/react-vite';
import { FiltersWrapper, SizeEnum, VariantEnum } from '../../../../../src/index.js';
import { Default } from './stories/Default.js';
import defaultArgs from './common/defaultArgs.js';
import FiltersWrapperMDX from './FiltersWrapper.mdx';

const meta = {
    component: FiltersWrapper,
    parameters: {
        docs: {
            page: FiltersWrapperMDX,
        },
    },
    args: {
        ...defaultArgs,
    },
    argTypes: {
        label: {
            control: 'text',
            description: 'Label of the component displayed at the top.',
            table: {
                category: 'content',
            },
        },
        withClearButton: {
            control: 'boolean',
            description: 'Flag indicating whether the clear button should be displayed.',
            table: {
                category: 'behavior',
                defaultValue: { summary: 'false' },
            },
        },
        clearButtonLabel: {
            control: 'text',
            description: 'Label for the clear button.',
            table: {
                category: 'content',
            },
        },
        onClear: {
            control: false,
            description:
                'Callback function called when clear button is clicked. Required together with `withClearButton` for the clear button to render.',
            table: {
                category: 'callbacks',
                type: { summary: '() => void' },
            },
        },
        variant: {
            control: 'radio',
            options: Object.values(VariantEnum),
            description:
                'Variant of child input elements. Applied via MUI ThemeProvider to override default props for TextField, Select, Autocomplete, and other child components.',
            table: {
                category: 'appearance',
                defaultValue: { summary: `'${VariantEnum.STANDARD}'` },
            },
        },
        size: {
            control: 'radio',
            options: Object.values(SizeEnum),
            description:
                'Size of child elements. Applied via MUI ThemeProvider to override default props for child components.',
            table: {
                category: 'appearance',
                defaultValue: { summary: `'${SizeEnum.SMALL}'` },
            },
        },
        buttonStyle: {
            control: 'object',
            description:
                'Style configuration for all MUI Button instances inside the wrapper (size and variant). Applied via MUI ThemeProvider.',
            table: {
                category: 'appearance',
                type: { summary: "Pick<ButtonOwnProps, 'size' | 'variant'>" },
                defaultValue: { summary: "{ size: 'small', variant: 'contained' }" },
            },
        },
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
            description: 'CSS class name applied to the main element.',
            table: {
                category: 'customization',
            },
        },
        children: {
            control: false,
            description: 'Filter controls to render inside the wrapper.',
            table: {
                category: 'content',
                type: { summary: 'React.ReactNode' },
            },
        },
        dataTestIdSuffix: {
            control: false,
            description: 'Inherited from CommonComponentProps. Not yet implemented in FiltersWrapper.',
            table: {
                category: 'customization',
                type: { summary: 'string' },
            },
        },
    },
} satisfies Meta<typeof FiltersWrapper>;

export default meta;

export { Default };
