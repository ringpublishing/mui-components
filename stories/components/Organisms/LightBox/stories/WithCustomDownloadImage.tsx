import type { StoryObj } from '@storybook/react-vite';
import { action } from 'storybook/actions';
import { createCodeStory } from '../../../../helpers.js';
import WithCustomDownloadImageExampleCode from './code/WithCustomDownloadImageExample.tsx?raw';
import { LightBox, LightBoxProps } from '../../../../../src/index.js';
import { LightBoxWrapper } from './Default.js';

type Story = StoryObj<typeof LightBox>;

export const WithCustomDownloadImage: Story = {
    args: {
        handleImageDownload: (image) => {
            action('Download image action')(image);
        },
    },
    render: (args, context) =>
        createCodeStory({
            context,
            customProps: args,
            example: <LightBoxWrapper {...(args as LightBoxProps)} />,
            customCode: WithCustomDownloadImageExampleCode,
        }),
};
