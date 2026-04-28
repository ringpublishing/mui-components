import React, { useState } from 'react';
import {
    TextEditor,
    TextEditorImageAttributes,
    TextEditorLinkAttributes,
    TextEditorMenuToggleButton,
    TextEditorMenuSelectHeading,
    TextField,
} from '@ringpublishing/mui-components';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle } from '@mui/material';
import { CodeOutlined } from '@mui/icons-material';
import { Extension } from '@tiptap/react';
import { Heading } from '@tiptap/extension-heading';
import { Code } from '@tiptap/extension-code';
import { getImagePath, TestImage, ImageSize } from 'RingDemoImages';

const sampleText = `
    <h1>Heading 1</h1>
    <p>Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the</p>

    <h2>Heading 2</h2>
    <p>Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the</p>

    <h3>Heading 3</h3>
    <p>Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the</p>

    <h4>Heading 4</h4>
    <p>Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the</p>

    <h5>Heading 5</h5>
    <p>Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the</p>

    <h6>Heading 6</h6>
    <p>Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the</p>

    <ol>
        <li>First item</li>
        <li>Second item</li>
    </ol>
    <ul>
        <li>First item</li>
        <ul>
            <li>Subitem 1</li>
        </ul>
        <li>Second item</li>
    </ul>

    <p>Link: <a href="https://en.wikipedia.org/wiki/Lorem_ipsum" rel="noopener noreferrer" title="Lorem ipsum">Lorem ipsum </a></p>

    <img src='${getImagePath(TestImage.DESERT, ImageSize.LARGE)}' alt="Lorem ipsum" title="Image title" />
`;

export default function WithAdditionalExtensionsExample(): React.JSX.Element {
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

    return (
        <div style={{ width: '600px' }}>
            <TextEditor
                content={sampleText}
                extensions={[Heading as Extension, Code]}
                menuControls={[
                    <TextEditorMenuSelectHeading levels={[1, 2, 3, 4, 5, 6]} key={'heading'} />,
                    <TextEditorMenuToggleButton
                        key={'code'}
                        icon={<CodeOutlined />}
                        onClick={(editor): boolean => editor.chain().focus().toggleCode().run()}
                        active={(editor): boolean => editor.isActive('code')}
                        disabled={(editor): boolean => !editor.can().chain().focus().toggleCode().run()}
                    />,
                ]}
                onUpdate={(): null => {
                    return null;
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
}
