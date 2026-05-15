import React from 'react';
import type { StoryObj } from '@storybook/react-vite';
import { createCodeStory } from '../../../../helpers.js';
import NoResultsCustomLabelsExampleCode from './code/NoResultsCustomLabelsExample.tsx?raw';
import { RingDataGrid as RingDataGridComponent, RingDataGridProps } from '../../../../../src/index.js';
import { RingDataGridWrapper } from '../common/RingDataGridWrapper.js';
import { defaultFilterChips, ringToolbarColumns } from '../common/defaultArgs.js';

type Story = StoryObj<typeof RingDataGridComponent>;

const Example = (args: RingDataGridProps): React.JSX.Element => {
    return <RingDataGridWrapper {...args} />;
};

export const NoResultsCustomLabels: Story = {
    parameters: {
        withLanguageSupport: true,
    },
    args: {
        rows: [],
        columns: ringToolbarColumns,
        labels: {
            results: 'Results',
        },
        filterChips: defaultFilterChips,
        placeholderLabels: {
            empty: {
                header: 'No articles found',
                description: 'Try different filters or check back later.',
            },
        },
    },
    render: (args, context) => {
        if (context?.viewMode === 'story') {
            return <Example {...(args as RingDataGridProps)} />;
        }

        return createCodeStory({
            context,
            customProps: {},
            example: <Example {...(args as RingDataGridProps)} />,
            customCode: NoResultsCustomLabelsExampleCode,
        });
    },
};
