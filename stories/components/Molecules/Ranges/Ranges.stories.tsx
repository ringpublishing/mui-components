import type { Meta } from '@storybook/react-vite';
import { Ranges } from '../../../../src/index.js';
import { Default } from './stories/Default.js';
import { WithInitialState } from './stories/WithInitialState.js';
import { WithApiRef } from './stories/WithApiRef.js';
import defaultArgs from './common/defaultArgs.js';
import RangesMdx from './Ranges.mdx';

const meta: Meta<typeof Ranges> = {
    component: Ranges,
    parameters: {
        docs: {
            page: RangesMdx,
        },
    },
    args: {
        ...defaultArgs,
    },
    argTypes: {
        rangeDefinitions: {
            description:
                'Object defining available ranges with their configurations. Each range can have bounds (min/max) or predefined options.',
            table: {
                type: { summary: 'RangeDefinitions' },
                category: 'Data',
            },
        },
        onChange: {
            control: false,
            description:
                'Callback function triggered when ranges change and all values are valid (respecting bounds and from <= to constraint)',
            table: {
                type: { summary: '(ranges: Ranges) => void' },
                category: 'Events',
            },
        },
        labels: {
            description: 'Labels object for all UI texts including buttons, inputs, placeholders and error messages',
            table: {
                type: { summary: 'RangesLabels' },
                category: 'Content',
            },
        },
        maxAppliedRanges: {
            description:
                'Maximum number of ranges that can be applied simultaneously. Add range button is hidden when limit is reached.',
            table: {
                type: { summary: 'number' },
                defaultValue: { summary: 'Infinity' },
                category: 'Behavior',
            },
        },
        initialState: {
            description: 'Initial state of the ranges. If not provided, component starts with one empty range.',
            table: {
                type: { summary: 'Ranges' },
                category: 'Data',
            },
        },
        apiRef: {
            control: false,
            description:
                'Ref to the Ranges component instance. Provides methods: getRanges(), setRanges(ranges), resetRanges()',
            table: {
                type: { summary: 'React.RefObject<RangesApiRef>' },
                category: 'Advanced',
            },
        },
        sx: {
            description: 'MUI sx prop for custom styling',
            table: {
                type: { summary: 'SxProps' },
                category: 'Styling',
            },
        },
        className: {
            description: 'Additional CSS class name',
            table: {
                type: { summary: 'string' },
                category: 'Styling',
            },
        },
        dataTestIdSuffix: {
            description: 'Suffix for data-testid attribute',
            table: {
                type: { summary: 'string' },
                category: 'Testing',
            },
        },
    },
};

export default meta;

export { Default, WithInitialState, WithApiRef };
