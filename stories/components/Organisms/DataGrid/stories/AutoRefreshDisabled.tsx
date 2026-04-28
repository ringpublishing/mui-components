import React from 'react';
import type { StoryObj } from '@storybook/react-vite';
import { createCodeStory } from '../../../../helpers.js';
import AutoRefreshDisabledExampleCode from './code/AutoRefreshDisabledExample.tsx?raw';
import { RingDataGrid as RingDataGridComponent, RingDataGridProps } from '../../../../../src/index.js';
import { StoryRingDataGridWrapper } from '../common/StoryRingDataGridWrapper.js';
import { defaultFilterChips } from '../common/defaultArgs.js';

type Story = StoryObj<typeof RingDataGridComponent>;

const Example = (args: RingDataGridProps): React.JSX.Element => {
    return <StoryRingDataGridWrapper {...args} />;
};

export const AutoRefreshDisabled: Story = {
    args: {
        filterChips: defaultFilterChips,
    },
    render: (args, context) => {
        if (context?.viewMode === 'story') {
            return <Example {...(args as RingDataGridProps)} />;
        }

        return createCodeStory({
            context,
            customProps: {},
            example: <Example {...(args as RingDataGridProps)} />,
            customCode: AutoRefreshDisabledExampleCode,
        });
    },
};
