import type { Meta } from '@storybook/react-vite';
import { LightBox } from '../../../../src/index.js';
import { Default } from './stories/Default.js';
import { SingleImage } from './stories/SingleImage.js';
import { WithInfiniteScroll } from './stories/WithInfiniteScroll.js';
import { WithCustomDownloadImage } from './stories/WithCustomDownloadImage.js';
import { WithHideDownloadIcon } from './stories/WithHideDownloadIcon.js';
import { WithDetail } from './stories/WithDetail.js';
import { WithInitialImageId } from './stories/WithInitialImageId.js';
import LightBoxMDX from './LightBox.mdx';

const meta: Meta<typeof LightBox> = {
    component: LightBox,
    parameters: {
        docs: {
            page: LightBoxMDX,
        },
    },
    argTypes: {
        images: {
            control: 'object',
            description: 'An array of images with their source URLs, optional thumbnail URLs for carousel, and titles.',
            table: {
                category: 'data',
                type: { summary: '(Image & { id?: string | number })[]' },
            },
        },
        open: {
            control: 'boolean',
            description: 'Whether the LightBox dialog is open.',
            table: {
                category: 'behavior',
                defaultValue: { summary: 'false' },
                type: { summary: 'boolean' },
            },
        },
        onClose: {
            control: false,
            description: 'Callback function called when the LightBox is closed.',
            table: {
                category: 'callbacks',
                type: { summary: "(event: object, reason?: 'escapeKeyDown' | 'backdropClick') => void" },
            },
        },
        enableCarousel: {
            control: 'boolean',
            description: 'Whether to show the carousel of images at the bottom of the LightBox.',
            table: {
                category: 'behavior',
                defaultValue: { summary: 'true' },
                type: { summary: 'boolean' },
            },
        },
        enableDownloadIcon: {
            control: 'boolean',
            description: 'Whether to show the download icon in the toolbar.',
            table: {
                category: 'behavior',
                defaultValue: { summary: 'true' },
                type: { summary: 'boolean' },
            },
        },
        onImagesScrollEnd: {
            control: false,
            description: 'Callback function called when user scrolls to the end of the images for loading more.',
            table: {
                category: 'callbacks',
                type: { summary: '() => void' },
            },
        },
        moreImagesLoading: {
            control: 'boolean',
            description: 'Whether more images are currently being loaded and a loading indicator should be shown.',
            table: {
                category: 'state',
                type: { summary: 'boolean' },
            },
        },
        handleImageDownload: {
            control: false,
            description: 'Custom callback for the download button. Overrides default download behavior.',
            table: {
                category: 'callbacks',
                type: { summary: '(image: Image) => void' },
            },
        },
        onImageChange: {
            control: false,
            description: 'Callback function called when the displayed image changes.',
            table: {
                category: 'callbacks',
                type: { summary: '(image?: Image & { id?: string | number }) => void' },
            },
        },
        initialImageId: {
            control: 'text',
            description: 'Initial image ID to display when the LightBox is opened.',
            table: {
                category: 'behavior',
                type: { summary: 'string | number' },
            },
        },
        detail: {
            control: 'object',
            description: 'Detail panel props to show alongside the image with metadata, actions, and editable title.',
            table: {
                category: 'content',
                type: { summary: 'DetailProps' },
            },
        },
        sx: {
            control: 'object',
            description: 'MUI System properties to customize the main element style.',
            table: {
                category: 'customization',
                type: { summary: 'SxProps<Theme>' },
            },
        },
        className: {
            control: 'text',
            description: 'CSS class name applied to the main element.',
            table: {
                category: 'customization',
                type: { summary: 'string' },
            },
        },
        dataTestIdSuffix: {
            control: 'text',
            description: 'Optional suffix for generated test id (base: ring-light-box).',
            table: {
                category: 'customization',
                type: { summary: 'string' },
            },
        },
    },
};

export default meta;

export {
    Default,
    SingleImage,
    WithInfiniteScroll,
    WithCustomDownloadImage,
    WithHideDownloadIcon,
    WithDetail,
    WithInitialImageId,
};
