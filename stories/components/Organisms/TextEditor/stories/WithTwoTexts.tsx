import React, { useEffect, useRef, useState } from 'react';
import type { StoryObj } from '@storybook/react-vite';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle } from '@mui/material';
import { Editor, Extension, Mark } from '@tiptap/react';
import { createCodeStory } from '../../../../helpers.js';
import DefaultExampleCode from './code/DefaultExample.tsx?raw';
import {
    TextEditor,
    TextEditorImageAttributes,
    TextEditorLinkAttributes,
    TextField,
} from '../../../../../src/index.js';
import { getImagePath, ImageSize, TestImage } from '../../../../../src/helpers/stories/imagesData.js';

type Story = StoryObj<typeof TextEditor>;

const sampleTextBasic = `
    <p>Lorem ipsum <i>dolor sit</i> <b>amet</b>, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea</p>
    <p>Link: <a href="https://en.wikipedia.org/wiki/Lorem_ipsum" rel="noopener noreferrer" title="Lorem ipsum">Lorem ipsum </a></p>
    <img src='${getImagePath(TestImage.DESERT, ImageSize.LARGE)}' alt="Lorem ipsum" title="Image title" />
    <ol>
        <li>First item</li>
        <li>Second item</li>
    </ol>
    <ul>
        <li>First item</li>
        <li>Second item</li>
    </ul>
`;

const sampleTextBasic2 = `
    <p>Text 2</p>
    <p>Lorem ipsum <i>dolor sit</i> <b>amet</b>, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea</p>
        <ul>
        <li>First item</li>
        <li>Second item</li>
    </ul>
`;

const TextEditorWrapper = (props: {
    content: string;
    extensions: (Extension | Mark)[];
    menuControls: React.JSX.Element[];
}): React.JSX.Element => {
    const { extensions, menuControls, content } = props;
    const [linkDialogOpen, setLinkDialogOpen] = useState(false);
    const [imageDialogOpen, setImageDialogOpen] = useState(false);

    const [linkDialogCallback, setLinkDialogCallback] = useState<
        (link: TextEditorLinkAttributes | null) => void
        // eslint-disable-next-line @typescript-eslint/no-empty-function
    >(() => () => {});
    const [imageDialogCallback, setImageDialogCallback] = useState<
        (link: TextEditorImageAttributes | null) => void
        // eslint-disable-next-line @typescript-eslint/no-empty-function
    >(() => () => {});

    const [link, setLink] = useState<TextEditorLinkAttributes>({
        text: '',
        href: '',
        title: '',
        role: 'data-link-role-code',
    });
    const [image, setImage] = useState<TextEditorImageAttributes>({ src: '', alt: '', title: '' });

    const [text1, setText1] = useState(content);
    const [text2, setText2] = useState(sampleTextBasic2);
    const [currentText, setCurrentText] = useState('1');

    const ref = useRef<Editor | null>(null);

    const refCallback = (editor: Editor | null): void => {
        ref.current = editor;
    };

    useEffect(() => {
        const handleMessage = (e: MessageEvent): void => {
            if (e.data === 'text 1') {
                setCurrentText('1');
            } else if (e.data === 'text 2') {
                setCurrentText('2');
            }
        };

        window.addEventListener('message', handleMessage);

        return () => {
            window.removeEventListener('message', handleMessage);
        };
    }, []);

    return (
        <div style={{ width: '600px' }}>
            <TextEditor
                key={currentText}
                ref={refCallback}
                content={currentText === '1' ? text1 : text2}
                onUpdate={(editor): void => {
                    if (currentText === '1') {
                        setText1(editor.getHTML());
                    } else {
                        setText2(editor.getHTML());
                    }
                }}
                onLinkClick={(link: TextEditorLinkAttributes): Promise<TextEditorLinkAttributes | null> => {
                    setLink(link);
                    setLinkDialogOpen(true);

                    return new Promise<TextEditorLinkAttributes | null>((resolve) => {
                        setLinkDialogCallback(() => (link: TextEditorLinkAttributes | null) => {
                            resolve(link);
                            setLinkDialogOpen(false);
                        });
                    });
                }}
                onImageClick={(): Promise<TextEditorImageAttributes | null> => {
                    setImageDialogOpen(true);

                    return new Promise<TextEditorImageAttributes | null>((resolve) => {
                        setImageDialogCallback(() => (image: TextEditorImageAttributes | null) => {
                            resolve(image);
                            setImageDialogOpen(false);
                        });
                    });
                }}
                extensions={extensions}
                menuControls={menuControls}
                limit={1000}
            />

            <Dialog open={linkDialogOpen} onClose={(): void => linkDialogCallback(null)}>
                <DialogTitle>Set link</DialogTitle>
                <DialogContent sx={{ '.MuiTextField-root': { margin: 1 } }}>
                    <TextField
                        label={'Text'}
                        value={link.text}
                        onChange={(e): void => setLink({ ...link, text: e.target.value })}
                    />
                    <TextField
                        label={'Href'}
                        value={link.href}
                        onChange={(e): void => setLink({ ...link, href: e.target.value })}
                    />
                    <TextField
                        label={'Title'}
                        value={link.title}
                        onChange={(e): void => setLink({ ...link, title: e.target.value })}
                    />
                </DialogContent>
                <DialogActions>
                    <Button
                        onClick={(): void => {
                            linkDialogCallback(null);
                        }}
                    >
                        {link.href === '' ? 'Cancel' : 'Remove'}
                    </Button>
                    <Button
                        onClick={(): void => {
                            linkDialogCallback(link);
                        }}
                    >
                        Submit
                    </Button>
                </DialogActions>
            </Dialog>

            <Dialog open={imageDialogOpen} onClose={(): void => imageDialogCallback(null)}>
                <DialogTitle>Set image</DialogTitle>
                <DialogContent sx={{ '.MuiTextField-root': { margin: 1 } }}>
                    <TextField
                        label={'Src'}
                        value={image.src}
                        onChange={(e): void => setImage({ ...image, src: e.target.value })}
                    />
                    <TextField
                        label={'Alt'}
                        value={image.alt}
                        onChange={(e): void => setImage({ ...image, alt: e.target.value })}
                    />
                    <TextField
                        label={'Title'}
                        value={image.title}
                        onChange={(e): void => setImage({ ...image, title: e.target.value })}
                    />
                </DialogContent>
                <DialogActions>
                    <Button
                        onClick={(): void => {
                            imageDialogCallback(null);
                        }}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={(): void => {
                            imageDialogCallback(image);
                        }}
                    >
                        Submit
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    );
};

export const WithTwoTexts: Story = {
    render: (args, context) =>
        createCodeStory({
            context,
            customCode: DefaultExampleCode,
            example: <TextEditorWrapper content={sampleTextBasic} extensions={[]} menuControls={[]} />,
        }),
    parameters: {
        customButtons: [
            <Button
                key={'text 1'}
                onClick={() => {
                    window.postMessage('text 1', '*');
                }}
            >
                Edit Text #1
            </Button>,
            <Button
                key={'text 2'}
                onClick={() => {
                    window.postMessage('text 2', '*');
                }}
            >
                Edit Text #2
            </Button>,
        ],
    },
};
