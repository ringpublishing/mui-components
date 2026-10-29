import type { LooseArgTypesMeta } from '../../../helpers.js';
import { MediaCard } from '../../../../src/index.js';
import { Default as DefaultStory } from './stories/Default.js';
import { AspectRatio as AspectRatioStory } from './stories/AspectRatio.js';
import { StatusLabels as StatusLabelsStory } from './stories/StatusLabels.js';
import { Hoverable as HoverableStory } from './stories/Hoverable.js';
import { Checkbox as CheckboxStory } from './stories/Checkbox.js';
import { Actions as ActionsStory } from './stories/Actions.js';
import { CustomTooltips as CustomTooltipsStory } from './stories/CustomTooltips.js';
import { CardEvents as CardEventsStory } from './stories/CardEvents.js';
import { Slots as SlotsStory } from './stories/Slots.js';
import { Placeholder as PlaceholderStory } from './stories/Placeholder.js';
import { ImageLoadError as ImageLoadErrorStory } from './stories/ImageLoadError.js';
import { AdvancedExample as AdvancedExampleStory } from './stories/AdvancedExample.js';
import defaultArgs from './common/defaultArgs.js';
import MediaCardMdx from './MediaCard.mdx';

const meta = {
    component: MediaCard,
    parameters: {
        docs: {
            page: MediaCardMdx,
        },
    },
    args: {
        ...defaultArgs,
    },
    argTypes: {
        // content
        title: {
            control: 'text',
            description: 'Title for the resource card.',
            table: {
                category: 'content',
                type: { summary: 'string' },
            },
        },
        image: {
            control: 'text',
            description: 'URL of the image. Without it the frame shows `iconPlaceholder` on a `FeaturedIcon` plate.',
            table: {
                category: 'content',
                type: { summary: 'string' },
            },
        },
        fields: {
            control: 'object',
            description: 'Fields describing the card.',
            table: {
                category: 'content',
                type: { summary: 'MediaCardFieldsItem[]' },
            },
        },
        iconPlaceholder: {
            control: 'text',
            description:
                'Glyph on a `FeaturedIcon` plate sized from the frame; `null` or `false` leaves the frame empty. A failed image shows `ImageOff`.',
            table: {
                category: 'content',
                type: { summary: 'ReactNode' },
                defaultValue: { summary: '<Image />' },
            },
        },
        actions: {
            control: 'object',
            description: 'Actions list shown in Action Box.',
            table: {
                category: 'content',
                type: { summary: 'Action[]' },
            },
        },
        actionsAriaLabel: {
            control: 'text',
            description:
                'Accessible name of the icon button that opens the `actions` menu; a blank value falls back to the default.',
            table: { category: 'content', defaultValue: { summary: "'More actions'" }, type: { summary: 'string' } },
        },
        statusLabels: {
            control: 'object',
            description:
                'Status labels over the top-left corner of the image, rendered as tag chips; `default`, `primary` and `secondary` become the grey `stone` tag.',
            table: {
                category: 'content',
                type: { summary: 'StatusLabelProps[]' },
            },
        },

        // appearance
        variant: {
            control: 'select',
            options: ['outlined', 'elevation'],
            description: 'The variant to use.',
            table: {
                category: 'appearance',
                type: { summary: "'outlined' | 'elevation'" },
                defaultValue: { summary: 'outlined' },
            },
        },
        square: {
            control: 'boolean',
            description: 'If true, rounded corners are disabled.',
            table: {
                category: 'appearance',
                type: { summary: 'boolean' },
                defaultValue: { summary: 'false' },
            },
        },
        ratio: {
            control: 'text',
            description: 'Aspect ratio of the image (e.g., "16/9", "4/3", "1/1").',
            table: {
                category: 'appearance',
                type: { summary: 'string | number' },
                defaultValue: { summary: '4/3' },
            },
        },
        objectFit: {
            control: 'select',
            options: ['contain', 'cover', 'fill', 'none', 'scale-down'],
            description: 'How the image should fit.',
            table: {
                category: 'appearance',
                type: { summary: "'contain' | 'cover' | 'fill' | 'none' | 'scale-down'" },
                defaultValue: { summary: 'contain' },
            },
        },

        // state
        hoverable: {
            control: 'boolean',
            description: 'Specifies whether the component is hoverable.',
            table: {
                category: 'state',
                type: { summary: 'boolean' },
                defaultValue: { summary: 'false' },
            },
        },
        active: {
            control: 'boolean',
            description: 'Specifies whether the component is active (visually highlighted).',
            table: {
                category: 'state',
                type: { summary: 'boolean' },
                defaultValue: { summary: 'false' },
            },
        },

        // callbacks
        onClick: {
            type: 'function',
            description: 'Callback fired when the component is clicked.',
            table: {
                category: 'callbacks',
                type: { summary: '() => void' },
            },
        },

        // customization
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
            },
        },

        // slots — one row per slot, MUI-style breakdown of the `slots` object
        'slots.mediaCard': {
            name: 'slots.mediaCard',
            description:
                'Custom React node rendered in place of the default `<CardMedia>`. Wrapped in `<AspectRatio>` so `ratio` and `objectFit` still apply to the surrounding box.',
            table: {
                category: 'slots',
                type: { summary: 'ReactNode' },
            },
            control: false,
        },
        'slots.footer': {
            name: 'slots.footer',
            description: 'Optional custom footer rendered below the card content (inside `<CardActions>`).',
            table: {
                category: 'slots',
                type: { summary: 'ReactNode' },
            },
            control: false,
        },

        // slotProps — one row per slot prop, MUI-style breakdown of the `slotProps` object
        'slotProps.card': {
            name: 'slotProps.card',
            description:
                'Props applied to the root MUI `<Card>`. **Recommended channel for DOM events** (`onMouseEnter`, `onMouseLeave`, `onFocus`, `onKeyDown`, `aria-*`, `data-*`, …). Top-level MediaCardProps (`variant`, `square`, `onClick`, `tabIndex`, `className`, `sx`) take precedence and are merged on top.',
            table: {
                category: 'slotProps',
                type: {
                    summary:
                        'Omit<CardProps, "children" | "variant" | "square" | "onClick" | "tabIndex" | "elevation">',
                },
            },
            control: false,
        },
        'slotProps.cardMedia': {
            name: 'slotProps.cardMedia',
            description:
                'Props applied to the default `<img>`. Used only when `slots.mediaCard` is **not** provided. `component` is fixed; setting this slot skips the skeleton and the placeholder.',
            table: {
                category: 'slotProps',
                type: { summary: "Omit<CardMediaProps<'img'>, 'component'>" },
            },
            control: false,
        },
        'slotProps.checkbox': {
            name: 'slotProps.checkbox',
            description:
                'Props applied to the selection `<Checkbox>`. The custom `showOnHover` flag hides the checkbox until the card is hovered (useful for grids). When `undefined`, the checkbox is not rendered.',
            table: {
                category: 'slotProps',
                type: { summary: 'CheckboxProps & { showOnHover?: boolean }' },
            },
            control: false,
        },
        'slotProps.footer': {
            name: 'slotProps.footer',
            description:
                'Props applied to the `<CardActions>` element wrapping `slots.footer` (e.g. `sx`, `disableSpacing`).',
            table: {
                category: 'slotProps',
                type: { summary: 'CardActionsProps' },
            },
            control: false,
        },
    },
} satisfies LooseArgTypesMeta<typeof MediaCard>;

export default meta;

export const Default = DefaultStory;
export const AspectRatio = { ...AspectRatioStory, name: 'Aspect ratio' };
export const StatusLabels = { ...StatusLabelsStory, name: 'Status labels' };
export const Hoverable = HoverableStory;
export const Checkbox = CheckboxStory;
export const Actions = ActionsStory;
export const CustomTooltips = { ...CustomTooltipsStory, name: 'Custom tooltips' };
export const CardEvents = { ...CardEventsStory, name: 'Card events' };
export const Slots = SlotsStory;
export const Placeholder = PlaceholderStory;
export const ImageLoadError = { ...ImageLoadErrorStory, name: 'Image load error' };
export const AdvancedExample = { ...AdvancedExampleStory, name: 'Combined features' };
