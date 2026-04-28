import type { Meta } from '@storybook/react-vite';
import { MediaCard } from '../../../../src/index.js';
import { Default } from './stories/Default.js';
import { AspectRatio } from './stories/AspectRatio.js';
import { Placeholder } from './stories/Placeholder.js';
import { Actions } from './stories/Actions.js';
import { StatusLabels } from './stories/StatusLabels.js';
import { Hoverable } from './stories/Hoverable.js';
import { Checkbox } from './stories/Checkbox.js';
import { Slots } from './stories/Slots.js';
import { AdvancedExample } from './stories/AdvancedExample.js';
import defaultArgs from './common/defaultArgs.js';
import MediaCardMdx from './MediaCard.mdx';

const meta: Meta<typeof MediaCard> = {
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
            description: 'Overridable component slots.',
            table: {
                category: 'customization',
                type: { summary: '{ mediaCard: ReactNode; footer?: ReactNode }' },
            },
        },
        slotProps: {
            control: 'object',
            description: 'Props applied to the slots inside the component.',
            table: {
                category: 'customization',
                type: {
                    summary:
                        '{ cardMedia?: CardMediaProps; checkbox?: CheckboxProps & {showOnHover?: boolean}; footer?: CardActionsProps }',
                },
            },
        },
    },
};

export default meta;

export { Default, AspectRatio, Placeholder, Actions, StatusLabels, Hoverable, Checkbox, Slots, AdvancedExample };
