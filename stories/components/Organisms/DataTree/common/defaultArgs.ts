import { DataTreeProps } from '../../../../../src/index.js';

const defaultArgs: Partial<DataTreeProps> = {
    withSearch: false,
    searchDebounceTime: 500,
    showColumnHeaders: true,
    columns: [
        { name: 'column1', width: 100, header: 'First Column' },
        { name: 'column2', width: 100, header: 'Second Column' },
    ],
    itemsLabelColumnHeader: 'Name',
};

export default defaultArgs;
