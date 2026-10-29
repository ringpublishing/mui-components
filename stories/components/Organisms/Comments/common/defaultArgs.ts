import { CommentsProps } from '../../../../../src/index.js';
import { defaultValues } from '../../../../../src/components/Organisms/Comments/Comments.js';

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
