import { action } from 'storybook/actions';
import { MultimediaGridProps } from '../../../../../src/index.js';
import { sortableFields } from '../../../../../src/helpers/stories/ringDemoData.js';

const DEFAULT_COLUMNS = { xs: 2, sm: 3, md: 4, lg: 5 };
const DEFAULT_CELL_RATIO = '3/4';

const defaultArgs: Partial<MultimediaGridProps> = {
    showRingToolbar: true,
    sx: { width: '100%', height: '100vh' },
    loading: false,
    columns: DEFAULT_COLUMNS,
    cellRatio: DEFAULT_CELL_RATIO,
    spacing: 1,
    labels: {
        results: 'Results',
        refresh: 'Refresh',
        enableAutoRefresh: 'Enable auto refresh',
        disableAutoRefresh: 'Disable auto refresh',
        selectAll: 'Select all',
        deselectAll: 'Deselect all',
    },
    sortableFields,
    refreshItems: action('refreshItems'),
    overscan: 1,
};

export default defaultArgs;
