import type { StoryObj } from '@storybook/react-vite';
import { Stack } from '@mui/material';
import { createCodeStory } from '../../../../helpers.js';
import CompactLayoutExampleCode from './code/CompactLayoutExample.tsx?raw';
import CompactLayoutExample from './code/CompactLayoutExample.js';
import { FileUploader } from '../../../../../src/index.js';

type Story = StoryObj<typeof FileUploader>;

const Example = (): React.JSX.Element => (
    <Stack alignItems="center" p={2}>
        <CompactLayoutExample />
    </Stack>
);

export const CompactLayout: Story = {
    // The example is fixed at 288px to show the compact layout; the controls would not reach it.
    parameters: { controls: { disable: true } },
    render: (args, context) => {
        if (context?.viewMode === 'story') {
            return <Example />;
        }

        return createCodeStory({
            context,
            customProps: {},
            customCode: CompactLayoutExampleCode,
            example: <Example />,
        });
    },
};
