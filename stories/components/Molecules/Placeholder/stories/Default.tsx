import type { StoryObj } from '@storybook/react-vite';
import { Placeholder } from '../../../../../src/index.js';
import { createCodeStory } from '../../../../helpers.js';
import DefaultExampleCode from './code/DefaultExample.tsx?raw';

type Story = StoryObj<typeof Placeholder>;

export const Default: Story = {
    render: (args, context) => {
        return createCodeStory({
            context,
            customCode: DefaultExampleCode,
            example: <Placeholder {...args} />,
        });
    },
};
