import type { StoryObj } from '@storybook/react-vite';
import { createCodeStory } from '../../../../helpers.js';
import WithInfiniteScrollExampleCode from './code/WithInfiniteScrollExample.tsx?raw';
import { LightBox, LightBoxProps } from '../../../../../src/index.js';
import { LightBoxWrapper } from './Default.js';

type Story = StoryObj<typeof LightBox>;

export const WithInfiniteScroll: Story = {
    args: {},
    render: (args, context) =>
        createCodeStory({
            context,
            customProps: args,
            example: <LightBoxWrapper {...(args as LightBoxProps)} withInfiniteScroll={true} />,
            customCode: WithInfiniteScrollExampleCode,
        }),
};
