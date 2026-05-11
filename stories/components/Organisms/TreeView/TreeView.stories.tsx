import type { Meta } from '@storybook/react-vite';
import { TreeView } from '../../../../src/components/Organisms/TreeView/TreeView.js';
import { Default } from './stories/Default.js';
import { CompactViewVariant } from './stories/CompactViewVariant.js';
import { WithSearch } from './stories/WithSearch.js';
import { WithDragAndDrop } from './stories/WithDragAndDrop.js';
import { WithDropIn } from './stories/WithDropIn.js';
import { WithDynamicLoading } from './stories/WithDynamicLoading.js';
import { ControlledSelection } from './stories/ControlledSelection.js';
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
            table: { category: 'behavior' },
        },
        items: {
            control: 'object',
            description:
                'Tree items: itemId, label, items (children), expanded, rowActions, withCheckbox, checked, columns, loadItems, etc.',
            table: { category: 'content' },
        },
        withSearch: {
            control: 'boolean',
            description: 'Show label search.',
            table: { category: 'behavior', defaultValue: { summary: 'false' } },
        },
        searchDebounceTime: {
            control: 'number',
            table: { category: 'behavior', defaultValue: { summary: '500' } },
        },
        searchPlaceholder: { control: 'text', table: { category: 'content' } },
        selectedItems: { control: 'object', table: { category: 'state' } },
        onSelectedItemsChange: { control: false, table: { category: 'callbacks' } },
        onExpand: { control: false, table: { category: 'callbacks' } },
        onClickRow: { control: false, table: { category: 'callbacks' } },
        columns: {
            control: 'object',
            description: 'Default variant: column definitions (name, width, header).',
            table: { category: 'content' },
        },
        showColumnHeaders: { control: 'boolean', table: { category: 'appearance' } },
        itemsLabelColumnHeader: { control: 'text', table: { category: 'content' } },
        onCheckboxChange: { control: false, table: { category: 'callbacks' } },
        onDragAndDropEnd: {
            control: false,
            description: 'Default variant: reorder callback.',
            table: { category: 'callbacks' },
        },
        onDropIn: {
            control: false,
            description: 'Default variant: nest-under-target callback.',
            table: { category: 'callbacks' },
        },
        dragAndDropTooltipTitle: { control: 'text', table: { category: 'content' } },
        dragAndDropTooltipPlacement: { control: 'text', table: { category: 'appearance' } },
        dataTestIdSuffix: { control: 'text', table: { category: 'testing' } },
        sx: { control: 'object', table: { category: 'customization' } },
        className: { control: 'text', table: { category: 'customization' } },
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
