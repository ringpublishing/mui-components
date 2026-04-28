import type { StoryObj } from '@storybook/react-vite';
import { Placeholder, PlaceholderVariant } from '../../../../../src/index.js';
import { createCodeStory } from '../../../../helpers.js';
import EmptyExampleCode from './code/EmptyExample.tsx?raw';

type Story = StoryObj<typeof Placeholder>;

export const Empty: Story = {
    args: {
        variant: PlaceholderVariant.EMPTY,
    },
    render: (args, context) => {
        return createCodeStory({
            context,
            customCode: EmptyExampleCode,
            example: <Placeholder {...args} />,
        });
    },
};
