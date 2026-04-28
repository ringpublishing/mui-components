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

const meta: Meta<typeof TreeView> = {
    component: TreeView,
    parameters: {
        docs: {
            page: TreeViewMdx,
        },
    },
    argTypes: {
        variant: {
            control: 'radio',
            options: ['default', 'compact'],
            description: 'The visual variant of the TreeView.',
            table: {
                category: 'appearance',
                type: { summary: "'default' | 'compact'" },
                defaultValue: { summary: "'default'" },
            },
        },
        items: {
            control: 'object',
            description:
                'Tree items to be displayed. Their attributes contain itemId, label, items (children), expanded, rowActions, withCheckbox, checked, checkboxDisabled and values for columns.',
            table: {
                category: 'content',
                type: {
                    summary: 'TreeViewItem[]',
                    detail: '{ itemId: string; label: string; items?: TreeViewItem[]; expanded?: boolean; rowActions?: Action[]; withCheckbox?: boolean; checked?: boolean; checkboxDisabled?: boolean; element?: React.JSX.Element; loadItems?: (item: TreeViewItem) => Promise<TreeViewItem[]> | TreeViewItem[]; [columnName: string]: any }[]',
                },
            },
        },
        onExpand: {
            description: 'Callback fired when the item is expanded or collapsed.',
            table: {
                category: 'callbacks',
                type: { summary: '(itemId: string) => void' },
            },
        },
        onClickRow: {
            description: 'Callback fired when the row is clicked.',
            table: {
                category: 'callbacks',
                type: { summary: '(itemId: string) => void' },
            },
        },
        withSearch: {
            control: 'boolean',
            description: 'If true, the search box will be shown and user will be able to filter by item labels.',
            table: {
                category: 'behavior',
                type: { summary: 'boolean' },
                defaultValue: { summary: 'false' },
            },
        },
        searchDebounceTime: {
            control: 'number',
            description: 'Debounce time for the search box in milliseconds.',
            table: {
                category: 'behavior',
                type: { summary: 'number' },
                defaultValue: { summary: '500' },
            },
        },
        searchPlaceholder: {
            control: 'text',
            description:
                'Placeholder for the search input. When `withSearch` is true, this will be used as the placeholder text.',
            table: {
                category: 'content',
                type: { summary: 'string' },
            },
        },
        selectedItems: {
            control: 'object',
            description:
                'If specified, this prop controls the selected items. If not provided, the component will manage selection state internally.',
            table: {
                category: 'state',
                type: { summary: 'string[]' },
            },
        },
        onSelectedItemsChange: {
            description: 'Callback fired when the selection changes.',
            table: {
                category: 'callbacks',
                type: { summary: '(itemIds: string[]) => void' },
            },
        },
        columns: {
            control: 'object',
            description:
                'Columns definition for the default variant. Each column should have a name (matching item attributes), width, and header.',
            table: {
                category: 'content',
                type: {
                    summary: 'Column[]',
                    detail: '{ name: string; width: number; header: string; }[]',
                },
            },
        },
        showColumnHeaders: {
            control: 'boolean',
            description: 'If true, column headers will be displayed. Only applicable to the default variant.',
            table: {
                category: 'appearance',
                type: { summary: 'boolean' },
                defaultValue: { summary: 'false' },
            },
        },
        itemsLabelColumnHeader: {
            control: 'text',
            description: 'The label for the item label column header. Only applicable to the default variant.',
            table: {
                category: 'content',
                type: { summary: 'string' },
                defaultValue: { summary: "''" },
            },
        },
        onCheckboxChange: {
            description:
                'Callback fired when the checkbox is checked or unchecked. Only applicable to the default variant.',
            table: {
                category: 'callbacks',
                type: { summary: '(itemId: string, checked: boolean) => void' },
            },
        },
        onDragAndDropEnd: {
            description:
                'Callback fired when drag and drop is finished. If not provided, drag and drop will not be enabled. Only applicable to the default variant.',
            table: {
                category: 'callbacks',
                type: { summary: '(sourceAbsolutePosition: number[], destinationAbsolutePosition: number[]) => void' },
            },
        },
        onDropIn: {
            description:
                'Callback fired when an item is dropped into another item. If not provided, drop-in will not be available. Only applicable to the default variant.',
            table: {
                category: 'callbacks',
                type: { summary: '(itemId: string, dropInItemId: string) => void' },
            },
        },
        dragAndDropTooltipTitle: {
            control: 'text',
            description:
                'Title for tooltip shown when user hovers over an item with expanded children and drag and drop is enabled.',
            table: {
                category: 'content',
                type: { summary: 'string' },
            },
        },
        dragAndDropTooltipPlacement: {
            control: 'text',
            description: 'Placement of the drag and drop tooltip.',
            table: {
                category: 'appearance',
                type: { summary: "PopperProps['placement']" },
                defaultValue: { summary: "'top'" },
            },
        },
        dataTestIdSuffix: {
            control: 'text',
            description: 'Suffix appended to the data-testid attribute.',
            table: {
                category: 'testing',
                type: { summary: 'string' },
            },
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
