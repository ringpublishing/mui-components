import type { Meta } from '@storybook/react-vite';
import { Media } from '../../../../src/index.js';
import { Default } from './stories/Default.js';
import { NoImageUrl } from './stories/NoImageUrl.js';
import { Video } from './stories/Video.js';
import { Audio } from './stories/Audio.js';
import { AudioWithBackground } from './stories/AudioWithBackground.js';
import defaultArgs from './common/defaultArgs.js';
import MediaMdx from './Media.mdx';

const meta: Meta<typeof Media> = {
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
        slotProps: {
            control: 'object',
            description:
                'Props forwarded to internal component slots. ' +
                'Use `slotProps.media` to render a `<video>` or `<audio>` element instead of an image, ' +
                'passing any native HTML media attributes.',
            table: {
                category: 'customization',
                type: { summary: '{ media?: CardMediaProps & VideoHTMLAttributes & AudioHTMLAttributes }' },
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
    },
};

export default meta;

export { Default, NoImageUrl, Video, Audio, AudioWithBackground };
