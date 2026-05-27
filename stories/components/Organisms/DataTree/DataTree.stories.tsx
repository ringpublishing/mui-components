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
        className: {
            control: 'text',
            description: 'CSS class name.',
            table: { category: 'customization', type: { summary: 'string' } },
        },
        dataTestIdSuffix: {
            control: 'text',
            description: 'Suffix for data-testid.',
            table: { category: 'testing', type: { summary: 'string' } },
        },
        items: {
            control: 'object',
            description: 'Tree items to display.',
            table: { category: 'content', type: { summary: 'DataTreeItem[]' } },
        },
        columns: {
            control: 'object',
            description: 'Column definitions with name, width, and header.',
            table: { category: 'content', type: { summary: 'DataTreeColumn[]' } },
        },
        showColumnHeaders: {
            control: 'boolean',
            description: 'Show column headers row.',
            table: { category: 'appearance', defaultValue: { summary: 'false' }, type: { summary: 'boolean' } },
        },
        itemsLabelColumnHeader: {
            control: 'text',
            description: 'Header text for the label column.',
            table: { category: 'content', defaultValue: { summary: "''" }, type: { summary: 'string' } },
        },
        withSearch: {
            control: 'boolean',
            description: 'Show search box.',
            table: { category: 'behavior', defaultValue: { summary: 'false' }, type: { summary: 'boolean' } },
        },
        searchDebounceTime: {
            control: 'number',
            description: 'Search debounce time (ms).',
            table: { category: 'behavior', defaultValue: { summary: '500' }, type: { summary: 'number' } },
        },
        searchPlaceholder: {
            control: 'text',
            description: 'Search placeholder text.',
            table: { category: 'content', type: { summary: 'string' } },
        },
        selectedItems: {
            control: 'object',
            description: 'Controlled selected item IDs.',
            table: { category: 'state', type: { summary: 'string[]' } },
        },
        onSelectedItemsChange: {
            control: false,
            description: 'Selection change callback.',
            table: { category: 'callbacks', type: { summary: '(itemIds: string[]) => void' } },
        },
        onExpand: {
            control: false,
            description: 'Expand/collapse callback.',
            table: { category: 'callbacks', type: { summary: '(itemId: string) => void' } },
        },
        onClickRow: {
            control: false,
            description: 'Row click callback.',
            table: { category: 'callbacks', type: { summary: '(itemId: string) => void' } },
        },
        onCheckboxChange: {
            control: false,
            description: 'Checkbox change callback.',
            table: { category: 'callbacks', type: { summary: '(itemId: string, checked: boolean) => void' } },
        },
        onDragAndDropEnd: {
            control: false,
            description: 'Drag-and-drop end callback.',
            table: { category: 'callbacks', type: { summary: '(sourcePos: number[], destPos: number[]) => void' } },
        },
        onDropIn: {
            control: false,
            description: 'Drop-in callback.',
            table: { category: 'callbacks', type: { summary: '(itemId: string, dropInItemId: string) => void' } },
        },
        dragAndDropTooltipTitle: {
            control: 'text',
            description: 'Tooltip for expanded items during drag.',
            table: { category: 'content', type: { summary: 'string' } },
        },
        dragAndDropTooltipPlacement: {
            control: 'select',
            options: ['top', 'bottom', 'left', 'right'],
            description: 'Tooltip placement.',
            table: {
                category: 'appearance',
                defaultValue: { summary: "'top'" },
                type: { summary: "PopperProps['placement']" },
            },
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
