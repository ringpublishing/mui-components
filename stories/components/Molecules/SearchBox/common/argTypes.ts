// Separated into variables to keep argTypes for controlled and uncontrolled props organized
// and reusable across different stories or configurations.
// `as const` preserves literal types for control fields (e.g. 'text' instead of string).
const controlledArgTypes = {
    value: {
        description: 'The value of the input element, required for a controlled component.',
        control: 'text',
        table: {
            category: 'controlled',
            type: { summary: 'string' },
        },
    },
    onChange: {
        description: 'Callback fired when the value is changed, required for a controlled component.',
        table: {
            category: 'controlled',
            type: { summary: '(value: string) => void' },
        },
    },
} as const;

const uncontrolledArgTypes = {
    defaultValue: {
        description: 'The default value, required for an uncontrolled component.',
        control: 'text',
        table: {
            category: 'uncontrolled',
            type: { summary: 'string' },
        },
    },
    searchFunc: {
        description: 'Search function called after input change, required for an uncontrolled component.',
        table: {
            category: 'uncontrolled',
            type: { summary: '(query: string) => void' },
        },
    },
    debounceTime: {
        description: 'Delay of calling searchFunc in milliseconds, only for uncontrolled component.',
        control: 'number',
        table: {
            category: 'uncontrolled',
            type: { summary: 'number' },
            defaultValue: { summary: '500' },
        },
    },
} as const;

export const searchBoxArgTypes = {
    ...controlledArgTypes,
    ...uncontrolledArgTypes,
    withClearButton: {
        description: 'Show/hide clear button.',
        control: 'boolean' as const,
        table: {
            category: 'behavior',
            type: { summary: 'boolean' },
            defaultValue: { summary: 'false' },
        },
    },
    labels: {
        description: 'Labels for placeholder and clear button tooltip.',
        control: 'object' as const,
        table: {
            category: 'labels',
            type: {
                summary: '{ placeholder?: string; clear?: string; }',
            },
        },
    },
    className: {
        description: 'CSS class name for custom styling.',
        control: 'text' as const,
        table: {
            category: 'customization',
            type: { summary: 'string' },
        },
    },
    sx: {
        description: 'Material-UI sx prop for advanced styling.',
        control: 'object' as const,
        table: {
            category: 'customization',
            type: { summary: 'SxProps<Theme>' },
        },
    },
    dataTestIdSuffix: {
        description: 'Suffix for data-testid attribute for testing purposes.',
        control: 'text' as const,
        table: {
            category: 'testing',
            type: { summary: 'string' },
        },
    },
};
