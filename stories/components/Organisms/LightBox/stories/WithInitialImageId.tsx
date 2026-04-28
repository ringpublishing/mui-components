import type { StoryObj } from '@storybook/react-vite';
import { createCodeStory } from '../../../../helpers.js';
import WithInitialImageIdExampleCode from './code/WithInitialImageIdExample.tsx?raw';
import { LightBox, LightBoxProps } from '../../../../../src/index.js';
import { LightBoxWrapper } from './Default.js';

type Story = StoryObj<typeof LightBox>;

export const WithInitialImageId: Story = {
    args: {
        initialImageId: 'image-5',
    },
    render: (args, context) =>
        createCodeStory({
            context,
            customProps: args,
            example: <LightBoxWrapper {...(args as LightBoxProps)} />,
            customCode: WithInitialImageIdExampleCode,
        }),
};
