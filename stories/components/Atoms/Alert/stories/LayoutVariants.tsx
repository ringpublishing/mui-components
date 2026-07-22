import { Stack } from '@mui/material';
import type { StoryObj } from '@storybook/react-vite';
import { Alert } from '../../../../../src/index.js';

import { createCodeStory } from '../../../../helpers.js';
import LayoutVariantsExampleCode from './code/LayoutVariantsExample.tsx?raw';

type Story = StoryObj<typeof Alert>;

const Example = (args: React.ComponentProps<typeof Alert>): React.JSX.Element => {
    const handleActionClick = (): void => undefined;

    return (
        <Stack spacing={2}>
            <Alert
                {...args}
                actionsPlacement="right"
                layoutVariant="outline"
                title="Outline right"
                description="Description"
                action={{ label: 'Label', onClick: handleActionClick }}
                onClose={(): void => undefined}
            />
            <Alert
                {...args}
                actionsPlacement="bottom"
                layoutVariant="outline"
                title="Outline bottom"
                description="Description"
                action={{ label: 'Label', onClick: handleActionClick }}
                onClose={(): void => undefined}
            />
            <Alert
                {...args}
                actionsPlacement="right"
                layoutVariant="inline"
                title="Inline right"
                description="Description"
                action={{ label: 'Label', onClick: handleActionClick }}
                onClose={(): void => undefined}
            />
            <Alert
                {...args}
                actionsPlacement="bottom"
                layoutVariant="inline"
                title="Inline bottom"
                description="Description"
                action={{ label: 'Label', onClick: handleActionClick }}
                onClose={(): void => undefined}
            />
        </Stack>
    );
};

export const LayoutVariants: Story = {
    args: {},
    parameters: {
        controls: {
            disable: true,
        },
    },
    tags: ['!dev'],
    render: (args, context) => {
        return createCodeStory({
            context,
            customProps: {},
            customCode: LayoutVariantsExampleCode,
            example: <Example {...args} />,
        });
    },
};
