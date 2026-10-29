import type { Meta } from '@storybook/react-vite';
import { SortableList } from '../../../../src/index.js';
import { Default as DefaultStory } from './stories/Default.js';
import { Horizontal as HorizontalStory } from './stories/Horizontal.js';
import { Wrap as WrapStory } from './stories/Wrap.js';
import { WithDragHandle as WithDragHandleStory } from './stories/WithDragHandle.js';
import defaultArgs from './common/defaultArgs.js';
import SortableListMDX from './SortableList.mdx';

const meta: Meta<typeof SortableList> = {
    component: SortableList,
    parameters: {
        docs: {
            page: SortableListMDX,
        },
    },
    args: {
        ...defaultArgs,
    },
    argTypes: {
        items: {
            control: 'object',
            description: 'List of items to be sorted. Each item must have a unique `id` field.',
            table: {
                category: 'content',
                type: { summary: 'T[]' },
            },
        },
        renderItem: {
            control: false,
            description: 'Function that renders an element of the list.',
            table: {
                category: 'content',
                type: { summary: '(item: T, index?: number, isDragActive?: boolean) => React.ReactNode' },
            },
        },
        onChange: {
            control: false,
            description: 'Callback called when the order of items changes. Receives the reordered list.',
            table: {
                category: 'callbacks',
                type: { summary: '(items: T[]) => void' },
            },
        },
        orientation: {
            control: 'radio',
            options: ['vertical', 'horizontal', 'wrap'],
            description:
                'Layout and drag axis of the list. `vertical` stacks items in a column, `horizontal` lays them out in a single row, ' +
                '`wrap` lays items out as a wrapping row and lets the user drag them ' +
                'freely in two dimensions within the rectangle. The `wrap` mode is pointer-only and ignores `grabByDragHandle`.',
            table: {
                category: 'behavior',
                type: { summary: "'vertical' | 'horizontal' | 'wrap'" },
                defaultValue: { summary: "'vertical'" },
            },
        },
        grabByDragHandle: {
            control: 'boolean',
            description:
                'If true, items can be grabbed only by the drag handles. ' +
                "Developers need to incorporate `SortableList.DragHandle` component in their item's children. " +
                '**Warning:** Setting this to `true` without rendering `<SortableList.DragHandle />` inside items will make the list un-draggable.',
            table: {
                category: 'behavior',
                type: { summary: 'boolean' },
                defaultValue: { summary: 'false' },
            },
        },
        labels: {
            control: false,
            description:
                'User-facing strings the list renders itself. `dragHandle` is the accessible name of ' +
                '`SortableList.DragHandle` — it is an icon-only button, so a screen reader announces nothing but ' +
                '"button" without it. Every member is optional and falls back to the English default.',
            table: {
                category: 'content',
                type: { summary: '{ dragHandle?: string }' },
                defaultValue: { summary: "{ dragHandle: 'Drag to reorder' }" },
            },
        },
        getItemDataTestId: {
            control: false,
            description:
                'Overrides the generated `data-testid` per item. Return `undefined` to keep the default ' +
                '`ring-sortablelist[-<suffix>]-item-<id>`. Items may also carry `dataTestId` (verbatim) or ' +
                '`itemDataTestIdSuffix` fields instead.',
            table: {
                category: 'customization',
                type: { summary: '(item: T, index: number) => string | undefined' },
            },
        },
        children: {
            control: false,
            description:
                'Inherited from CommonComponentProps but not used. Item rendering is controlled via `renderItem`.',
            table: {
                category: 'content',
                type: { summary: 'React.ReactNode' },
            },
        },
        sx: {
            control: 'object',
            description: 'Styles for the flex container that lays out the items (e.g. `gap`).',
            table: {
                category: 'customization',
                type: { summary: 'SxProps<Theme>' },
            },
        },
        className: {
            control: 'text',
            description: 'CSS class on the root element.',
            table: {
                category: 'customization',
                type: { summary: 'string' },
            },
        },
        dataTestIdSuffix: {
            control: false,
            description: 'Suffix for `data-testid`: root `ring-sortablelist[-<suffix>]`, items `…-item-<id>`.',
            table: {
                category: 'testing',
                type: { summary: 'string' },
            },
        },
    },
};

export default meta;

export const Default = DefaultStory;
export const Horizontal = { ...HorizontalStory, tags: ['new@2.0'] };
export const Wrap = { ...WrapStory, tags: ['new@2.0'] };
export const WithDragHandle = { ...WithDragHandleStory, name: 'DragHandle' };
