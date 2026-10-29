import React, { useState } from 'react';
import { MediaCard } from '@ringpublishing/mui-components';
import { Download, Link2, Share2, Heart, Info } from 'lucide-react';
import { Box, IconButton } from '@mui/material';
import { getImagePath, TestImage, ImageSize } from 'RingDemoImages';

export default function AdvancedExample(): React.JSX.Element {
    const [isActive, setIsActive] = useState(false);
    const handleCardClick = (): void => {
        setIsActive(!isActive);
    };

    const [isCheckboxChecked, setIsCheckboxChecked] = useState(false);
    const handleCheckboxClick = (event: React.MouseEvent): void => {
        event.stopPropagation();
        setIsCheckboxChecked(!isCheckboxChecked);
    };

    const handleDownloadClick = (event: React.MouseEvent): void => {
        event.stopPropagation();
        console.log('Footer Download button clicked');
    };

    const handleShareClick = (event: React.MouseEvent): void => {
        event.stopPropagation();
        console.log('Footer Share button clicked');
    };

    const handleFavoriteClick = (event: React.MouseEvent): void => {
        event.stopPropagation();
        console.log('Footer Favorite button clicked');
    };

    return (
        <MediaCard
            title="Advanced Example"
            image={getImagePath(TestImage.ISLAND, ImageSize.MEDIUM)}
            ratio="16/9"
            objectFit="cover"
            sx={{ width: '300px' }}
            hoverable={true}
            active={isActive}
            onClick={handleCardClick}
            slotProps={{
                checkbox: {
                    checked: isCheckboxChecked,
                    onClick: handleCheckboxClick,
                    showOnHover: !isCheckboxChecked,
                },
            }}
            slots={{
                footer: (
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', ml: 1 }}>
                            <Info size={16} color="#BC1828" />
                            <Info size={16} color="#BC1828" />
                            <Info size={16} color="#BC1828" />
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
                            <IconButton size="small" onClick={handleDownloadClick}>
                                <Download />
                            </IconButton>
                            <IconButton size="small" onClick={handleShareClick}>
                                <Share2 />
                            </IconButton>
                            <IconButton size="small" onClick={handleFavoriteClick}>
                                <Heart />
                            </IconButton>
                        </Box>
                    </Box>
                ),
            }}
            statusLabels={[
                {
                    label: 'Premium',
                    color: 'success',
                    icon: <Download />,
                },
                {
                    label: 'New Feature',
                    color: 'primary',
                    icon: <Download />,
                    showOnHover: !isActive,
                    tip: 'This feature is available for premium users',
                },
                {
                    label: 'ASG',
                    color: 'secondary',
                    icon: <Link2 />,
                    showOnHover: !isActive,
                },
            ]}
            actions={[
                {
                    label: 'Download',
                    icon: <Download />,
                    onClick: () => console.log('Downloading...'),
                },
                {
                    label: 'Share',
                    icon: <Link2 />,
                    onClick: () => console.log('Sharing...'),
                },
            ]}
            fields={[
                { value: 'Jane Doe / Example', fontWeight: 'bold' },
                { value: 'Demonstration of new features in MediaCard', color: 'success.main', fontStyle: 'italic' },
                { value: 'This card showcases the latest enhancements and capabilities', color: 'text.secondary' },
            ]}
        />
    );
}
