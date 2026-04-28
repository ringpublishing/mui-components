import type { StoryObj } from '@storybook/react-vite';
import { MultimediaGrid } from '../../../../../src/index.js';
import defaultArgs from '../common/defaultArgs.js';

type Story = StoryObj<typeof MultimediaGrid>;

export const ErrorState: Story = {
    args: {
        ...defaultArgs,
        showRingToolbar: true,
        error: true,
        items: [],
        totalRowCount: 0,
        loading: false,
    },
    render: (args) => {
        return <MultimediaGrid {...args} />;
    },
    parameters: {
        withLanguageSupport: true,
    },
};
