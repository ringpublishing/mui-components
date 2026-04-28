import type { StoryObj } from '@storybook/react-vite';
import { Placeholder, PlaceholderVariant } from '../../../../../src/index.js';
import { createCodeStory } from '../../../../helpers.js';
import NotFoundExampleCode from './code/NotFoundExample.tsx?raw';

type Story = StoryObj<typeof Placeholder>;

export const NotFound: Story = {
    args: {
        variant: PlaceholderVariant.NOT_FOUND,
    },
    render: (args, context) => {
        return createCodeStory({
            context,
            customCode: NotFoundExampleCode,
            example: <Placeholder {...args} />,
        });
    },
};
