import type { Meta } from '@storybook/react-vite';
import { TextEditor } from '../../../../src/index.js';
import { Default } from './stories/Default.js';
import { WithAdditionalExtensions } from './stories/WithAdditionalExtensions.js';
import { WithTwoTexts } from './stories/WithTwoTexts.js';
import TextEditorMDX from './TextEditor.mdx';

const meta: Meta<typeof TextEditor> = {
    component: TextEditor,
    parameters: {
        docs: {
            page: TextEditorMDX,
        },
    },
    argTypes: {
        content: {
            control: 'text',
            description: 'The initial content to be rendered in the editor. Can be provided as HTML or JSON.',
            table: {
                category: 'content',
                type: { summary: 'Content' },
            },
        },
        onUpdate: {
            control: false,
            description: "Callback function triggered when the editor's state is updated.",
            table: {
                category: 'callbacks',
                type: { summary: '(editor: Editor, transaction: Transaction) => void' },
            },
        },
        ref: {
            control: false,
            description: 'Ref to the TipTap editor instance.',
            table: {
                category: 'behavior',
                type: { summary: 'React.Ref<Editor | null>' },
            },
        },
        onLinkClick: {
            control: false,
            description:
                'Handler for adding/editing links. Receives the current link attributes and expects new attributes or null to remove. ' +
                'If not provided, the link menu button will not be rendered.',
            table: {
                category: 'callbacks',
                type: { summary: '(link: TextEditorLinkAttributes) => Promise<TextEditorLinkAttributes | null>' },
            },
        },
        onImageClick: {
            control: false,
            description:
                'Handler for adding images. Expects new image attributes as a return value. ' +
                'If not provided, the image menu button will not be rendered.',
            table: {
                category: 'callbacks',
                type: { summary: '() => Promise<TextEditorImageAttributes | null>' },
            },
        },
        extensions: {
            control: false,
            description: 'Additional TipTap extensions for the editor (e.g., Heading, Code).',
            table: {
                category: 'behavior',
                type: { summary: '(Extension | Mark)[]' },
            },
        },
        menuControls: {
            control: false,
            description:
                'Additional menu controls - TextEditorMenuToggleButtons, TextEditorMenuSelectHeading, or custom controls.',
            table: {
                category: 'behavior',
                type: { summary: 'React.JSX.Element[]' },
            },
        },
        floatingMenu: {
            control: false,
            description: 'Floating editor menu - imported from tiptap/react (refer to TipTap documentation).',
            table: {
                category: 'behavior',
                type: { summary: 'React.JSX.Element' },
            },
        },
        bubbleMenu: {
            control: false,
            description: 'Bubble editor menu - imported from tiptap/react (refer to TipTap documentation).',
            table: {
                category: 'behavior',
                type: { summary: 'React.JSX.Element' },
            },
        },
        limit: {
            control: 'number',
            description: 'The maximum number of characters allowed in the editor.',
            table: {
                category: 'validation',
            },
        },
        allowExceedLimit: {
            control: 'boolean',
            description: 'If true, the editor will allow the content to exceed the defined limit.',
            table: {
                category: 'validation',
                defaultValue: { summary: 'true' },
            },
        },
        sx: {
            control: 'object',
            description: 'MUI System properties to customize the main element style.',
            table: {
                category: 'customization',
                type: { summary: 'SxProps<Theme>' },
            },
        },
        className: {
            control: 'text',
            description: 'CSS class name applied to the main element.',
            table: {
                category: 'customization',
            },
        },
        dataTestIdSuffix: {
            control: 'text',
            description: 'Optional suffix for generated test id (base: ring-text-editor).',
            table: {
                category: 'customization',
                type: { summary: 'string' },
            },
        },
    },
};

export default meta;

export { Default, WithAdditionalExtensions, WithTwoTexts };
