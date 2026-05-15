import React from 'react';
import type { StoryObj } from '@storybook/react-vite';
import { createCodeStory } from '../../../../helpers.js';
import ErrorCustomLabelsExampleCode from './code/ErrorCustomLabelsExample.tsx?raw';
import { RingDataGrid as RingDataGridComponent, RingDataGridProps } from '../../../../../src/index.js';
import { RingDataGridWrapper } from '../common/RingDataGridWrapper.js';
import { defaultFilterChips, ringToolbarColumns } from '../common/defaultArgs.js';

type Story = StoryObj<typeof RingDataGridComponent>;

const Example = (args: RingDataGridProps): React.JSX.Element => {
    return <RingDataGridWrapper {...args} />;
};

export const ErrorCustomLabels: Story = {
    parameters: {
        withLanguageSupport: true,
    },
    args: {
        rows: [],
        columns: ringToolbarColumns,
        error: true,
        labels: {
            results: 'Results',
        },
        filterChips: defaultFilterChips,
        refreshCallback: () => undefined,
        placeholderLabels: {
            error: {
                header: 'We could not load the list',
                description: 'Something went wrong on our side. Retry, or contact support if it persists.',
            },
            tryAgainButton: 'Retry',
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
            customCode: ErrorCustomLabelsExampleCode,
        });
    },
};
