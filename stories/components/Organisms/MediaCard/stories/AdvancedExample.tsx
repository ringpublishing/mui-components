import React, { useState } from 'react';
import type { StoryObj } from '@storybook/react-vite';
import { action } from 'storybook/actions';
import { Box, IconButton } from '@mui/material';
import { Download, Favorite, InfoOutlined, Link, Share } from '@mui/icons-material';
import { createCodeStory } from '../../../../helpers.js';
import AdvancedExampleCode from './code/AdvancedExampleCode.tsx?raw';
import { MediaCard } from '../../../../../src/index.js';
import defaultArgs from '../common/defaultArgs.js';
import { getImagePath, ImageSize, TestImage } from '../../../../../src/helpers/stories/imagesData.js';

type Story = StoryObj<typeof MediaCard>;

const AdvancedExampleWrapper = (args: React.ComponentProps<typeof MediaCard>): React.JSX.Element => {
    const [isSelected, setIsSelected] = useState(false);
    const [isCheckboxChecked, setIsCheckboxChecked] = useState(false);

    const handleCardClick = (): void => {
        setIsSelected(!isSelected);
        action('Card clicked - active toggled')(!isSelected);
    };

    const handleCheckboxClick = (event: React.MouseEvent): void => {
        event.stopPropagation();
        setIsCheckboxChecked(!isCheckboxChecked);
        action('Checkbox clicked')();
    };

    return (
        <MediaCard
            {...args}
            active={isSelected}
            onClick={handleCardClick}
            slotProps={{
                ...args.slotProps,
                checkbox: {
                    ...args.slotProps?.checkbox,
                    checked: isCheckboxChecked,
                    onClick: handleCheckboxClick,
                    showOnHover: !isCheckboxChecked,
                },
            }}
            statusLabels={args.statusLabels?.map((label) => ({
                ...label,
                showOnHover: label.showOnHover ? !isSelected : undefined,
            }))}
        />
    );
};

export const AdvancedExample: Story = {
    args: {
        ...defaultArgs,
        title: 'Advanced Example',
        image: getImagePath(TestImage.ISLAND, ImageSize.MEDIUM),
        objectFit: 'cover',
        hoverable: true,
        active: false,
        slots: {
            footer: (
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', ml: 1 }}>
                        <InfoOutlined sx={{ fontSize: 16, color: '#BC1828' }} />
                        <InfoOutlined sx={{ fontSize: 16, color: '#BC1828' }} />
                        <InfoOutlined sx={{ fontSize: 16, color: '#BC1828' }} />
                        <Box
                            sx={{
                                width: 16,
                                height: 16,
                                ml: 1,
                                borderRadius: '50%',
                                backgroundColor: '#FFD21E',
                            }}
                        />
                    </Box>
                    <Box>
                        <IconButton size="small">
                            <Download />
                        </IconButton>
                        <IconButton size="small">
                            <Share />
                        </IconButton>
                        <IconButton size="small">
                            <Favorite />
                        </IconButton>
                    </Box>
                </Box>
            ),
        },
        slotProps: {
            checkbox: {
                checked: false,
                showOnHover: true,
            },
            cardMedia: {
                component: 'img',
            },
        },
        statusLabels: [
            {
                label: 'Premium',
                color: 'success',
                icon: <Download />,
            },
            {
                label: 'New Feature',
                color: 'primary',
                icon: <Download />,
                showOnHover: true,
                tip: 'This feature is available for premium users',
            },
            {
                label: 'ASG',
                color: 'secondary',
                icon: <Link />,
                showOnHover: true,
            },
        ],
        actions: [
            {
                label: 'Download',
                icon: <Download />,
            },
            {
                label: 'Share',
                icon: <Link />,
            },
        ],
        fields: [
            { value: 'Jane Doe / Example', fontWeight: 'bold' },
            { value: 'Demonstration of new features in MediaCard', color: 'success.main', fontStyle: 'italic' },
            { value: 'This card showcases the latest enhancements and capabilities', color: 'text.secondary' },
        ],
    },
    render: (args, context) =>
        createCodeStory({
            context,
            customProps: {},
            customCode: AdvancedExampleCode,
            example: <AdvancedExampleWrapper {...args} />,
        }),
};
