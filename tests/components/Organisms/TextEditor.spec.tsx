import { createRef } from 'react';
import { vi, describe, it, expect } from 'vitest';
import { render, RenderOptions, RenderResult, waitFor } from '@testing-library/react';
import { Editor } from '@tiptap/react';
import { getCreatedTheme, TextEditor, TextEditorProps } from '../../../src/index.js';
import { ThemeProvider } from '@mui/material';

const htmlContent = `
    <p>Lorem ipsum <i>dolor sit</i> <b>amet</b>, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea</p>
    <p>Link: <a href="https://en.wikipedia.org/wiki/Lorem_ipsum" rel="noopener noreferrer" title="Lorem ipsum">Lorem ipsum </a></p>
    <img src='https://ocdn.eu/pulscms-transforms/1/vKzktkuTURBXy9lMTY1ZTU0Zi00YTg4LTRmNWQtYWYwZi0xOTUzM2U4MmY4Y2YuanBlZ5GVAs0CigDDww' alt="Lorem ipsum" title="Image title" />
    <ol>
        <li>First item</li>
        <li>Second item</li>
    </ol>
    <ul>
        <li>First item</li>
        <li>Second item</li>
    </ul>
`;

const jsonContent = {
    type: 'doc',
    content: [
        {
            type: 'paragraph',
            content: [
                {
                    type: 'text',
                    text: 'Lorem ipsum ',
                },
                {
                    type: 'text',
                    marks: [
                        {
                            type: 'italic',
                        },
                    ],
                    text: 'dolor sit',
                },
                {
                    type: 'text',
                    text: ' ',
                },
                {
                    type: 'text',
                    marks: [
                        {
                            type: 'bold',
                        },
                    ],
                    text: 'amet',
                },
                {
                    type: 'text',
                    text: ', consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
                },
            ],
        },
        {
            type: 'paragraph',
            content: [
                {
                    type: 'text',
                    text: 'Link: ',
                },
                {
                    type: 'text',
                    marks: [
                        {
                            type: 'link',
                            attrs: {
                                title: 'Lorem ipsum',
                                role: null,
                                href: 'https://en.wikipedia.org/wiki/Lorem_ipsum',
                                rel: 'noopener noreferrer',
                            },
                        },
                    ],
                    text: 'Lorem ipsum',
                },
            ],
        },
        {
            type: 'image',
            attrs: {
                src: 'https://ocdn.eu/pulscms-transforms/1/vKzktkuTURBXy9lMTY1ZTU0Zi00YTg4LTRmNWQtYWYwZi0xOTUzM2U4MmY4Y2YuanBlZ5GVAs0CigDDww',
                alt: 'Lorem ipsum',
                title: 'Image title',
            },
        },
        {
            type: 'orderedList',
            attrs: {
                start: 1,
                type: null,
            },
            content: [
                {
                    type: 'listItem',
                    content: [
                        {
                            type: 'paragraph',
                            content: [
                                {
                                    type: 'text',
                                    text: 'First item',
                                },
                            ],
                        },
                    ],
                },
                {
                    type: 'listItem',
                    content: [
                        {
                            type: 'paragraph',
                            content: [
                                {
                                    type: 'text',
                                    text: 'Second item',
                                },
                            ],
                        },
                    ],
                },
            ],
        },
        {
            type: 'bulletList',
            content: [
                {
                    type: 'listItem',
                    content: [
                        {
                            type: 'paragraph',
                            content: [
                                {
                                    type: 'text',
                                    text: 'First item',
                                },
                            ],
                        },
                    ],
                },
                {
                    type: 'listItem',
                    content: [
                        {
                            type: 'paragraph',
                            content: [
                                {
                                    type: 'text',
                                    text: 'Second item',
                                },
                            ],
                        },
                    ],
                },
            ],
        },
    ],
};

describe('TextEditor', () => {
    function renderTextEditor(mockProps: TextEditorProps, options: RenderOptions = {}): RenderResult {
        const theme = getCreatedTheme('light');

        return render(
            <ThemeProvider theme={theme}>
                <TextEditor {...mockProps} />
            </ThemeProvider>,
            options,
        );
    }

    it('should render correctly with sample html content', async () => {
        const { container, findByTestId } = renderTextEditor({ content: htmlContent, onUpdate: vi.fn() });

        const imageNode = await findByTestId('ring-image-node');
        expect(imageNode).toBeTruthy();

        expect(container).toMatchSnapshot();
    });

    it('should render correctly with sample json content', async () => {
        const { container, findByTestId } = renderTextEditor({ content: jsonContent, onUpdate: vi.fn() });

        const imageNode = await findByTestId('ring-image-node');
        expect(imageNode).toBeTruthy();

        expect(container).toMatchSnapshot();
    });

    it('should show link menu button when onLinkClick is passed', () => {
        const { getByTestId } = renderTextEditor({
            content: htmlContent,
            onUpdate: vi.fn(),
            onLinkClick: vi.fn(),
        });
        expect(getByTestId('LinkIcon')).toBeTruthy();
    });

    it('should show image menu button when onImageClick is passed', () => {
        const { getByTestId } = renderTextEditor({
            content: htmlContent,
            onUpdate: vi.fn(),
            onImageClick: vi.fn(),
        });
        expect(getByTestId('ImageIcon')).toBeTruthy();
    });

    // Triggers a ProseMirror input rule the same way real typing does (via the
    // inputRules plugin's `handleTextInput` prop), since dispatching a plain
    // transaction would bypass input rules entirely.
    function typeAtCursor(editor: Editor, text: string): void {
        const { view } = editor;
        const { from } = view.state.selection;
        view.someProp('handleTextInput', (handler) => handler(view, from, from, text, () => view.state.tr));
    }

    async function renderAndGetEditor(props: Partial<TextEditorProps>): Promise<Editor> {
        const ref = createRef<Editor>();
        renderTextEditor({ content: '<p>-</p>', onUpdate: vi.fn(), ref, ...props });
        await waitFor(() => expect(ref.current).toBeTruthy());

        return ref.current as Editor;
    }

    it('converts a markdown list marker into a list by default', async () => {
        const editor = await renderAndGetEditor({});
        editor.commands.focus('end');
        typeAtCursor(editor, ' ');

        expect(JSON.stringify(editor.getJSON())).toContain('"bulletList"');
    });

    it('does not convert a markdown list marker when disableListInputRules is true', async () => {
        const editor = await renderAndGetEditor({ disableListInputRules: true });
        editor.commands.focus('end');
        typeAtCursor(editor, ' ');

        const json = JSON.stringify(editor.getJSON());
        expect(json).not.toContain('"bulletList"');
        expect(editor.getText()).toContain('-');
    });
});
