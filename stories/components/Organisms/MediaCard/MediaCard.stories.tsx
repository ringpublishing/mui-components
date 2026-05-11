import type { LooseArgTypesMeta } from '../../../helpers.js';
import { MediaCard } from '../../../../src/index.js';
import { Default } from './stories/Default.js';
import { AspectRatio } from './stories/AspectRatio.js';
import { Placeholder } from './stories/Placeholder.js';
import { Actions } from './stories/Actions.js';
import { StatusLabels } from './stories/StatusLabels.js';
import { Hoverable } from './stories/Hoverable.js';
import { Checkbox } from './stories/Checkbox.js';
import { Slots } from './stories/Slots.js';
import { CardEvents } from './stories/CardEvents.js';
import { AdvancedExample } from './stories/AdvancedExample.js';
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
            description: 'URL of the image. When not provided, an empty image placeholder is displayed.',
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
            description: 'Icon for the placeholder.',
            table: {
                category: 'content',
                type: { summary: 'ReactNode' },
                defaultValue: { summary: '<PhotoOutlined />' },
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
        statusLabels: {
            control: 'object',
            description: 'Collection of status labels displayed over the image in the left top corner.',
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
                defaultValue: { summary: 'cover' },
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
                'Props applied to the default `<CardMedia>`. Used only when `slots.mediaCard` is **not** provided. Lets you switch the underlying element (`component: "video" | "audio" | "img"`), tweak `src`, etc.',
            table: {
                category: 'slotProps',
                type: { summary: 'CardMediaProps' },
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

export {
    Default,
    AspectRatio,
    Placeholder,
    Actions,
    StatusLabels,
    Hoverable,
    Checkbox,
    Slots,
    CardEvents,
    AdvancedExample,
};
