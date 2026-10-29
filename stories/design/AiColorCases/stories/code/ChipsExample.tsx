import { Box, Chip, Stack, Tooltip } from '@mui/material';
import { Sparkles } from 'lucide-react';
import { RingLucideIcon } from '@ringpublishing/mui-components';
import { getImagePath, TestImage, ImageSize } from 'RingDemoImages';

export default function ChipsExample(): React.JSX.Element {
    // An AI flag is a tag: the AI surface in the tag's box (24px, 4px corners, no hover).
    return (
        <Stack spacing={3} alignItems="flex-start">
            <Stack direction="row" spacing={2} alignItems="center">
                <Chip variant="tag" color="ai" label="AI" />
                <Chip variant="tag" color="ai" label="AI" icon={<RingLucideIcon icon={Sparkles} />} />
                <Chip variant="tag" color="ai" label="AI" onDelete={(): void => undefined} />
                <Tooltip title="Generated with AI">
                    <Chip variant="tag" color="ai" label="AI" />
                </Tooltip>
            </Stack>

            {/* The surface layers the gradient tint over the theme's paper colour,
                so the label stays legible on top of imagery. */}
            <Box
                sx={{
                    p: 2,
                    borderRadius: 1,
                    backgroundImage: `url(${getImagePath(TestImage.NEONS, ImageSize.MEDIUM)})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                }}
            >
                <Chip variant="tag" color="ai" label="AI" />
            </Box>
        </Stack>
    );
}
