import React from 'react';
import type { StoryObj } from '@storybook/react-vite';
import { Trash2, LockOpen } from 'lucide-react';
import { createCodeStory } from '../../../../helpers.js';
import StatusLabelsExampleCode from './code/StatusLabelsExample.tsx?raw';
import { MediaCard } from '../../../../../src/index.js';
import defaultArgs from '../common/defaultArgs.js';
import { getImagePath, ImageSize, TestImage } from '../../../../helpers/imagesData.js';

type Story = StoryObj<typeof MediaCard>;

const Example = (args: React.ComponentProps<typeof MediaCard>): React.JSX.Element => {
    return <MediaCard {...args} />;
};

export const StatusLabels: Story = {
    args: {
        ...defaultArgs,
        statusLabels: [
            {
                label: 'Deleted',
                color: 'error',
                icon: <Trash2 />,
                key: 'test-deleted',
            },
            {
                label: 'Inactive',
                color: 'default',
                key: 'test-inactive',
            },
            {
                label: 'J. Zatrzymałowski',
                color: 'error',
                icon: <LockOpen />,
                tip: 'This resource is locked by J. Zatrzymałowski',
            },
            {
                label: 'New',
                color: 'primary',
                icon: <LockOpen />,
                showOnHover: true,
            },
        ],
        image: getImagePath(TestImage.ISLAND, ImageSize.MEDIUM),
    },
    render: (args, context) =>
        createCodeStory({
            context,
            customProps: {},
            customCode: StatusLabelsExampleCode,
            example: <Example {...args} />,
        }),
};
