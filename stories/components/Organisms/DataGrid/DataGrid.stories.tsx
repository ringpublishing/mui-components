import type { Meta } from '@storybook/react-vite';
import { RingDataGrid as RingDataGridComponent } from '../../../../src/index.js';
import defaultArgs from './common/defaultArgs.js';

import { CustomCells } from './stories/CustomCells.js';
import { CustomToolbar } from './stories/CustomToolbar.js';
import { BulkActions } from './stories/BulkActions.js';
import { NoResults } from './stories/NoResults.js';
import { NoResultsCustomLabels } from './stories/NoResultsCustomLabels.js';
import { Error } from './stories/Error.js';
import { ErrorCustomLabels } from './stories/ErrorCustomLabels.js';
import { AutoRefreshActive } from './stories/AutoRefreshActive.js';
import { AutoRefreshIgnoreInteraction } from './stories/AutoRefreshIgnoreInteraction.js';
import { AutoRefreshInitiallyDisabled } from './stories/AutoRefreshInitiallyDisabled.js';
import { AutoRefreshDisabled } from './stories/AutoRefreshDisabled.js';
import { ClassicSelection } from './stories/ClassicSelection.js';

import RingDataGridMdx from './DataGrid.mdx';

const meta: Meta<typeof RingDataGridComponent> = {
    component: RingDataGridComponent,
    parameters: {
        docs: {
            page: RingDataGridMdx,
        },
    },
    args: {
        ...defaultArgs,
    },
    argTypes: {
        showRingToolbar: {
            control: 'boolean',
            type: 'boolean',
            description: 'Displays the custom Ring toolbar with sorting, refresh and bulk actions controls.',
            table: {
                defaultValue: { summary: 'false' },
                category: 'toolbar',
            },
        },
        labels: {
            control: 'object',
            description: 'Labels used within the toolbar component.',
            table: {
                type: {
                    summary:
                        '{ results: string; refresh?: string; enableAutoRefresh?: string; disableAutoRefresh?: string; selectAll?: string; deselectAll?: string }',
                },
                category: 'toolbar',
            },
        },
        sortableFields: {
            control: 'object',
            description: 'Fields available for sorting in the toolbar dropdown.',
            table: {
                type: { summary: '{ name: string; key: string; onSortingChange: (key: string) => void }[]' },
                category: 'toolbar',
            },
        },
        sortField: {
            control: 'text',
            description: 'Key of the currently sorted field. Overrides the internally held value.',
            table: {
                category: 'toolbar',
            },
        },
        additionalComponent: {
            description: 'Additional component rendered in the toolbar (right side, after the refresh icon).',
            table: {
                type: { summary: 'React.ReactNode' },
                category: 'toolbar',
            },
        },
        totalRowCount: {
            control: 'number',
            type: 'number',
            description: 'Total row count displayed in the toolbar.',
            table: {
                category: 'toolbar',
            },
        },
        filterChips: {
            control: 'object',
            description: 'Filter chips displayed above the data grid.',
            table: {
                type: {
                    summary:
                        '{ chips: { filter: string; value: string; onDelete: () => void }[]; onDeleteAll?: () => void }',
                },
                category: 'toolbar',
            },
        },
        autoRefresh: {
            control: 'boolean',
            type: 'boolean',
            description: 'Enables the auto-refresh functionality.',
            table: {
                defaultValue: { summary: 'false' },
                category: 'auto refresh',
            },
        },
        refreshRate: {
            control: 'number',
            type: 'number',
            description: 'Auto-refresh interval in milliseconds.',
            table: {
                defaultValue: { summary: '60000' },
                category: 'auto refresh',
            },
        },
        refreshItems: {
            type: 'function',
            description: 'Function called on refresh icon click and during auto-refresh.',
            table: {
                type: { summary: '() => void' },
                category: 'auto refresh',
            },
        },
        refreshCallback: {
            type: 'function',
            description: 'Callback fired when the refresh icon is clicked (e.g. for analytics).',
            table: {
                type: { summary: '() => void' },
                category: 'auto refresh',
            },
        },
        autoRefreshCallback: {
            type: 'function',
            description: 'Callback fired when the auto-refresh toggle is clicked.',
            table: {
                type: { summary: '(autoRefreshMode: boolean) => void' },
                category: 'auto refresh',
            },
        },
        disableAutoRefreshOnUserInteraction: {
            control: 'boolean',
            type: 'boolean',
            description: 'Pauses auto-refresh on user interaction (mouseover, touchmove, scroll).',
            table: {
                defaultValue: { summary: 'true' },
                category: 'auto refresh',
            },
        },
        userInteractionDebounceDelay: {
            control: 'number',
            type: 'number',
            description: 'Debounce delay in milliseconds for user interaction events that pause auto-refresh.',
            table: {
                defaultValue: { summary: '250' },
                category: 'auto refresh',
            },
        },
        enableBulkActions: {
            control: 'boolean',
            type: 'boolean',
            description: 'Enables the bulk actions toolbar. Automatically enables checkbox selection.',
            table: {
                defaultValue: { summary: 'false' },
                category: 'bulk actions',
            },
        },
        bulkActions: {
            control: 'object',
            description: 'Bulk operation action buttons shown in the toolbar when rows are selected.',
            table: {
                type: {
                    summary:
                        '{ icon: ReactNode; tooltip: string; onClick: (params: BulkOperationCallbackParams, event: MouseEvent) => void }[]',
                },
                category: 'bulk actions',
            },
        },
        onBulkActionsClose: {
            type: 'function',
            description: 'Callback fired when the bulk actions bar is closed.',
            table: {
                type: { summary: 'React.MouseEventHandler' },
                category: 'bulk actions',
            },
        },
        maxSelectedRowsCount: {
            control: 'number',
            type: 'number',
            description: 'Maximum number of rows that can be selected at once.',
            table: {
                defaultValue: { summary: '5000' },
                category: 'bulk actions',
            },
        },
        checkboxSelection: {
            control: 'boolean',
            type: 'boolean',
            description: 'Shows a checkbox column for row selection.',
            table: {
                defaultValue: { summary: 'false' },
                category: 'selection',
            },
        },
        disableSelectAllCheckbox: {
            control: 'boolean',
            type: 'boolean',
            description: 'Removes the select-all checkbox from the header.',
            table: {
                defaultValue: { summary: 'false' },
                category: 'selection',
            },
        },
        rowSelectionModel: {
            control: 'object',
            description: 'Controlled row selection state.',
            table: {
                type: { summary: "{ type: 'include' | 'exclude'; ids: Set<GridRowId> }" },
                category: 'selection',
            },
        },
        onRowSelectionModelChange: {
            type: 'function',
            description: 'Callback fired when the row selection changes.',
            table: {
                type: { summary: '(model: GridRowSelectionModel, details: GridCallbackDetails) => void' },
                category: 'selection',
            },
        },
        clearSelectionOnRefresh: {
            control: 'boolean',
            type: 'boolean',
            description: 'Clears row selection when the list refreshes.',
            table: {
                defaultValue: { summary: 'true' },
                category: 'selection',
            },
        },
        error: {
            control: 'boolean',
            type: 'boolean',
            description: 'Shows error placeholder when rows are empty instead of the no-results placeholder.',
            table: {
                defaultValue: { summary: 'false' },
                category: 'states',
            },
        },
        placeholderLabels: {
            control: 'object',
            description:
                'Custom labels for the error and empty state placeholders. When omitted, default localized labels are used.',
            table: {
                type: {
                    summary:
                        '{ error?: { header?: string; description?: string; footer?: string }; empty?: { header?: string; description?: string; footer?: string }; tryAgainButton?: string }',
                },
                category: 'states',
            },
        },
        loading: {
            control: 'boolean',
            type: 'boolean',
            description: 'Shows a linear progress bar loading overlay.',
            table: {
                defaultValue: { summary: 'false' },
                category: 'states',
            },
        },
        rows: {
            control: 'object',
            description: 'The data rows to display in the grid.',
            table: {
                type: { summary: 'GridRowsProp' },
                category: 'data',
            },
        },
        columns: {
            control: 'object',
            description: 'Column definitions for the grid.',
            table: {
                type: { summary: 'GridColDef[]' },
                category: 'data',
            },
        },
        rowHeight: {
            control: 'number',
            type: 'number',
            description: 'Fixed height in pixels for each row.',
            table: {
                defaultValue: { summary: '52' },
                category: 'layout',
            },
        },
        columnHeaderHeight: {
            control: 'number',
            type: 'number',
            description: 'Height in pixels of the column headers.',
            table: {
                defaultValue: { summary: '56' },
                category: 'layout',
            },
        },
        getRowHeight: {
            type: 'function',
            description: "Function to calculate row height. Return 'auto' for dynamic height.",
            table: {
                type: { summary: '(params: GridRowHeightParams) => GridRowHeightReturnValue' },
                category: 'layout',
            },
        },
        initialState: {
            control: 'object',
            description:
                'Initial state for the grid, extends MUI GridInitialState with autoRefreshEnabled for the auto-refresh button initial state.',
            table: {
                type: { summary: 'RingGridInitialState' },
                category: 'data',
            },
        },
        apiRef: {
            description: 'API reference for direct grid manipulation. If not provided, one is created internally.',
            table: {
                type: { summary: 'MutableRefObject<GridApiPro>' },
                category: 'data',
            },
        },
        slots: {
            control: 'object',
            description: 'Override internal grid components. The toolbar slot is managed by showRingToolbar.',
            table: {
                type: { summary: 'DataGridProProps["slots"]' },
                category: 'customization',
            },
        },
        slotProps: {
            control: 'object',
            description: 'Properties passed to slot components.',
            table: {
                type: { summary: 'DataGridProProps["slotProps"]' },
                category: 'customization',
            },
        },
        sx: {
            control: 'object',
            description: 'MUI System properties to customize the grid style.',
            table: {
                type: { summary: 'SxProps<Theme>' },
                defaultValue: { summary: '{}' },
                category: 'customization',
            },
        },
    },
};

export default meta;

export {
    CustomCells,
    CustomToolbar,
    BulkActions,
    NoResults,
    NoResultsCustomLabels,
    Error,
    ErrorCustomLabels,
    AutoRefreshActive,
    AutoRefreshIgnoreInteraction,
    AutoRefreshInitiallyDisabled,
    AutoRefreshDisabled,
    ClassicSelection,
};
