import type { LooseArgTypesMeta } from '../../../helpers.js';
import { Detail } from '../../../../src/index.js';
import defaultArgs from './common/defaultArgs.js';
import { Default as DefaultStory } from './stories/Default.js';
import { WithBottomIconButtons as WithBottomIconButtonsStory } from './stories/WithBottomIconButtons.js';
import { WithBottomChips as WithBottomChipsStory } from './stories/WithBottomChips.js';
import { WithFullScreenImage as WithFullScreenImageStory } from './stories/WithFullScreenImage.js';
import { WithMediaToolbarHandlers as WithMediaToolbarHandlersStory } from './stories/WithMediaToolbarHandlers.js';
import { WithCustomSlots as WithCustomSlotsStory } from './stories/WithCustomSlots.js';
import { WithCustomMediaSlot as WithCustomMediaSlotStory } from './stories/WithCustomMediaSlot.js';
import { WithLongUrl as WithLongUrlStory } from './stories/WithLongUrl.js';
import { EmptyState as EmptyStateStory } from './stories/EmptyState.js';
import { EmptyStateCustomLabels as EmptyStateCustomLabelsStory } from './stories/EmptyStateCustomLabels.js';
import DetailMdx from './Detail.mdx';

const meta = {
    component: Detail,
    parameters: {
        docs: {
            page: DetailMdx,
        },
    },
    args: {
        ...defaultArgs,
    },
    argTypes: {
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
            type: 'string',
            description: 'CSS class name applied to the main element.',
            table: {
                category: 'customization',
                type: { summary: 'string' },
            },
        },
        main: {
            control: 'object',
            description:
                'Main section of the detail — contains title, Media props and bottom icons. ' +
                'Bottom icons can be either all of type "chip" or all of type "icon".',
            table: {
                category: 'content',
                type: {
                    summary:
                        '{ mediaProps?: DetailMediaProps; title?: string | { value: string } | TitleEditable; onCloseClick?: () => void }',
                },
            },
        },
        descriptionItems: {
            control: 'object',
            description:
                'Description items section of the detail — fields in four types: default, chips, description, and editable.',
            table: {
                category: 'content',
                type: { summary: 'DetailDescriptionItem[]' },
            },
        },
        bottomActions: {
            control: 'object',
            description: 'Bottom actions section of the detail — actions with url or onClick handler.',
            table: {
                category: 'content',
                type: { summary: 'DetailBottomAction[]' },
            },
        },
        empty: {
            control: 'boolean',
            description: 'If true, shows a placeholder for the empty state.',
            table: {
                category: 'behavior',
                type: { summary: 'boolean' },
                defaultValue: { summary: 'false' },
            },
        },
        placeholderLabels: {
            control: 'object',
            description:
                'Custom labels for the empty state placeholder. Only `placeholderLabels.empty` is supported. When omitted, default localized labels are used.',
            table: {
                category: 'behavior',
                type: {
                    summary: '{ empty?: { header?: string; description?: string; footer?: string } }',
                },
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
        dataTestIdSuffix: {
            control: 'text',
            description: 'Optional suffix for the generated test id (base: ring-detail).',
            table: {
                category: 'customization',
                type: { summary: 'string' },
            },
        },

        // slots — one row per slot, MUI-style breakdown
        'slots.afterMain': {
            name: 'slots.afterMain',
            description: 'Custom React node rendered after the main media/title section.',
            table: { category: 'slots', type: { summary: 'React.JSX.Element' } },
            control: false,
        },
        'slots.afterDescriptionItems': {
            name: 'slots.afterDescriptionItems',
            description: 'Custom React node rendered after the description items sections.',
            table: { category: 'slots', type: { summary: 'React.JSX.Element' } },
            control: false,
        },
        'slots.afterBottomActions': {
            name: 'slots.afterBottomActions',
            description: 'Custom React node rendered after the bottom action buttons.',
            table: { category: 'slots', type: { summary: 'React.JSX.Element' } },
            control: false,
        },
        'main.mediaProps.slots.media': {
            name: 'main.mediaProps.slots.media',
            description:
                'Custom React node rendered in place of the default `<CardMedia>` in the media area. ' +
                'Wrapped in `<AspectRatio>` so `mediaProps.ratio` and `mediaProps.objectFit` still apply. ' +
                'When provided, the built-in LightBox / fullscreen preview is suppressed.',
            table: { category: 'slots', type: { summary: 'ReactNode' } },
            control: false,
        },

        // slotProps — one row per slot prop, MUI-style breakdown
        'main.mediaProps.slotProps.media': {
            name: 'main.mediaProps.slotProps.media',
            description:
                'Props applied to the default `<CardMedia>` in the media area. Used by the default render path ' +
                '(replaced when `main.mediaProps.slots.media` is set). Lets you switch the underlying element ' +
                '(`component: "video" | "audio" | "img"`), tweak `src`, attach native media attributes.',
            table: {
                category: 'slotProps',
                type: { summary: 'CardMediaProps & AudioHTMLAttributes & VideoHTMLAttributes' },
            },
            control: false,
        },
        'main.mediaProps.slotProps.card': {
            name: 'main.mediaProps.slotProps.card',
            description:
                'Props applied to the root MUI `<Card>` rendered inside `<Media>`. ' +
                '**Recommended channel for native DOM events** (`onMouseEnter`, `onMouseLeave`, `onFocus`, ' +
                '`onKeyDown`, `aria-*`, `data-*`, …) on the media area.',
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
} satisfies LooseArgTypesMeta<typeof Detail>;

export default meta;

export const Default = DefaultStory;
export const WithBottomIconButtons = { ...WithBottomIconButtonsStory, name: 'Bottom icon buttons' };
export const WithBottomChips = { ...WithBottomChipsStory, name: 'Bottom chips' };
export const WithFullScreenImage = { ...WithFullScreenImageStory, name: 'Full screen image' };
export const WithMediaToolbarHandlers = { ...WithMediaToolbarHandlersStory, name: 'Media toolbar handlers' };
export const WithCustomSlots = { ...WithCustomSlotsStory, name: 'Custom slots' };
export const WithCustomMediaSlot = { ...WithCustomMediaSlotStory, name: 'Custom slots — media' };
export const WithLongUrl = { ...WithLongUrlStory, name: 'Long URL' };
export const EmptyState = { ...EmptyStateStory, name: 'Empty state' };
export const EmptyStateCustomLabels = { ...EmptyStateCustomLabelsStory, name: 'Empty state — custom labels' };
