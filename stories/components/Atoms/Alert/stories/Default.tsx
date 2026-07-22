import type { StoryObj } from '@storybook/react-vite';
import { Alert } from '../../../../../src/index.js';

import { createCodeStory } from '../../../../helpers.js';
import defaultArgs from '../common/defaultArgs.js';
import DefaultExampleCode from './code/DefaultExample.tsx?raw';

type Story = StoryObj<typeof Alert>;

const Example = (args: React.ComponentProps<typeof Alert>): React.JSX.Element => {
    return <Alert {...args} />;
};

export const Default: Story = {
    args: {
        ...defaultArgs,
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
