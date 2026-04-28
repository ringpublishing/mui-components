import React, { useRef } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';

import { action } from 'storybook/actions';
import { Box, Button } from '@mui/material';
import { createCodeStory } from '../../../helpers.js';
import { RangeDefinitions, Ranges, RangesApiRef, RangesLabels } from '../../../../src/index.js';
import { DefaultCode, WithApiRefCode, WithInitialStateCode } from './Ranges.stories.code.js';

const rangeDefinitions: RangeDefinitions = {
    imagesCount: {
        label: 'Images Count',
        rangeBounds: { min: 0, max: 100 },
    },
    authorsCount: {
        label: 'Authors Count',
        rangeBounds: { min: 1, max: 50 },
    },
    charactersCount: {
        label: 'Characters Count',
        rangeOptions: [
            { value: 1000, label: '1K', order: 0 },
            { value: 5000, label: '5K', order: 1 },
            { value: 10000, label: '10K', order: 2 },
        ],
    },
};

const labels: RangesLabels = {
    rangeSelect: 'Select Metric',
    addRangeButton: 'Add range',
    removeRangeButton: 'Remove',
    rangeSelectPlaceholder: 'Choose metric',
    fromInput: 'From',
    toInput: 'To',
    valueTooHighError: 'Maximum value is ',
    valueTooLowError: 'Minimum value is ',
    valueRequiredError: 'Field is required',
    invalidRangeError: 'Invalid range',
};

const meta: Meta<typeof Ranges> = {
    component: Ranges,
    parameters: {
        docs: {
            description: {
                component:
                    'Ranges is a component for creating and managing multiple range filters. ' +
                    'Users can select a metric and define its value range with optional min/max bounds or predefined options.\n\n' +
                    '**Main Use Cases:**\n' +
                    '- Choose any numerical metric and set value ranges for filtering\n' +
                    '- Filter items by various parameters like images count, authors count, characters count, word count, etc.\n\n' +
                    '## Basic Example\n\n' +
                    '```typescript\n' +
                    'import { Ranges, RangeDefinitions, RangesLabels } from "@ringpublishing/mui-components";\n\n' +
                    'const rangeDefinitions: RangeDefinitions = {\n' +
                    '    imagesCount: {\n' +
                    '        label: "Images Count",\n' +
                    '        rangeBounds: { min: 0, max: 100 }\n' +
                    '    },\n' +
                    '    authorsCount: {\n' +
                    '        label: "Authors Count",\n' +
                    '        rangeBounds: { min: 1, max: 50 }\n' +
                    '    },\n' +
                    '    charactersCount: {\n' +
                    '        label: "Characters Count",\n' +
                    '        rangeOptions: [\n' +
                    '            { value: 1000, label: "1K", order: 0 },\n' +
                    '            { value: 5000, label: "5K", order: 1 },\n' +
                    '            { value: 10000, label: "10K", order: 2 }\n' +
                    '        ]\n' +
                    '    }\n' +
                    '};\n\n' +
                    'const labels: RangesLabels = {\n' +
                    '    rangeSelect: "Select Metric",\n' +
                    '    addRangeButton: "Add range",\n' +
                    '    removeRangeButton: "Remove",\n' +
                    '    rangeSelectPlaceholder: "Choose metric",\n' +
                    '    fromInput: "From",\n' +
                    '    toInput: "To",\n' +
                    '    valueTooHighError: "Maximum value is ",\n' +
                    '    valueTooLowError: "Minimum value is ",\n' +
                    '    valueRequiredError: "Field is required",\n' +
                    '    invalidRangeError: "Invalid range"\n' +
                    '};\n\n' +
                    'export default () => {\n' +
                    '    return (\n' +
                    '        <Ranges\n' +
                    '            rangeDefinitions={rangeDefinitions}\n' +
                    '            labels={labels}\n' +
                    '            maxAppliedRanges={2}\n' +
                    '            onChange={(ranges) => console.log(ranges)}\n' +
                    '        />\n' +
                    '    );\n' +
                    '}\n' +
                    '```',
            },
        },
    },
    args: {
        rangeDefinitions,
        labels,
        maxAppliedRanges: 3,
        onChange: (ranges) => action('onChange')(ranges),
        dataTestIdSuffix: 'default',
    },
    argTypes: {
        rangeDefinitions: {
            description:
                'Object defining available ranges with their configurations. Each range can have bounds (min/max) or predefined options.',
            table: {
                type: { summary: 'RangeDefinitions' },
            },
        },
        onChange: {
            control: false,
            description:
                'Callback function triggered when ranges change and all values are valid (respecting bounds and from <= to constraint)',
            table: {
                type: { summary: '(ranges: Ranges) => void' },
            },
        },
        labels: {
            description: 'Labels object for all UI texts including buttons, inputs, placeholders and error messages',
            table: {
                type: { summary: 'RangesLabels' },
            },
        },
        maxAppliedRanges: {
            description:
                'Maximum number of ranges that can be applied simultaneously. Add range button is hidden when limit is reached.',
            table: {
                type: { summary: 'number' },
                defaultValue: { summary: 'Infinity' },
            },
        },
        initialState: {
            description: 'Initial state of the ranges. If not provided, component starts with one empty range.',
            table: {
                type: { summary: 'Ranges' },
            },
        },
        apiRef: {
            control: false,
            description:
                'Ref to the Ranges component instance. Provides methods: getRanges(), setRanges(ranges), resetRanges()',
            table: {
                type: { summary: 'React.RefObject<RangesApiRef>' },
            },
        },
        sx: {
            description: 'MUI sx prop for custom styling',
            table: {
                type: { summary: 'SxProps' },
            },
        },
        className: {
            description: 'Additional CSS class name',
            table: {
                type: { summary: 'string' },
            },
        },
        dataTestIdSuffix: {
            description: 'Suffix for data-testid attribute',
            table: {
                type: { summary: 'string' },
            },
        },
    },
};

export default meta;

export const Default: StoryObj<typeof Ranges> = {
    args: {
        rangeDefinitions,
        maxAppliedRanges: 3,
        labels,
        onChange: (ranges) => action('onChange')(ranges),
        dataTestIdSuffix: 'default',
    },
    render: (args, context) =>
        createCodeStory({
            context,
            customProps: args,
            customCode: DefaultCode,
            example: (
                <Box width={'200px'}>
                    <Ranges {...args} />
                </Box>
            ),
        }),
};

export const WithInitialState: StoryObj<typeof Ranges> = {
    args: {
        rangeDefinitions,
        maxAppliedRanges: 3,
        labels,
        onChange: (ranges) => action('onChange')(JSON.stringify(ranges)),
        dataTestIdSuffix: 'withInitialState',
        initialState: {
            imagesCount: {
                order: 0,
                from: 10,
                to: 50,
            },
            charactersCount: {
                order: 1,
                from: 1000,
            },
        },
    },
    render: (args, context) =>
        createCodeStory({
            context,
            customProps: args,
            customCode: WithInitialStateCode,
            example: (
                <Box width={'200px'}>
                    <Ranges {...args} />
                </Box>
            ),
        }),
};

function RangesWithApiRefWrapper(): React.JSX.Element {
    const apiRef = useRef<RangesApiRef>(null);

    return (
        <Box>
            <Box sx={{ marginBottom: 4, paddingBottom: 2, borderBottom: '1px dashed #ccc' }}>
                <Button variant="outlined" size="small" onClick={() => apiRef.current?.resetRanges()}>
                    Reset Ranges
                </Button>
            </Box>
            <Box width={'200px'}>
                <Ranges
                    rangeDefinitions={rangeDefinitions}
                    maxAppliedRanges={2}
                    labels={labels}
                    onChange={(ranges) => action('onChange')(JSON.stringify(ranges))}
                    apiRef={apiRef}
                />
            </Box>
        </Box>
    );
}

export const WithApiRef: StoryObj<typeof Ranges> = {
    render: (args, context) =>
        createCodeStory({
            context,
            customCode: WithApiRefCode,
            example: <RangesWithApiRefWrapper />,
        }),
};
