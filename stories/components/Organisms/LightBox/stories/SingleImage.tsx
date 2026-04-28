import type { StoryObj } from '@storybook/react-vite';
import { createCodeStory } from '../../../../helpers.js';
import SingleImageExampleCode from './code/SingleImageExample.tsx?raw';
import { LightBox, LightBoxProps } from '../../../../../src/index.js';
import { getImagePath, ImageSize, TestImage } from '../../../../../src/helpers/stories/imagesData.js';
import { LightBoxWrapper } from './Default.js';

type Story = StoryObj<typeof LightBox>;

export const SingleImage: Story = {
    args: {
        images: [
            {
                src: getImagePath(TestImage.MOUNTAINS, ImageSize.LARGE),
                thumbnailSrc: getImagePath(TestImage.MOUNTAINS, ImageSize.LARGE),
                title: TestImage.MOUNTAINS,
            },
        ],
    },
    render: (args, context) =>
        createCodeStory({
            context,
            customProps: args,
            example: <LightBoxWrapper {...(args as LightBoxProps)} />,
            customCode: SingleImageExampleCode,
        }),
};
