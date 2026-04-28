import { vi, describe, it, expect } from 'vitest';
import { render, RenderOptions, RenderResult } from '@testing-library/react';
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
});
