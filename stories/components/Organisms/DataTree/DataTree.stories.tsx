import type { Meta } from '@storybook/react-vite';
import { DataTree } from '../../../../src/index.js';
import { Default } from './stories/Default.js';
import { WithSearch } from './stories/WithSearch.js';
import { WithDragAndDrop } from './stories/WithDragAndDrop.js';
import { WithDropIn } from './stories/WithDropIn.js';
import { WithDynamicLoading } from './stories/WithDynamicLoading.js';
import { ControlledSelection } from './stories/ControlledSelection.js';
import { WithPersistence } from './stories/WithPersistence.js';
import { WithExternalQueryClient } from './stories/WithExternalQueryClient.js';
import defaultArgs from './common/defaultArgs.js';
import DataTreeMdx from './DataTree.mdx';

const meta: Meta<typeof DataTree> = {
    component: DataTree,
    parameters: {
        docs: {
            page: DataTreeMdx,
        },
        layout: 'fullscreen',
    },
    args: {
        ...defaultArgs,
    },
    argTypes: {
        sx: {
            control: 'object',
            description: 'MUI System properties.',
            table: { category: 'customization', type: { summary: 'SxProps<Theme>' }, defaultValue: { summary: '{}' } },
        },
        className: { control: 'text', description: 'CSS class name.', table: { category: 'customization' } },
        dataTestIdSuffix: { control: 'text', description: 'Suffix for data-testid.', table: { category: 'testing' } },
        items: { control: 'object', description: 'Tree items to display.', table: { category: 'content' } },
        columns: {
            control: 'object',
            description: 'Column definitions with name, width, and header.',
            table: { category: 'content' },
        },
        showColumnHeaders: {
            control: 'boolean',
            description: 'Show column headers row.',
            table: { category: 'appearance', defaultValue: { summary: 'false' } },
        },
        itemsLabelColumnHeader: {
            control: 'text',
            description: 'Header text for the label column.',
            table: { category: 'content', defaultValue: { summary: "''" } },
        },
        withSearch: {
            control: 'boolean',
            description: 'Show search box.',
            table: { category: 'behavior', defaultValue: { summary: 'false' } },
        },
        searchDebounceTime: {
            control: 'number',
            description: 'Search debounce time (ms).',
            table: { category: 'behavior', defaultValue: { summary: '500' } },
        },
        searchPlaceholder: { control: 'text', description: 'Search placeholder text.', table: { category: 'content' } },
        selectedItems: {
            control: 'object',
            description: 'Controlled selected item IDs.',
            table: { category: 'state' },
        },
        onSelectedItemsChange: {
            control: false,
            description: 'Selection change callback.',
            table: { category: 'callbacks' },
        },
        onExpand: { control: false, description: 'Expand/collapse callback.', table: { category: 'callbacks' } },
        onClickRow: { control: false, description: 'Row click callback.', table: { category: 'callbacks' } },
        onCheckboxChange: {
            control: false,
            description: 'Checkbox change callback.',
            table: { category: 'callbacks' },
        },
        onDragAndDropEnd: {
            control: false,
            description: 'Drag-and-drop end callback.',
            table: { category: 'callbacks' },
        },
        onDropIn: { control: false, description: 'Drop-in callback.', table: { category: 'callbacks' } },
        dragAndDropTooltipTitle: {
            control: 'text',
            description: 'Tooltip for expanded items during drag.',
            table: { category: 'content' },
        },
        dragAndDropTooltipPlacement: {
            control: 'select',
            options: ['top', 'bottom', 'left', 'right'],
            description: 'Tooltip placement.',
            table: { category: 'appearance', defaultValue: { summary: "'top'" } },
        },
        persistence: {
            control: 'object',
            description:
                'Enable localStorage persistence. Provide `cacheKey` to cache dynamic items, `restoreExpandedItems` to restore expanded state, and `restoreSelectedItem` to restore the last selected item.',
            table: {
                category: 'behavior',
                type: {
                    summary: '{ cacheKey: string; restoreExpandedItems?: boolean; restoreSelectedItem?: boolean }',
                },
            },
        },
        queryClient: {
            control: false,
            description: 'Optional app `QueryClient` so tree queries use your cache / DevTools.',
            table: { category: 'behavior', type: { summary: 'QueryClient' } },
        },
    },
};

export default meta;
export {
    Default,
    WithSearch,
    WithDragAndDrop,
    WithDropIn,
    WithDynamicLoading,
    ControlledSelection,
    WithPersistence,
    WithExternalQueryClient,
};
