import type { LooseArgTypesMeta } from '../../../helpers.js';
import { Media } from '../../../../src/index.js';
import { Default } from './stories/Default.js';
import { NoImageUrl } from './stories/NoImageUrl.js';
import { Video } from './stories/Video.js';
import { Audio } from './stories/Audio.js';
import { AudioWithBackground } from './stories/AudioWithBackground.js';
import { CardEvents } from './stories/CardEvents.js';
import defaultArgs from './common/defaultArgs.js';
import MediaMdx from './Media.mdx';

const meta = {
    component: Media,
    parameters: {
        docs: {
            page: MediaMdx,
        },
    },
    args: {
        ...defaultArgs,
    },
    argTypes: {
        sx: {
            control: 'object',
            description: 'MUI System properties to customize the card container style.',
            table: {
                category: 'customization',
                type: { summary: 'SxProps<Theme>' },
                defaultValue: { summary: '{}' },
            },
        },
        className: {
            control: 'text',
            description: 'CSS class name applied to the root element.',
            table: {
                category: 'customization',
            },
        },
        image: {
            control: 'object',
            description:
                'Image source. Accepts a URL string or an Image object with `src`, `thumbnailSrc`, and `title`. ' +
                'When not provided, an icon placeholder is shown.',
            table: {
                category: 'content',
                type: { summary: 'string | { src: string; thumbnailSrc: string; title: string }' },
            },
        },
        title: {
            control: 'text',
            description: 'Caption text displayed in the bottom left corner below the media.',
            table: {
                category: 'content',
            },
        },
        type: {
            control: 'text',
            description: 'Media type label displayed in the top left corner above the image.',
            table: {
                category: 'content',
            },
        },
        statusLabels: {
            control: 'object',
            description:
                'Collection of Chip labels overlaid on the top-left corner of the media. ' +
                'Each entry accepts `label`, `color`, and `icon` (MUI ChipProps).',
            table: {
                category: 'content',
                type: { summary: "{ label: ReactNode; color?: ChipProps['color']; icon?: ReactElement }[]" },
            },
        },
        actions: {
            control: 'object',
            description:
                'Context menu actions accessible via the three-dot icon button in the top-right corner. ' +
                'When empty, the icon button is not rendered.',
            table: {
                category: 'content',
                type: { summary: '{ label: string; icon?: ReactNode }[]' },
            },
        },
        bottomTooltips: {
            control: 'object',
            description: 'Tooltip icon buttons displayed in the bottom-left corner over the media.',
            table: {
                category: 'content',
                type: { summary: '{ title: string; icon: ReactNode }[]' },
            },
        },
        disableFullScreenPreview: {
            control: 'boolean',
            description:
                'Disables the LightBox full-screen preview when the image is clicked. ' +
                'The `image` prop must be set for this to have effect.',
            table: {
                category: 'behavior',
                defaultValue: { summary: 'false' },
            },
        },
        ratio: {
            control: 'text',
            description:
                'Aspect ratio of the media container (e.g. `"4/3"`, `"16/9"`, `"18/1"`). ' +
                'Accepts a CSS aspect-ratio string or a number.',
            table: {
                category: 'appearance',
                defaultValue: { summary: '"4/3"' },
            },
        },
        objectFit: {
            control: 'select',
            options: ['contain', 'cover', 'fill', 'none', 'scale-down'],
            description: 'CSS `object-fit` value applied to the media element.',
            table: {
                category: 'appearance',
                defaultValue: { summary: '"contain"' },
            },
        },
        slots: {
            control: 'object',
            description: 'The components used for each slot inside. See the **Slots** section below.',
            table: {
                category: 'customization',
                type: { summary: 'object' },
            },
        },
        slotProps: {
            control: 'object',
            description: 'The props used for each slot inside. See the **Slot props** section below.',
            table: {
                category: 'customization',
                type: { summary: 'object' },
                defaultValue: { summary: '{}' },
            },
        },
        dataTestIdSuffix: {
            control: 'text',
            description: 'Suffix appended to the `data-testid` attribute for test targeting.',
            table: {
                category: 'customization',
            },
        },

        // slots — one row per slot, MUI-style breakdown of the `slots` object
        'slots.media': {
            name: 'slots.media',
            description:
                'Custom React node rendered in place of the default `<CardMedia>`. Wrapped in `<AspectRatio>` so `ratio` and `objectFit` still apply to the surrounding box.',
            table: {
                category: 'slots',
                type: { summary: 'ReactNode' },
            },
            control: false,
        },

        // slotProps — one row per slot prop, MUI-style breakdown of the `slotProps` object
        'slotProps.media': {
            name: 'slotProps.media',
            description:
                'Props applied to the default `<CardMedia>`. Lets you switch the underlying element (`component: "video" | "audio" | "img"`), tweak `src`, attach native media attributes (`controls`, `autoPlay`, `muted`, `playsInline`, etc.). When `slots.media` replaces the default render, only `component: "audio"` is still consulted for audio-specific wrapper styling.',
            table: {
                category: 'slotProps',
                type: { summary: 'CardMediaProps & VideoHTMLAttributes & AudioHTMLAttributes' },
            },
            control: false,
        },
        'slotProps.card': {
            name: 'slotProps.card',
            description:
                'Props applied to the root MUI `<Card>`. **Recommended channel for DOM events** (`onMouseEnter`, `onMouseLeave`, `onFocus`, `onKeyDown`, `aria-*`, `data-*`, …). Top-level MediaProps (`sx`) take precedence and are merged on top.',
            table: {
                category: 'slotProps',
                type: {
                    summary:
                        'Omit<CardProps, "children" | "variant" | "square" | "tabIndex" | "elevation" | "onClick">',
                },
            },
            control: false,
        },
    },
} satisfies LooseArgTypesMeta<typeof Media>;

export default meta;

export { Default, NoImageUrl, Video, Audio, AudioWithBackground, CardEvents };
