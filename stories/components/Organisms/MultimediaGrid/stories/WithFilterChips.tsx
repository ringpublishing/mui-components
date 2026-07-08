import React from 'react';
import type { StoryObj } from '@storybook/react-vite';
import { action } from 'storybook/actions';
import { createCodeStory } from '../../../../helpers.js';
import WithFilterChipsExampleCode from './code/WithFilterChipsExample.tsx?raw';
import { MultimediaGrid } from '../../../../../src/index.js';
import defaultArgs from '../common/defaultArgs.js';
import { useMultimediaGridDemoData } from '../../../../../src/helpers/stories/ringDemoData.js';

type Story = StoryObj<typeof MultimediaGrid>;

const Example = (args: Omit<React.ComponentProps<typeof MultimediaGrid>, 'items'>): React.JSX.Element => {
    const { items, totalCount, loading } = useMultimediaGridDemoData({});

    return (
        <div style={{ width: '100%', padding: '20px', boxSizing: 'border-box' }}>
            <MultimediaGrid {...args} items={items} totalRowCount={totalCount} loading={loading} />
        </div>
    );
};

export const WithFilterChips: Story = {
    name: 'With Filter Chips',
    args: {
        ...defaultArgs,
        filterChips: {
            chips: [
                { filter: 'Date from', value: '10/10/2025', onDelete: action('onDelete: Date from') },
                { filter: 'Date to', value: '10/11/2025', onDelete: action('onDelete: Date to') },
                // Boolean filter — only the key is meaningful, so the chip renders without a `:` separator.
                { filter: 'Published', onDelete: action('onDelete: Published') },
            ],
            onDeleteAll: action('onDeleteAll'),
        },
    },
    parameters: {
        docs: {
            description: {
                story:
                    'The `filterChips` prop renders a filter chip group above the grid (same API as `RingDataGrid`). ' +
                    'A chip without a `value` (e.g. the boolean `Published` filter) renders just the key without the ' +
                    '`:` separator. The clear-all button is shown only when more than one chip is present.',
            },
        },
    },
    render: (args, context) =>
        createCodeStory({
            context,
            customProps: {},
            customCode: WithFilterChipsExampleCode,
            example: <Example {...args} />,
        }),
};
