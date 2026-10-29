import type { Meta } from '@storybook/react-vite';
import { Chip } from '@mui/material';

import { Default as DefaultStory } from './stories/Default.js';
import { Variants as VariantsStory } from './stories/Variants.js';
import { Tags as TagsStory } from './stories/Tags.js';
import { Sizes as SizesStory } from './stories/Sizes.js';
import { SemanticColors as SemanticColorsStory } from './stories/SemanticColors.js';
import { States as StatesStory } from './stories/States.js';
import { Selected as SelectedStory } from './stories/Selected.js';
import { Disabled as DisabledStory } from './stories/Disabled.js';
import { Clickable as ClickableStory } from './stories/Clickable.js';
import { Deletable as DeletableStory } from './stories/Deletable.js';
import { WithIcon as WithIconStory } from './stories/WithIcon.js';
import { WithAvatar as WithAvatarStory } from './stories/WithAvatar.js';
import { WithTooltip as WithTooltipStory } from './stories/WithTooltip.js';
import { LongLabels as LongLabelsStory } from './stories/LongLabels.js';
import { StatusLabels as StatusLabelsStory } from './stories/StatusLabels.js';
import { FilterChips as FilterChipsStory } from './stories/FilterChips.js';
import defaultArgs from './common/defaultArgs.js';
import ChipMdx from './Chip.mdx';

// `Chip` is MUI's own component: the library exports no wrapper, the design system's look
// lives in the theme. This page documents that look and the API surface it gives a plain
// `<Chip>` from `@mui/material`.
const meta: Meta<typeof Chip> = {
    component: Chip,
    parameters: {
        docs: {
            page: ChipMdx,
        },
    },
    args: {
        ...defaultArgs,
    },
    argTypes: {
        label: {
            control: 'text',
            description: 'Chip content.',
            table: {
                category: 'content',
                type: { summary: 'ReactNode' },
            },
        },
        variant: {
            control: 'select',
            options: ['outlined', 'filled', 'tag'],
            description:
                'Visual variant. `outlined` and `filled` are the interactive chips; `tag` is a non-interactive label — always small, 4px corners, colours from the tag palette.',
            table: {
                category: 'appearance',
                type: { summary: "'outlined' | 'filled' | 'tag'" },
                defaultValue: { summary: 'filled' },
            },
        },
        color: {
            control: 'select',
            options: [
                'default',
                'error',
                'warning',
                'info',
                'success',
                'neutral',
                'stone',
                'sky',
                'azure',
                'lavender',
                'blush',
                'coral',
                'peach',
                'lemon',
                'sage',
                'teal',
                'ai',
            ],
            description:
                'Chip colour. The semantic four work on `filled` and `tag`; the tag colours (`neutral`, `stone` … `teal`) are defined for `tag` only.',
            table: {
                category: 'appearance',
                type: { summary: 'ChipProps["color"]' },
                defaultValue: { summary: 'default' },
            },
        },
        size: {
            control: 'select',
            options: ['small', 'medium'],
            description: 'Chip size. A `tag` is always small.',
            table: {
                category: 'appearance',
                type: { summary: "'small' | 'medium'" },
                defaultValue: { summary: 'small' },
            },
        },
        disabled: {
            control: 'boolean',
            description: 'Disables the chip.',
            table: {
                category: 'state',
                type: { summary: 'boolean' },
                defaultValue: { summary: 'false' },
            },
        },
        clickable: {
            control: 'boolean',
            description: 'Makes the chip react to hover and press without an `onClick`.',
            table: {
                category: 'behavior',
                type: { summary: 'boolean' },
            },
        },
        icon: {
            control: false,
            description: 'Leading icon element. Sized by the theme: 20px in `medium`, 16px in `small` and `tag`.',
            table: {
                category: 'content',
                type: { summary: 'ReactElement' },
            },
        },
        avatar: {
            control: false,
            description: 'Leading `Avatar` element: 24px in `medium`, 18px in `small`.',
            table: {
                category: 'content',
                type: { summary: 'ReactElement' },
            },
        },
        deleteIcon: {
            control: false,
            description:
                'Delete glyph. Defaults to lucide `X`, set by the theme; any element passed here replaces it and takes the slot box, 16px / 20px, whatever size it carries.',
            table: {
                category: 'content',
                type: { summary: 'ReactElement' },
            },
        },
        onClick: {
            control: false,
            description: 'Click handler; also marks the chip as clickable.',
            table: {
                category: 'callbacks',
                type: { summary: '(event: React.MouseEvent) => void' },
            },
        },
        onDelete: {
            control: false,
            description: 'Delete handler; renders the delete glyph.',
            table: {
                category: 'callbacks',
                type: { summary: '(event: unknown) => void' },
            },
        },
        sx: {
            control: 'object',
            description: 'MUI sx prop for custom styling.',
            table: {
                category: 'customization',
                type: { summary: 'SxProps<Theme>' },
            },
        },
        className: {
            control: 'text',
            description:
                'CSS class name applied to the root. `Mui-selected` switches the selected state on (pair it with `aria-pressed`).',
            table: {
                category: 'customization',
                type: { summary: 'string' },
            },
        },
    },
};

export default meta;

export const Default = DefaultStory;
export const Variants = VariantsStory;
export const Tags = TagsStory;
export const Sizes = SizesStory;
export const SemanticColors = { ...SemanticColorsStory, name: 'Semantic colours' };
export const States = StatesStory;
export const Selected = SelectedStory;
export const Disabled = DisabledStory;
export const Clickable = ClickableStory;
export const Deletable = DeletableStory;
export const WithIcon = { ...WithIconStory, name: 'Icon' };
export const WithAvatar = { ...WithAvatarStory, name: 'Avatar' };
export const WithTooltip = { ...WithTooltipStory, name: 'Tooltip' };
export const LongLabels = { ...LongLabelsStory, name: 'Long labels' };
export const StatusLabels = { ...StatusLabelsStory, name: 'Status labels' };
export const FilterChips = { ...FilterChipsStory, name: 'Filter chips' };
