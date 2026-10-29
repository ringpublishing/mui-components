import type { StoryObj } from '@storybook/react-vite';
import { Stack } from '@mui/material';
import { createCodeStory } from '../../../../helpers.js';
import PodcastEpisodeExampleCode from './code/PodcastEpisodeExample.tsx?raw';
import PodcastEpisodeExample from './code/PodcastEpisodeExample.js';
import { FileUploader } from '../../../../../src/index.js';

type Story = StoryObj<typeof FileUploader>;

const Example = (): React.JSX.Element => (
    <Stack alignItems="center" p={2} sx={{ width: '100%' }}>
        <PodcastEpisodeExample />
    </Stack>
);

export const PodcastEpisode: Story = {
    // A working flow with its own state; the controls would not reach it.
    parameters: { controls: { disable: true } },
    render: (args, context) => {
        if (context?.viewMode === 'story') {
            return <Example />;
        }

        return createCodeStory({
            context,
            customProps: {},
            customCode: PodcastEpisodeExampleCode,
            example: <Example />,
        });
    },
};
