import { FormControlLabel } from '@mui/material';
import type { StoryObj } from '@storybook/react-vite';
import { Switch } from '../../../../../src/index.js';

import { createCodeStory } from '../../../../helpers.js';
import WithLabelExampleCode from './code/WithLabelExample.tsx?raw';

type Story = StoryObj<typeof Switch>;

const Example = (args: React.ComponentProps<typeof Switch>): React.JSX.Element => {
    return (
        <>
            <FormControlLabel control={<Switch {...args} defaultChecked={true} />} label="Label" />
            <FormControlLabel control={<Switch {...args} />} label="Disabled" disabled={true} />
        </>
    );
};

export const WithLabel: Story = {
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
            customCode: WithLabelExampleCode,
            example: <Example {...args} />,
        });
    },
};
