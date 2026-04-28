import type { StoryObj } from '@storybook/react-vite';
import { createCodeStory } from '../../../../helpers.js';
import WithHideDownloadIconExampleCode from './code/WithHideDownloadIconExample.tsx?raw';
import { LightBox, LightBoxProps } from '../../../../../src/index.js';
import { LightBoxWrapper } from './Default.js';

type Story = StoryObj<typeof LightBox>;

export const WithHideDownloadIcon: Story = {
    args: {
        enableDownloadIcon: false,
    },
    render: (args, context) =>
        createCodeStory({
            context,
            customProps: args,
            example: <LightBoxWrapper {...(args as LightBoxProps)} />,
            customCode: WithHideDownloadIconExampleCode,
        }),
};
