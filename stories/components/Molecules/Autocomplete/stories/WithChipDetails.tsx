import type { StoryObj } from '@storybook/react-vite';
import { createCodeStory } from '../../../../helpers.js';
import WithChipDetailsExampleCode from './code/WithChipDetailsExample.tsx?raw';
import WithChipDetailsExampleComponent from './WithChipDetailsExample.js';
import { Autocomplete } from '../../../../../src/index.js';
import defaultArgs from '../common/defaultArgs.js';

type Story = StoryObj<typeof Autocomplete>;

export const WithChipDetails: Story = {
    parameters: {
        controls: { disable: true },
        actions: { disable: true },
    },
    args: {
        ...defaultArgs,
    },
    render: (args, context) =>
        createCodeStory({
            context,
            customProps: args,
            customCode: WithChipDetailsExampleCode,
            example: <WithChipDetailsExampleComponent {...args} />,
        }),
};
