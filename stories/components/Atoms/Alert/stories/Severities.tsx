import { Stack } from '@mui/material';
import type { StoryObj } from '@storybook/react-vite';
import { Alert } from '../../../../../src/index.js';

import { createCodeStory } from '../../../../helpers.js';
import SeveritiesExampleCode from './code/SeveritiesExample.tsx?raw';

type Story = StoryObj<typeof Alert>;

const Example = (args: React.ComponentProps<typeof Alert>): React.JSX.Element => {
    const handleActionClick = (): void => undefined;

    return (
        <Stack spacing={2}>
            <Alert
                {...args}
                severity="info"
                title="Info"
                description="Info description"
                action={{ label: 'Label', onClick: handleActionClick }}
                onClose={(): void => undefined}
            />
            <Alert
                {...args}
                severity="success"
                title="Success"
                description="Success description"
                action={{ label: 'Label', onClick: handleActionClick }}
                onClose={(): void => undefined}
            />
            <Alert
                {...args}
                severity="warning"
                title="Warning"
                description="Warning description"
                action={{ label: 'Label', onClick: handleActionClick }}
                onClose={(): void => undefined}
            />
            <Alert
                {...args}
                severity="error"
                title="Error"
                description="Error description"
                action={{ label: 'Label', onClick: handleActionClick }}
                onClose={(): void => undefined}
            />
        </Stack>
    );
};

export const Severities: Story = {
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
            customCode: SeveritiesExampleCode,
            example: <Example {...args} />,
        });
    },
};
