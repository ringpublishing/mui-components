import { EditableTextProps } from '../../../../../src/index.js';

const defaultArgs: Partial<EditableTextProps> = {
    text: 'Editable text value',
    slotProps: {
        typography: {
            variant: 'body2',
        },
        textField: {
            variant: 'standard',
        },
    },
};

export default defaultArgs;
