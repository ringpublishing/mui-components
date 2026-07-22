import type { StoryObj } from '@storybook/react-vite';
import { action } from 'storybook/actions';
import { Alert } from '../../../../../src/index.js';

import { createCodeStory } from '../../../../helpers.js';
import defaultArgs from '../common/defaultArgs.js';
import WithCloseExampleCode from './code/WithCloseExample.tsx?raw';

type Story = StoryObj<typeof Alert>;

const Example = (args: React.ComponentProps<typeof Alert>): React.JSX.Element => {
    return <Alert {...args} onClose={action('onClose')} />;
};

export const WithClose: Story = {
    args: {
        ...defaultArgs,
    },
    render: (args, context) => {
        return createCodeStory({
            context,
            customProps: {},
            customCode: WithCloseExampleCode,
            example: <Example {...args} />,
        });
    },
};
