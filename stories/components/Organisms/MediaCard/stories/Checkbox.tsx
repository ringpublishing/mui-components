import React from 'react';
import type { StoryObj } from '@storybook/react-vite';
import { action } from 'storybook/actions';
import { createCodeStory } from '../../../../helpers.js';
import CheckboxExampleCode from './code/CheckboxExample.tsx?raw';
import { MediaCard } from '../../../../../src/index.js';
import defaultArgs from '../common/defaultArgs.js';
import { getImagePath, ImageSize, TestImage } from '../../../../../src/helpers/stories/imagesData.js';

type Story = StoryObj<typeof MediaCard>;

const Example = (args: React.ComponentProps<typeof MediaCard>): React.JSX.Element => {
    return <MediaCard {...args} />;
};

export const Checkbox: Story = {
    args: {
        ...defaultArgs,
        slotProps: {
            checkbox: {
                onClick: action('onClick: checkbox clicked'),
            },
        },
        image: getImagePath(TestImage.ISLAND, ImageSize.MEDIUM),
    },
    render: (args, context) =>
        createCodeStory({
            context,
            customProps: {},
            customCode: CheckboxExampleCode,
            example: <Example {...args} />,
        }),
};
