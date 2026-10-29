import { SvgIcon } from '@mui/material';
import { ChartColumn, FileUp, Image, ImageOff, Inbox, SearchX, Sparkles, Video } from 'lucide-react';
import type { FeaturedIconProps } from '../../../../../src/index.js';
import { RingLucideIcon } from '../../../../../src/helpers/RingLucideIcon.js';
import type { Presets } from '../../../../helpers.js';

export const ICONS: Presets<FeaturedIconProps['icon']> = {
    image: { value: Image, label: 'Image' },
    imageOff: { value: ImageOff, label: 'ImageOff' },
    video: { value: Video, label: 'Video' },
    inbox: { value: Inbox, label: 'Inbox' },
    searchX: { value: SearchX, label: 'SearchX' },
    chartColumn: { value: ChartColumn, label: 'ChartColumn' },
    fileUp: { value: FileUp, label: 'FileUp' },
    ai: {
        value: <RingLucideIcon icon={Sparkles} color="ai" />,
        label: '<RingLucideIcon icon={Sparkles} color="ai" />',
    },
    muiElement: {
        value: (
            <SvgIcon>
                <path d="M21 19V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2zM8.5 13.5l2.5 3 3.5-4.5 4.5 6H5l3.5-4.5z" />
            </SvgIcon>
        ),
        label: '<SvgIcon><path d="…" /></SvgIcon>',
    },
};

export const SLOT_PROPS: Presets<FeaturedIconProps['slotProps']> = {
    none: { value: undefined, label: 'undefined' },
    selected: {
        value: { plate: { sx: { bgcolor: 'action.selected', color: 'primary.main' } } },
        label: "{ plate: { sx: { bgcolor: 'action.selected', color: 'primary.main' } } }",
    },
    outlined: {
        value: { plate: { sx: { outline: '1px solid', outlineColor: 'divider' } } },
        label: "{ plate: { sx: { outline: '1px solid', outlineColor: 'divider' } } }",
    },
};
