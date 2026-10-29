import { Stack } from '@mui/material';
import type { StoryObj } from '@storybook/react-vite';
import { Switch } from '../../../../../src/index.js';

import { createCodeStory } from '../../../../helpers.js';
import SizesExampleCode from './code/SizesExample.tsx?raw';

type Story = StoryObj<typeof Switch>;

const Example = (args: React.ComponentProps<typeof Switch>): React.JSX.Element => {
    return (
        <Stack direction="row" spacing={2} alignItems="center">
            <Switch {...args} size="medium" />
            <Switch {...args} size="small" />
        </Stack>
    );
};

export const Sizes: Story = {
    args: {
        defaultChecked: true,
    },
    parameters: {
        controls: {
            disable: true,
        },
    },
    render: (args, context) => {
        return createCodeStory({
            context,
            customProps: {},
            customCode: SizesExampleCode,
            example: <Example {...args} />,
        });
    },
};
