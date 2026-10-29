import React, { useRef } from 'react';
import { Box, IconButton, Stack, SxProps, Theme, Typography, alpha } from '@mui/material';
import {
    Captions,
    Copy,
    Download,
    EllipsisVertical,
    ExternalLink,
    Gauge,
    Link,
    Pencil,
    Send,
    Settings,
    Share2,
    Sparkles,
    Trash2,
} from 'lucide-react';

import { ActionBox, ActionBoxItem } from '@ringpublishing/mui-components';

// 1. Article card: the ActionBox `sx` widens the surface, an action's `sx` marks the destructive one.
const articleActions: ActionBoxItem[] = [
    { label: 'Edit', onClick: () => null, icon: <Pencil /> },
    { label: 'Duplicate', onClick: () => null, icon: <Copy /> },
    { label: 'Share', onClick: () => null, icon: <Share2 />, hasSeparatorAfter: true },
    {
        label: 'Delete',
        onClick: () => null,
        icon: <Trash2 />,
        sx: (theme: Theme) => ({
            color: theme.palette.error.main,
            '& svg': { color: theme.palette.error.main },
            '&:hover': { backgroundColor: alpha(theme.palette.error.main, theme.palette.action.hoverOpacity) },
        }),
    },
];

// 2. Video player: the menu takes the player's dark chrome, in light and dark mode alike.
const playerMenuSx: SxProps<Theme> = (theme) => ({
    minWidth: 220,
    backgroundColor: theme.palette.grey[900],
    color: theme.palette.common.white,
    '& svg': { color: theme.palette.grey[400] },
    '& hr': { borderColor: alpha(theme.palette.common.white, 0.12) },
    '& [role="menuitem"]:hover, & [role="menuitem"]:focus-visible': {
        backgroundColor: alpha(theme.palette.common.white, 0.08),
    },
});

const playerActions: ActionBoxItem[] = [
    { label: 'Playback speed', onClick: () => null, icon: <Gauge /> },
    { label: 'Quality', onClick: () => null, icon: <Sparkles /> },
    { label: 'Subtitles', onClick: () => null, icon: <Captions />, hasSeparatorAfter: true },
    { label: 'Download', onClick: () => null, icon: <Download /> },
];

// 3. Table row: compact `body2` items to match a dense grid, and the main action in the accent colour.
const denseItemSx: SxProps<Theme> = (theme) => ({ ...theme.typography.body2, minHeight: 32 });

const rowActions: ActionBoxItem[] = [
    {
        label: 'Publish',
        onClick: () => null,
        icon: <Send />,
        sx: (theme: Theme) => ({
            ...theme.typography.body2,
            minHeight: 32,
            color: theme.palette.primary.main,
            fontWeight: theme.typography.fontWeightMedium,
            '& svg': { color: theme.palette.primary.main },
        }),
    },
    { label: 'Open in a new tab', onClick: () => null, icon: <ExternalLink />, sx: denseItemSx },
    { label: 'Copy link', onClick: () => null, icon: <Link />, sx: denseItemSx },
];

interface ShowcaseProps {
    caption: string;
    actions: ActionBoxItem[];
    sx?: SxProps<Theme>;
    renderTrigger: (ref: React.RefObject<HTMLButtonElement | null>) => React.ReactNode;
}

function Showcase({ caption, actions, sx, renderTrigger }: ShowcaseProps): React.JSX.Element {
    const ref = useRef<HTMLButtonElement | null>(null);

    return (
        <Stack spacing={1} sx={{ alignItems: 'center' }}>
            <Box sx={{ height: 40, display: 'flex', alignItems: 'center' }}>{renderTrigger(ref)}</Box>
            <Typography variant="caption" color="text.secondary">
                {caption}
            </Typography>
            <ActionBox actions={actions} anchorEl={ref} placement="bottom-end" sx={sx} />
        </Stack>
    );
}

export default function CustomStylingExample(): React.JSX.Element {
    return (
        <Stack direction="row" spacing={6} sx={{ justifyContent: 'center', alignItems: 'flex-start', pt: 2, pb: 18 }}>
            <Showcase
                caption="Article card"
                actions={articleActions}
                sx={{ minWidth: 200 }}
                renderTrigger={(ref): React.ReactNode => (
                    <IconButton ref={ref} aria-label="More actions" data-testid="action-box-trigger">
                        <EllipsisVertical />
                    </IconButton>
                )}
            />
            <Showcase
                caption="Video player"
                actions={playerActions}
                sx={playerMenuSx}
                renderTrigger={(ref): React.ReactNode => (
                    <Box sx={{ backgroundColor: 'grey.900', borderRadius: 1 }}>
                        <IconButton ref={ref} aria-label="Player settings" sx={{ color: 'common.white' }}>
                            <Settings />
                        </IconButton>
                    </Box>
                )}
            />
            <Showcase
                caption="Table row"
                actions={rowActions}
                renderTrigger={(ref): React.ReactNode => (
                    <IconButton ref={ref} aria-label="Row actions" size="small">
                        <EllipsisVertical />
                    </IconButton>
                )}
            />
        </Stack>
    );
}
