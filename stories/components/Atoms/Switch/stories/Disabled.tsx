import { Stack } from '@mui/material';
import type { StoryObj } from '@storybook/react-vite';
import { Switch } from '../../../../../src/index.js';

import { createCodeStory } from '../../../../helpers.js';
import DisabledExampleCode from './code/DisabledExample.tsx?raw';

type Story = StoryObj<typeof Switch>;

const Example = (args: React.ComponentProps<typeof Switch>): React.JSX.Element => {
    return (
        <Stack direction="row" spacing={2} alignItems="center">
            <Switch {...args} disabled={true} defaultChecked={true} />
            <Switch {...args} disabled={true} />
        </Stack>
    );
};

export const Disabled: Story = {
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
            customCode: DisabledExampleCode,
            example: <Example {...args} />,
        });
    },
};
