import type { StoryObj } from '@storybook/react-vite';
import { action } from 'storybook/actions';
import { Alert } from '../../../../../src/index.js';

import { createCodeStory } from '../../../../helpers.js';
import defaultArgs from '../common/defaultArgs.js';
import WithActionExampleCode from './code/WithActionExample.tsx?raw';

type Story = StoryObj<typeof Alert>;

const Example = (args: React.ComponentProps<typeof Alert>): React.JSX.Element => {
    return <Alert {...args} action={{ label: 'Action', onClick: action('delete') }} />;
};

export const WithAction: Story = {
    args: {
        ...defaultArgs,
    },
    render: (args, context) => {
        return createCodeStory({
            context,
            customProps: {},
            customCode: WithActionExampleCode,
            example: <Example {...args} />,
        });
    },
};
