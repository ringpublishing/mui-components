import type { Meta } from '@storybook/react-vite';
import { TreeView } from '../../../../src/components/Organisms/TreeView/TreeView.js';
import { CompactViewVariant } from './stories/CompactViewVariant.js';
import { ControlledSelection } from './stories/ControlledSelection.js';
import { Default } from './stories/Default.js';
import { WithDragAndDrop } from './stories/WithDragAndDrop.js';
import { WithDropIn } from './stories/WithDropIn.js';
import { WithDynamicLoading } from './stories/WithDynamicLoading.js';
import { WithSearch } from './stories/WithSearch.js';
import TreeViewMdx from './TreeView.mdx';

/**
 * @deprecated Use `SimpleTree` (compact) or `DataTree` (default) instead.
 */
const meta: Meta<typeof TreeView> = {
    component: TreeView,
    // eslint-disable-next-line storybook/no-title-property-in-meta
    title: 'Organisms/TreeView (Deprecated)',
    parameters: {
        docs: {
            page: TreeViewMdx,
        },
        componentSubtitle: 'Deprecated — prefer `SimpleTree` or `DataTree`.',
        layout: 'fullscreen',
    },
    argTypes: {
        variant: {
            control: 'select',
            options: ['default', 'compact'],
            description: 'Presentation variant.',
            table: { category: 'behavior', type: { summary: "'default' | 'compact'" } },
        },
        items: {
            control: 'object',
            description:
                'Tree items: itemId, label, items (children), expanded, rowActions, withCheckbox, checked, columns, loadItems, etc.',
            table: { category: 'content', type: { summary: 'TreeViewItem[]' } },
        },
        withSearch: {
            control: 'boolean',
            description: 'Show label search.',
            table: { category: 'behavior', defaultValue: { summary: 'false' }, type: { summary: 'boolean' } },
        },
        searchDebounceTime: {
            control: 'number',
            description: 'Debounce time for search input in milliseconds.',
            table: { category: 'behavior', defaultValue: { summary: '500' }, type: { summary: 'number' } },
        },
        searchPlaceholder: {
            control: 'text',
            description: 'Placeholder text for the search input.',
            table: { category: 'content', type: { summary: 'string' } },
        },
        selectedItems: {
            control: 'object',
            description: 'Controlled selected item IDs. When set, internal selection state is ignored.',
            table: { category: 'state', type: { summary: 'string[]' } },
        },
        onSelectedItemsChange: {
            control: false,
            description: 'Callback fired when selection changes. Receives array of selected item IDs.',
            table: { category: 'callbacks', type: { summary: '(itemIds: string[]) => void' } },
        },
        onExpand: {
            control: false,
            description: 'Callback fired when an item is expanded or collapsed.',
            table: { category: 'callbacks', type: { summary: '(itemId: string) => void' } },
        },
        onClickRow: {
            control: false,
            description: 'Callback fired when a row is clicked.',
            table: { category: 'callbacks', type: { summary: '(itemId: string) => void' } },
        },
        columns: {
            control: 'object',
            description: 'Default variant: column definitions (name, width, header).',
            table: { category: 'content', type: { summary: 'TreeViewColumn[]' } },
        },
        showColumnHeaders: {
            control: 'boolean',
            description: 'If true, shows column headers row. Default variant only.',
            table: { category: 'appearance', type: { summary: 'boolean' } },
        },
        itemsLabelColumnHeader: {
            control: 'text',
            description: 'Header text for the items label column.',
            table: { category: 'content', type: { summary: 'string' } },
        },
        onCheckboxChange: {
            control: false,
            description: 'Callback fired when a checkbox is toggled.',
            table: { category: 'callbacks', type: { summary: '(itemId: string, checked: boolean) => void' } },
        },
        onDragAndDropEnd: {
            control: false,
            description: 'Default variant: reorder callback.',
            table: { category: 'callbacks', type: { summary: '(sourcePos: number[], destPos: number[]) => void' } },
        },
        onDropIn: {
            control: false,
            description: 'Default variant: nest-under-target callback.',
            table: { category: 'callbacks', type: { summary: '(itemId: string, dropInItemId: string) => void' } },
        },
        dragAndDropTooltipTitle: {
            control: 'text',
            description: 'Tooltip text shown on expanded items during drag.',
            table: { category: 'content', type: { summary: 'string' } },
        },
        dragAndDropTooltipPlacement: {
            control: 'text',
            description: 'Tooltip placement for drag-and-drop hints.',
            table: {
                category: 'appearance',
                type: { summary: "PopperProps['placement']" },
                defaultValue: { summary: 'top' },
            },
        },
        dataTestIdSuffix: {
            control: 'text',
            description: 'Optional suffix for data-testid attributes.',
            table: { category: 'testing', type: { summary: 'string' } },
        },
        sx: {
            control: 'object',
            description: 'MUI System properties for custom styling.',
            table: { category: 'customization', type: { summary: 'SxProps<Theme>' } },
        },
        className: {
            control: 'text',
            description: 'CSS class name applied to the root element.',
            table: { category: 'customization', type: { summary: 'string' } },
        },
    },
};

export default meta;

export {
    Default,
    CompactViewVariant,
    WithSearch,
    WithDragAndDrop,
    WithDropIn,
    WithDynamicLoading,
    ControlledSelection,
};
