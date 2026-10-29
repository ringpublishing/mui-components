import React, { useRef, useState } from 'react';
import { Box, Stack } from '@mui/material';
import { Captions, ImageUp, ScanText, Trash2 } from 'lucide-react';

import { Media, TextField } from '@ringpublishing/mui-components';
import { getImagePath, ImageSize, TestImage } from 'RingDemoImages';

const image = {
    src: getImagePath(TestImage.BUILDING, ImageSize.MEDIUM),
    thumbnailSrc: getImagePath(TestImage.BUILDING, ImageSize.MEDIUM),
    title: 'Riverside housing estate',
};

// A photo placed in an article. It cannot be published without alt text, so the photo's own menu takes the
// editor straight to the missing field: the action puts the caret there and the editor types right away.
export default function FocusAfterActionExample(): React.JSX.Element {
    const captionRef = useRef<HTMLInputElement | null>(null);
    const altTextRef = useRef<HTMLInputElement | null>(null);
    const [caption, setCaption] = useState('The riverside housing estate the council votes on tonight');
    const [altText, setAltText] = useState('');

    return (
        <Stack direction="row" spacing={3} sx={{ justifyContent: 'center', alignItems: 'flex-start' }}>
            <Box sx={{ width: 280 }}>
                <Media
                    image={image}
                    title={caption}
                    description="Photo: Anna Nowak"
                    ratio="4/3"
                    objectFit="cover"
                    disableFullScreenPreview={true}
                    statusLabels={altText ? [] : [{ label: 'No alt text', color: 'warning' }]}
                    actionsAriaLabel="Photo actions"
                    actions={[
                        { label: 'Write alt text', icon: <ScanText />, onClick: () => altTextRef.current?.focus() },
                        { label: 'Edit caption', icon: <Captions />, onClick: () => captionRef.current?.focus() },
                        { label: 'Replace photo', icon: <ImageUp />, onClick: () => null },
                        { label: 'Remove from article', icon: <Trash2 />, onClick: () => null },
                    ]}
                />
            </Box>
            <Stack spacing={2} sx={{ width: 320 }}>
                <TextField
                    label="Caption"
                    value={caption}
                    inputRef={captionRef}
                    onChange={(event): void => setCaption(event.target.value)}
                    helperText="Shown under the photo in the article"
                />
                <TextField
                    label="Alt text"
                    value={altText}
                    inputRef={altTextRef}
                    onChange={(event): void => setAltText(event.target.value)}
                    helperText="Required to publish: read out by screen readers and used by search engines"
                    multiline={true}
                    minRows={2}
                />
            </Stack>
        </Stack>
    );
}
