import React, { useState } from 'react';
import type { StoryObj } from '@storybook/react-vite';
import { action } from 'storybook/actions';
import { Download, Link } from '@mui/icons-material';
import { createCodeStory } from '../../../../helpers.js';
import DefaultExampleCode from './code/DefaultExample.tsx?raw';
import { MediaCard } from '../../../../../src/index.js';
import defaultArgs from '../common/defaultArgs.js';
import { getImagePath, ImageSize, TestImage } from '../../../../../src/helpers/stories/imagesData.js';

type Story = StoryObj<typeof MediaCard>;

const DefaultWrapper = (args: React.ComponentProps<typeof MediaCard>): React.JSX.Element => {
    const [active, setActive] = useState(false);
    const [checked, setChecked] = useState(false);

    const handleCardClick = (): void => {
        setActive(!active);
        action('Card clicked - active toggled')(!active);
    };

    const handleCheckboxClick = (event: React.MouseEvent): void => {
        event.stopPropagation();
        setChecked(!checked);
        action('Checkbox clicked')();
    };

    return (
        <MediaCard
            {...args}
            active={active}
            onClick={handleCardClick}
            slotProps={{
                ...args.slotProps,
                checkbox: {
                    ...args.slotProps?.checkbox,
                    checked,
                    onClick: handleCheckboxClick,
                },
            }}
        />
    );
};

export const Default: Story = {
    args: {
        ...defaultArgs,
        image: getImagePath(TestImage.ISLAND, ImageSize.MEDIUM),
        hoverable: true,
        actions: [
            {
                label: 'Action 1',
                icon: <Download />,
            },
            {
                label: 'Action 2',
                icon: <Link />,
            },
        ],
        fields: [
            { value: 'Source / Author' },
            { value: 'Brief description or summary of the content' },
            { value: 'Space for comments or additional information that may take up more space' },
        ],
        statusLabels: [
            {
                label: 'downloaded',
                color: 'success',
                icon: <Download />,
            },
        ],
    },
    render: (args, context) =>
        createCodeStory({
            context,
            customProps: {},
            customCode: DefaultExampleCode,
            example: <DefaultWrapper {...args} />,
        }),
};
