import type { StoryObj } from '@storybook/react-vite';
import { Chip } from '@mui/material';

import { createCodeStory } from '../../../../helpers.js';
import DefaultExampleCode from './code/DefaultExample.tsx?raw';

type Story = StoryObj<typeof Chip>;

const Example = (args: React.ComponentProps<typeof Chip>): React.JSX.Element => {
    return <Chip {...args} />;
};

export const Default: Story = {
    args: {
        label: 'Chip',
    },
    render: (args, context) => {
        return createCodeStory({
            context,
            customProps: {},
            customCode: DefaultExampleCode,
            example: <Example {...args} />,
        });
    },
};
