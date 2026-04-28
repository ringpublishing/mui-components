import { CommentsProps, defaultValues } from '../../../../../src/index.js';

const defaultArgs: Partial<CommentsProps> = {
    labels: {
        placeholder: 'Add a comment',
        editing: 'Edit comment',
        modified: 'modified',
        add: 'Add',
        cancel: 'Cancel',
        update: 'Update',
    },
    minLength: defaultValues.minLength,
    initialComments: defaultValues.comments,
    disableCreatePanel: defaultValues.disableCreatePanel,
};

export default defaultArgs;
