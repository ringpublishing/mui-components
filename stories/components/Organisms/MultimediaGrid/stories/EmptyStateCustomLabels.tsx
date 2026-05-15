import type { StoryObj } from '@storybook/react-vite';
import { MultimediaGrid } from '../../../../../src/index.js';
import defaultArgs from '../common/defaultArgs.js';

type Story = StoryObj<typeof MultimediaGrid>;

export const EmptyStateCustomLabels: Story = {
    args: {
        ...defaultArgs,
        showRingToolbar: true,
        items: [],
        totalRowCount: 0,
        loading: false,
        placeholderLabels: {
            empty: {
                header: 'Your library is empty',
                description: 'Upload your first asset to see it appear here.',
            },
        },
    },
    render: (args) => {
        return <MultimediaGrid {...args} />;
    },
    parameters: {
        withLanguageSupport: true,
    },
};
