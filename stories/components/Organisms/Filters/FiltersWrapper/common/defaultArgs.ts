import { FiltersWrapperProps, SizeEnum, VariantEnum } from '../../../../../../src/index.js';

const defaultArgs: Partial<FiltersWrapperProps> = {
    label: 'Filters',
    withClearButton: true,
    clearButtonLabel: 'Clear',
    variant: VariantEnum.OUTLINE,
    size: SizeEnum.SMALL,
};

export default defaultArgs;
