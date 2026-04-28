import React from 'react';
import type { StoryObj } from '@storybook/react-vite';
import { createCodeStory } from '../../../../helpers.js';
import DynamicLayoutExampleCode from './code/DynamicLayoutExample.tsx?raw';
import { MultimediaGrid } from '../../../../../src/index.js';
import defaultArgs from '../common/defaultArgs.js';
import { useMultimediaGridDemoData } from '../../../../../src/helpers/stories/ringDemoData.js';

type Story = StoryObj<typeof MultimediaGrid>;

const Example = (args: Omit<React.ComponentProps<typeof MultimediaGrid>, 'items'>): React.JSX.Element => {
    const { items, totalCount, loading } = useMultimediaGridDemoData({});

    return <MultimediaGrid {...args} items={items} totalRowCount={totalCount} loading={loading} />;
};

export const DynamicLayout: Story = {
    args: {
        ...defaultArgs,
        dynamicLayout: true,
        dynamicCardWidth: 260,
        dynamicCardHeight: 300,
        showRingToolbar: true,
        spacing: 1,
    },
    render: (args, context) => {
        return createCodeStory({
            context,
            customProps: {},
            customCode: DynamicLayoutExampleCode,
            example: <Example {...args} />,
        });
    },
};
