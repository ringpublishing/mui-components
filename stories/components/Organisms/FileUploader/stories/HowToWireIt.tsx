import type { StoryObj } from '@storybook/react-vite';
import { Stack } from '@mui/material';
import { createCodeStory } from '../../../../helpers.js';
import HowToWireItExampleCode from './code/HowToWireItExample.tsx?raw';
import HowToWireItExample from './code/HowToWireItExample.js';
import { FileUploader } from '../../../../../src/index.js';

type Story = StoryObj<typeof FileUploader>;

const Example = (): React.JSX.Element => (
    <Stack alignItems="center" p={2} sx={{ width: '100%' }}>
        <HowToWireItExample />
    </Stack>
);

export const HowToWireIt: Story = {
    // A working flow with its own state; the controls would not reach it.
    parameters: { controls: { disable: true } },
    render: (args, context) => {
        if (context?.viewMode === 'story') {
            return <Example />;
        }

        return createCodeStory({
            context,
            customProps: {},
            customCode: HowToWireItExampleCode,
            example: <Example />,
        });
    },
};
