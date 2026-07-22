import type { StoryObj } from '@storybook/react-vite';
import { Alert } from '../../../../../src/index.js';

import { createCodeStory } from '../../../../helpers.js';
import defaultArgs from '../common/defaultArgs.js';
import WithLinkActionExampleCode from './code/WithLinkActionExample.tsx?raw';

type Story = StoryObj<typeof Alert>;

const Example = (args: React.ComponentProps<typeof Alert>): React.JSX.Element => {
    return (
        <Alert
            {...args}
            action={{
                label: 'Open docs',
                href: 'https://example.com',
                buttonProps: {
                    target: '_blank',
                    rel: 'noreferrer noopener',
                },
            }}
        />
    );
};

export const WithLinkAction: Story = {
    args: {
        ...defaultArgs,
    },
    render: (args, context) => {
        return createCodeStory({
            context,
            customProps: {},
            customCode: WithLinkActionExampleCode,
            example: <Example {...args} />,
        });
    },
};
