import React from 'react';
import type { StoryObj } from '@storybook/react-vite';
import { createCodeStory } from '../../../../helpers.js';
import InfiniteScrollExampleCode from './code/InfiniteScrollExample.tsx?raw';
import { MultimediaGrid } from '../../../../../src/index.js';
import defaultArgs from '../common/defaultArgs.js';
import { useMultimediaGridDemoData } from '../../../../../src/helpers/stories/ringDemoData.js';

type Story = StoryObj<typeof MultimediaGrid>;

const Example = (args: Omit<React.ComponentProps<typeof MultimediaGrid>, 'items'>): React.JSX.Element => {
    const { items, totalCount, loading, hasMore, nextData } = useMultimediaGridDemoData({
        initialCount: 30,
    });

    const handleLoadMore = async (): Promise<void> => {
        await nextData(30);
    };

    return (
        <MultimediaGrid
            {...args}
            items={items}
            totalRowCount={totalCount}
            loading={loading}
            onLoadMore={handleLoadMore}
            hasMore={hasMore}
        />
    );
};

export const InfiniteScroll: Story = {
    args: {
        ...defaultArgs,
        showRingToolbar: true,
    },
    render: (args, context) => {
        if (context?.viewMode === 'story') {
            return <Example {...args} />;
        }

        return createCodeStory({
            context,
            customProps: {},
            customCode: InfiniteScrollExampleCode,
            example: <Example {...args} />,
        });
    },
};
