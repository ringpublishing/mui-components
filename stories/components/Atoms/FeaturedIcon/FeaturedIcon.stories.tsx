import type { Meta } from '@storybook/react-vite';

import { FeaturedIcon } from '../../../../src/index.js';
import { Default as DefaultStory } from './stories/Default.js';
import { Sizes as SizesStory } from './stories/Sizes.js';
import { Colors as ColorsStory } from './stories/Colors.js';
import { SizedByItsBox as SizedByItsBoxStory } from './stories/SizedByItsBox.js';
import { EmptyState as EmptyStateStory } from './stories/EmptyState.js';
import defaultArgs from './common/defaultArgs.js';
import FeaturedIconMdx from './FeaturedIcon.mdx';

const meta: Meta<typeof FeaturedIcon> = {
    component: FeaturedIcon,
    tags: ['new@2.0'],
    parameters: {
        docs: {
            page: FeaturedIconMdx,
        },
    },
    args: {
        ...defaultArgs,
    },
    argTypes: {
        icon: {
            control: false,
            description: 'The glyph: a lucide icon, or a ready element such as an MUI icon. The component sizes it.',
            table: { category: 'content', type: { summary: 'LucideIcon | ReactElement' } },
        },
        size: {
            control: 'select',
            options: ['small', 'medium', 'large', 'inherit'],
            description:
                'Fixed plates of 40, 60 and 80 px for an icon that is a part of a layout; `inherit` fills the parent and takes half of its shorter side, 40–120 px.',
            table: {
                category: 'appearance',
                type: { summary: "'small' | 'medium' | 'large' | 'inherit'" },
                defaultValue: { summary: "'medium'" },
            },
        },
        color: {
            control: 'select',
            options: ['default', 'primary', 'info', 'success', 'warning', 'error'],
            description: 'Colour of the plate and the glyph.',
            table: {
                category: 'appearance',
                type: { summary: "'default' | 'primary' | 'info' | 'success' | 'warning' | 'error'" },
                defaultValue: { summary: "'default'" },
            },
        },
        slotProps: {
            control: false,
            description: '`plate.sx` styles the circle, e.g. with the state colours of the area it stands in.',
            table: { category: 'customization', type: { summary: '{ plate?: { sx?: SxProps<Theme> } }' } },
        },
        sx: {
            control: false,
            description: 'Styles of the root element.',
            table: { category: 'customization', type: { summary: 'SxProps<Theme>' } },
        },
        className: {
            control: 'text',
            description: 'Class names of the root element, next to `ring-featuredicon`.',
            table: { category: 'customization', type: { summary: 'string' } },
        },
        dataTestIdSuffix: {
            control: 'text',
            description: 'Appended to the generated `ring-featuredicon` test id.',
            table: { category: 'testing', type: { summary: 'string' } },
        },
        dataTestId: {
            control: 'text',
            description: 'Replaces the generated `ring-featuredicon` test id verbatim.',
            table: { category: 'testing', type: { summary: 'string' } },
        },
        'data-testid': {
            control: 'text',
            description: 'Same as `dataTestId`.',
            table: { category: 'testing', type: { summary: 'string' } },
        },
    },
};

export default meta;

export const Default = DefaultStory;
export const Sizes = SizesStory;
export const Colors = { ...ColorsStory, name: 'Colours' };
export const SizedByItsBox = { ...SizedByItsBoxStory, name: 'Sized by its box' };
export const EmptyState = { ...EmptyStateStory, name: 'Empty state' };
