import { Box } from '@mui/material';
import { Media } from '@ringpublishing/mui-components';
import { getImagePath, TestImage, ImageSize } from 'RingDemoImages';

const image = {
    src: getImagePath(TestImage.NEONS, ImageSize.MEDIUM),
    thumbnailSrc: getImagePath(TestImage.NEONS, ImageSize.MEDIUM),
    title: 'Neons',
};

export default function MediaFlagExample(): React.JSX.Element {
    // Same status label as on MediaCard, but Media draws it 24px tall with
    // square corners; MediaCard draws it 16px tall with a 4px radius.
    return (
        <Box sx={{ width: 240 }}>
            <Media
                image={image}
                title="Title/name"
                description="Owner/License"
                ratio="4/3"
                objectFit="cover"
                statusLabels={[{ label: 'AI', color: 'ai' }]}
            />
        </Box>
    );
}
