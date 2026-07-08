import type { Meta } from '@storybook/react-vite';
import { MultimediaGrid } from '../../../../src/index.js';
import { DEFAULT_COLUMNS } from '../../../../src/components/Organisms/MultimediaGrid/useResolvedColumns.js';
import { DEFAULT_CELL_RATIO } from '../../../../src/components/Organisms/MultimediaGrid/useCellRatio.js';
import { Default } from './stories/Default.js';
import { InfiniteScroll } from './stories/InfiniteScroll.js';
import { Slots } from './stories/Slots.js';
import { Selection } from './stories/Selection.js';
import { EmptyState } from './stories/EmptyState.js';
import { EmptyStateCustomLabels } from './stories/EmptyStateCustomLabels.js';
import { ErrorState } from './stories/ErrorState.js';
import { ErrorStateCustomLabels } from './stories/ErrorStateCustomLabels.js';
import { DynamicLayout } from './stories/DynamicLayout.js';
import { WithFilterChips } from './stories/WithFilterChips.js';
import defaultArgs from './common/defaultArgs.js';
import MultimediaGridMDX from './MultimediaGrid.mdx';

const meta = {
    component: MultimediaGrid,
    parameters: {
        docs: {
            page: MultimediaGridMDX,
        },
    },
    args: {
        ...defaultArgs,
    },
    argTypes: {
        labels: {
            control: 'object',
            description: 'Labels used in the toolbar component.',
            table: {
                type: { summary: 'DataToolbarLabels' },
                category: 'data toolbar',
            },
        },
        sortableFields: {
            control: 'object',
            description: 'Fields by which grid elements can be sorted.',
            table: {
                type: { summary: 'DataToolbarSortableFields[]' },
                category: 'data toolbar',
            },
        },
        totalRowCount: {
            control: 'number',
            description: 'Total number of items to display in the toolbar.',
            type: 'number',
            table: {
                defaultValue: { summary: '1' },
                type: { summary: 'number' },
                category: 'data toolbar',
            },
        },
        loading: {
            control: 'boolean',
            type: 'boolean',
            description: 'Determines whether the component is in loading state.',
            table: {
                defaultValue: { summary: 'false' },
                type: { summary: 'boolean' },
                category: 'data toolbar',
            },
        },
        error: {
            control: 'boolean',
            type: 'boolean',
            description: 'If true, displays error message instead of grid.',
            table: {
                defaultValue: { summary: 'false' },
                type: { summary: 'boolean' },
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
        columns: {
            control: 'object',
            description: 'Number of columns. Can be a number or a responsive object.',
            table: {
                defaultValue: { summary: JSON.stringify(DEFAULT_COLUMNS) },
                type: { summary: 'ResponsiveValue<number>' },
                category: 'layout',
            },
        },
        cellRatio: {
            control: 'object',
            description: 'Cell proportions in "width/height" format. Can be responsive.',
            table: {
                defaultValue: { summary: JSON.stringify(DEFAULT_CELL_RATIO) },
                type: { summary: 'ResponsiveValue<string>' },
                category: 'layout',
            },
        },
        refreshItems: {
            type: 'function',
            description: 'Function called when refresh icon is clicked or during auto-refresh.',
            table: {
                type: { summary: '() => void' },
                category: 'data toolbar',
            },
            action: 'refreshItems',
        },
        showRingToolbar: {
            control: 'boolean',
            type: 'boolean',
            description: 'Determines whether the toolbar should be visible.',
            table: {
                defaultValue: { summary: 'false' },
                type: { summary: 'boolean' },
                category: 'data toolbar',
            },
        },
        spacing: {
            control: 'number',
            description: 'Spacing for both rows and columns (in theme.spacing() units). Can be responsive.',
            table: {
                type: { summary: 'ResponsiveValue<number>' },
                defaultValue: { summary: '0' },
                category: 'layout',
            },
        },
        rowSpacing: {
            control: 'number',
            description: 'Vertical spacing between rows (in theme.spacing() units). Can be responsive.',
            table: {
                type: { summary: 'ResponsiveValue<number>' },
                category: 'layout',
            },
        },
        columnSpacing: {
            control: 'number',
            description: 'Horizontal spacing between columns (in theme.spacing() units). Can be responsive.',
            table: {
                type: { summary: 'ResponsiveValue<number>' },
                category: 'layout',
            },
        },
        items: {
            control: 'object',
            description:
                'Media elements to display in the grid. Each item should contain data needed to display a media card.',
            table: {
                type: { summary: 'MultimediaGridItem[]' },
                category: 'data',
            },
        },
        sx: {
            control: 'object',
            description: 'MUI System properties to customize the main element style.',
            table: {
                category: 'customization',
                type: { summary: 'SxProps<Theme>' },
                defaultValue: { summary: '{}' },
            },
        },
        className: {
            control: 'text',
            type: 'string',
            description: 'CSS class name applied to the main element.',
            table: {
                type: { summary: 'string' },
                category: 'customization',
            },
        },
        slots: {
            control: 'object',
            description:
                'Allows overriding default components. Available slots: `mediaCard` - replaces the default MediaCard component.',
            table: {
                type: { summary: 'MultimediaGridSlots' },
                category: 'customization',
            },
        },
        slotProps: {
            control: 'object',
            description: 'Properties passed to slots. Available: `mediaCard` - props for the mediaCard slot.',
            table: {
                type: { summary: 'MultimediaGridSlotProps' },
                category: 'customization',
                defaultValue: { summary: '{}' },
            },
        },
        onLoadMore: {
            type: 'function',
            description:
                'Function called when the user approaches the end of the list. Used to implement infinite scrolling.',
            table: {
                type: { summary: '() => void | Promise<void>' },
                category: 'infinite scroll',
            },
            action: 'onLoadMore',
        },
        hasMore: {
            control: 'boolean',
            type: 'boolean',
            description: 'Determines if there is more data to load. Controls whether `onLoadMore` should be called.',
            table: {
                defaultValue: { summary: 'false' },
                type: { summary: 'boolean' },
                category: 'infinite scroll',
            },
        },
        overscan: {
            control: { type: 'number', min: 0, max: 20, step: 1 },
            description:
                'Number of additional items rendered outside the visible area for performance optimization during scrolling.',
            table: {
                defaultValue: { summary: '1' },
                type: { summary: 'number' },
                category: 'performance',
            },
        },
        selectionModel: {
            control: 'object',
            description: 'Set of selected items with type include/exclude. Can be controlled or uncontrolled.',
            table: {
                type: { summary: 'GridRowSelectionModel' },
                category: 'selection',
            },
        },
        onSelectionModelChange: {
            type: 'function',
            description: 'Callback fired when the selection changes.',
            table: {
                type: { summary: '(model: GridRowSelectionModel, details: GridCallbackDetails<any>) => void' },
                category: 'selection',
            },
            action: 'onSelectionModelChange',
        },
        disableSelection: {
            control: 'boolean',
            type: 'boolean',
            description: 'If true, the selection functionality is disabled.',
            table: {
                defaultValue: { summary: 'false' },
                type: { summary: 'boolean' },
                category: 'selection',
            },
        },
        disableSelectionOnClick: {
            control: 'boolean',
            type: 'boolean',
            description: 'If true, clicking on items will not trigger selection. Only checkbox clicks will work.',
            table: {
                defaultValue: { summary: 'false' },
                type: { summary: 'boolean' },
                category: 'selection',
            },
        },
        checkboxSelection: {
            control: 'boolean',
            type: 'boolean',
            description: 'If true, checkbox for selection is shown for each item.',
            table: {
                defaultValue: { summary: 'false' },
                type: { summary: 'boolean' },
                category: 'selection',
            },
        },
        dynamicLayout: {
            control: 'boolean',
            type: 'boolean',
            description:
                'Enables dynamic layout calculation. Automatically calculates optimal column count and card dimensions.',
            table: {
                defaultValue: { summary: 'false' },
                type: { summary: 'boolean' },
                category: 'dynamic layout',
            },
        },
        dynamicCardWidth: {
            control: { type: 'range', min: 150, max: 400, step: 10 },
            description:
                'Target card width in pixels. Reference size for optimal layout calculation. Only applies when dynamicLayout is true.',
            table: {
                defaultValue: { summary: '200' },
                type: { summary: 'number' },
                category: 'dynamic layout',
            },
        },
        dynamicCardHeight: {
            control: { type: 'range', min: 200, max: 500, step: 10 },
            description:
                'Target card height in pixels. Reference size for optimal layout calculation. Only applies when dynamicLayout is true.',
            table: {
                defaultValue: { summary: '300' },
                type: { summary: 'number' },
                category: 'dynamic layout',
            },
        },
    },
} satisfies Meta<typeof MultimediaGrid>;

export default meta;

export {
    Default,
    InfiniteScroll,
    Slots,
    Selection,
    EmptyState,
    EmptyStateCustomLabels,
    ErrorState,
    ErrorStateCustomLabels,
    DynamicLayout,
    WithFilterChips,
};
