import type { StoryObj } from '@storybook/react-vite';
import { MultimediaGrid } from '../../../../../src/index.js';
import defaultArgs from '../common/defaultArgs.js';

type Story = StoryObj<typeof MultimediaGrid>;

export const ErrorStateCustomLabels: Story = {
    args: {
        ...defaultArgs,
        showRingToolbar: true,
        error: true,
        items: [],
        totalRowCount: 0,
        loading: false,
        refreshItems: () => undefined,
        placeholderLabels: {
            error: {
                header: 'We could not load your media',
                description: 'Something went wrong on our side. Retry, or contact support if it keeps happening.',
            },
            tryAgainButton: 'Retry',
        },
    },
    render: (args) => {
        return <MultimediaGrid {...args} />;
    },
    parameters: {
        withLanguageSupport: true,
    },
};
