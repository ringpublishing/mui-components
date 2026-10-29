import type { StoryObj } from '@storybook/react-vite';
import { Switch } from '../../../../../src/index.js';

import { createCodeStory } from '../../../../helpers.js';
import DefaultExampleCode from './code/DefaultExample.tsx?raw';

type Story = StoryObj<typeof Switch>;

const Example = (args: React.ComponentProps<typeof Switch>): React.JSX.Element => {
    return <Switch {...args} />;
};

export const Default: Story = {
    args: {
        defaultChecked: true,
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
