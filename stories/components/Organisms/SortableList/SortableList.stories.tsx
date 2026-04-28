import type { Meta } from '@storybook/react-vite';
import { SortableList } from '../../../../src/index.js';
import { Default } from './stories/Default.js';
import { WithDragHandle } from './stories/WithDragHandle.js';
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
                category: 'data',
                type: { summary: 'T[]' },
            },
        },
        renderItem: {
            control: false,
            description: 'Function that renders an element of the list.',
            table: {
                category: 'rendering',
                type: { summary: '(item: T) => React.ReactNode' },
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
        grabByDragHandle: {
            control: 'boolean',
            description:
                'If true, items can be grabbed only by the drag handles. ' +
                "Developers need to incorporate `SortableList.DragHandle` component in their item's children. " +
                '**Warning:** Setting this to `true` without rendering `<SortableList.DragHandle />` inside items will make the list un-draggable.',
            table: {
                category: 'behavior',
                defaultValue: { summary: 'false' },
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
            },
        },
        dataTestIdSuffix: {
            control: false,
            description: 'Inherited from CommonComponentProps. Not yet implemented in SortableList.',
            table: {
                category: 'customization',
                type: { summary: 'string' },
            },
        },
    },
};

export default meta;

export { Default, WithDragHandle };
