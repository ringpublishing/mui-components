import { SearchBoxProps } from '../../../../../src/index.js';

const defaultArgs: Partial<SearchBoxProps> = {
    defaultValue: '',
    debounceTime: 500,
    withClearButton: false,
    labels: {
        placeholder: 'Search',
        clear: 'Clear',
    },
};

export default defaultArgs;
