import { Stack } from '@mui/material';
import type { StoryObj } from '@storybook/react-vite';
import { Switch } from '../../../../../src/index.js';

import { createCodeStory } from '../../../../helpers.js';
import ColorsExampleCode from './code/ColorsExample.tsx?raw';

type Story = StoryObj<typeof Switch>;

const Example = (args: React.ComponentProps<typeof Switch>): React.JSX.Element => {
    return (
        <Stack direction="row" spacing={2} alignItems="center">
            <Switch {...args} color="primary" defaultChecked={true} />
            <Switch {...args} color="primary" />
            <Switch {...args} color="error" defaultChecked={true} />
            <Switch {...args} color="error" />
        </Stack>
    );
};

export const Colors: Story = {
    args: {},
    parameters: {
        controls: {
            disable: true,
        },
    },
    render: (args, context) => {
        return createCodeStory({
            context,
            customProps: {},
            customCode: ColorsExampleCode,
            example: <Example {...args} />,
        });
    },
};
