import type { Meta } from '@storybook/react-vite';
import { Comments, defaultValues } from '../../../../src/index.js';
import { Default } from './stories/Default.js';
import { ErrorHandling } from './stories/ErrorHandling.js';
import defaultArgs from './common/defaultArgs.js';
import CommentsMDX from './Comments.mdx';

const meta = {
    component: Comments,
    parameters: {
        docs: {
            page: CommentsMDX,
        },
    },
    argTypes: {
        labels: {
            control: 'object',
            description:
                'Labels for fields and buttons in the Comments component. Supported keys:\n' +
                '- `placeholder`: Placeholder text in the comment field.\n' +
                '- `editing`: Label for the edit comment field.\n' +
                '- `modified`: Label for the modified comment.\n' +
                '- `add`: Label for the add comment button.\n' +
                '- `cancel`: Label for the cancel button.\n' +
                '- `update`: Label for the update comment button.',
            table: {
                category: 'content',
                type: {
                    summary:
                        '{ placeholder: string; editing: string; modified: string; add: string; cancel: string; update: string }',
                },
            },
        },
        initialComments: {
            control: 'object',
            description:
                'Array of comments to be displayed. Each comment should have the following properties:\n' +
                '- `id`: Unique identifier for the comment (`string` or `number`).\n' +
                '- `text`: Text content of the comment.\n' +
                '- `author`: Author of the comment.\n' +
                '- `creationTime`: Date/time value of when the comment was created (will be displayed as a formatted string).\n' +
                '- `isOwner`: Boolean indicating if the current user is the owner of the comment.\n' +
                '- `isModified`: Boolean indicating if the comment has been modified.\n' +
                'The component will display the comments in the order they are provided in the array.',
            table: {
                category: 'content',
                type: {
                    summary: 'CommentProps[]',
                },
                defaultValue: {
                    summary: JSON.stringify(defaultValues.comments),
                },
            },
        },
        minLength: {
            control: 'number',
            description: 'Minimum number of characters required for the text field input to enable the submit button.',
            table: {
                category: 'validation',
                type: { summary: 'number' },
                defaultValue: {
                    summary: defaultValues.minLength.toString(),
                },
            },
        },
        disableCreatePanel: {
            control: 'boolean',
            description: 'Comment panel will be hidden.',
            table: {
                category: 'behavior',
                type: { summary: 'boolean' },
                defaultValue: {
                    summary: defaultValues.disableCreatePanel.toString(),
                },
            },
        },
        onAdd: {
            control: false,
            description:
                '**Event**\n' +
                'Triggered when a new comment is submitted. The callback receives two arguments:\n' +
                '- `text`: The text of the submitted comment.\n' +
                '- `api`: An object providing methods to update the UI after processing the comment.\n' +
                '\n' +
                'The callback is expected to return a `Promise` to handle asynchronous operations, ' +
                'such as sending the comment to a server. While the `Promise` is pending, ' +
                'the input field and action buttons are disabled until the `Promise` resolves or rejects.\n' +
                'The `api` object includes the following methods:\n' +
                '- `addComment(comment)`: Appends the new comment to the UI and re-enables the input and buttons. ' +
                'Call this when the server operation succeeds.\n' +
                '- `setError(message)`: Displays an error message and re-enables the input and buttons. ' +
                'Call this when the server operation fails.\n' +
                '\n' +
                '**Important**: You must call either `addComment` or `setError` in the `Promise` ' +
                'resolution or rejection handlers to update the UI and ensure the controls are re-enabled.',
            table: {
                category: 'callbacks',
                type: {
                    summary: '(text: string, api: OnAddApi) => Promise<void>',
                },
            },
        },
        onUpdate: {
            control: false,
            description:
                '**Event**\n' +
                'Triggered when a comment is updated. The callback receives three arguments:\n' +
                '- `id`: The ID of the comment being updated.\n' +
                '- `text`: The new text of the comment.\n' +
                '- `api`: An object providing methods to update the UI after processing the comment.\n' +
                '\n' +
                'The callback is expected to return a `Promise` to handle asynchronous operations, ' +
                'such as sending the updated comment to a server. While the `Promise` is pending, ' +
                'the input field and action buttons are disabled until the `Promise` resolves or rejects.\n' +
                'The `api` object includes the following methods:\n' +
                '- `updateComment(comment)`: Updates the comment in the UI and re-enables the input and buttons. ' +
                'Call this when the server operation succeeds.\n' +
                '- `setError(message)`: Displays an error message and re-enables the input and buttons. Call this when the server operation fails.\n' +
                '\n' +
                '**Important**: You must call either `updateComment` or `setError` in the `Promise` ' +
                'resolution or rejection handlers to update the UI and ensure the controls are re-enabled.',
            table: {
                category: 'callbacks',
                type: {
                    summary: '(id: CommentIdProp, text: string, api: OnUpdateApi) => Promise<void>',
                },
            },
        },
        onDelete: {
            control: false,
            description:
                '**Event**\n' +
                'Triggered when a comment is deleted. The callback receives two arguments:\n' +
                '- `id`: The ID of the comment being deleted.\n' +
                '- `api`: An object providing methods to update the UI after processing the comment.\n' +
                '\n' +
                'The callback is expected to return a `Promise` to handle asynchronous operations, such as sending the delete request to a server. ' +
                'While the `Promise` is pending, the action buttons are disabled until the `Promise` resolves or rejects.\n' +
                'The `api` object includes the following methods:\n' +
                '- `deleteComment()`: Removes the comment from the UI and re-enables the buttons. Call this when the server operation succeeds.\n' +
                '- `setError(message)`: Displays an error message and re-enables the buttons. Call this when the server operation fails.\n' +
                '\n' +
                '**Important**: You must call either `deleteComment` or `setError` in the `Promise` ' +
                'resolution or rejection handlers to update the UI and ensure the controls are re-enabled.',
            table: {
                category: 'callbacks',
                type: {
                    summary: '(id: CommentIdProp, api: OnDeleteApi) => Promise<void>',
                },
            },
        },
        sx: {
            description: 'MUI System properties for customizing the style of the root element.',
            table: {
                category: 'common',
                type: { summary: 'SxProps<Theme>' },
            },
        },
        className: {
            description: 'CSS class name applied to the root element.',
            table: {
                category: 'common',
                type: { summary: 'string' },
            },
        },
    },
    args: {
        ...defaultArgs,
    },
} satisfies Meta<typeof Comments>;

export default meta;

export { Default, ErrorHandling };
