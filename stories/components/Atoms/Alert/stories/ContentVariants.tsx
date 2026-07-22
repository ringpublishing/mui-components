import { Stack } from '@mui/material';
import type { StoryObj } from '@storybook/react-vite';
import { Alert } from '../../../../../src/index.js';

import { createCodeStory } from '../../../../helpers.js';
import ContentVariantsExampleCode from './code/ContentVariantsExample.tsx?raw';

type Story = StoryObj<typeof Alert>;

const Example = (args: React.ComponentProps<typeof Alert>): React.JSX.Element => {
    return (
        <Stack spacing={2}>
            <Alert {...args} title="Title only" description={undefined} />
            <Alert {...args} title={undefined} description="Description only" />
            <Alert {...args} title="Title and description" description="Description under the title" />
        </Stack>
    );
};

export const ContentVariants: Story = {
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
            customCode: ContentVariantsExampleCode,
            example: <Example {...args} />,
        });
    },
};
