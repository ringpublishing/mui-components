import { SearchBarProps } from '../../../../../src/index.js';

const defaultArgs: Partial<SearchBarProps> = {
    defaultValue: '',
    debounceTime: 500,
    withClearButton: false,
    labels: {
        placeholder: 'Search',
        clear: 'Clear',
    },
};

export default defaultArgs;
