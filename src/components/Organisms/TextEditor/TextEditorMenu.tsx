import React from 'react';
import { Box, Divider, ToggleButtonGroup } from '@mui/material';
import { Bold, Italic, List, ListOrdered, Image, Link2 } from 'lucide-react';

import { useCurrentEditor } from '@tiptap/react';
import { Editor } from '@tiptap/core';

import { TextEditorMenuToggleButton } from './TextEditorMenuToggleButton.js';
import { TextEditorImageAttributes, TextEditorLinkAttributes } from './TextEditor.js';
import { TextEditorMenuTestIdProvider } from './textEditorMenuTestIdContext.js';
import { WithOwnerDataTestId } from '../../../helpers/dataTestId.js';

interface TextEditorMenuProps extends WithOwnerDataTestId {
    onLinkClick?: (link: TextEditorLinkAttributes) => Promise<TextEditorLinkAttributes | null>;
    onImageClick?: () => Promise<TextEditorImageAttributes | null>;
    menuControls?: React.JSX.Element[];
}

export function TextEditorMenu(props: TextEditorMenuProps): React.JSX.Element | null {
    const { onLinkClick, onImageClick, menuControls, dataTestId } = props;
    const { editor } = useCurrentEditor();

    if (!editor) {
        return null;
    }

    async function handleLinkClick(editor: Editor): Promise<void> {
        if (!onLinkClick) {
            return;
        }

        const { view, state } = editor;
        const { from, to } = view.state.selection;

        const initialLink: TextEditorLinkAttributes = {
            href: editor.getAttributes('link').href || '',
            title: editor.getAttributes('link').title || '',
            role: editor.getAttributes('link').role || 'none',
            text: state.doc.textBetween(from, to, ''),
        };

        const newLink = await onLinkClick(initialLink);

        if (!newLink) {
            editor.chain().focus().unsetLink().run();

            return;
        }

        const marks = editor.state.doc.nodeAt(from)?.marks;

        const existingMarkNames = marks?.map((mark) => mark.type.name).filter((name) => name !== 'link');

        editor.commands.deleteRange({ from, to });

        editor
            .chain()
            .focus()
            .insertContentAt(from, {
                type: 'text',
                text: newLink.text,
            })
            .run();

        editor
            .chain()
            .focus()
            .setTextSelection({ from, to: from + newLink.text.length })
            .extendMarkRange('link')
            .setLink({
                href: newLink.href,
                title: newLink.title || '',
                // @ts-expect-error role is not defined in link options but we use it in TextEditorLinkAttributes
                role: newLink.role || 'none',
            })
            .run();

        existingMarkNames?.forEach((name) => {
            editor.chain().focus().setMark(name).run();
        });
    }

    async function handleImageClick(editor: Editor): Promise<void> {
        if (!onImageClick) {
            return;
        }

        const image = await onImageClick();

        if (image) {
            editor
                .chain()
                .focus()
                .setImage({
                    src: image.src,
                    alt: image.alt,
                    title: image.title,
                })
                .run();
        }
    }

    return (
        <TextEditorMenuTestIdProvider value={dataTestId}>
            <Box>
                <Box sx={{ paddingX: 1, paddingBottom: 1 }}>
                    <ToggleButtonGroup>
                        <TextEditorMenuToggleButton
                            icon={<Bold size="1em" />}
                            onClick={(editor): boolean => editor.chain().focus().toggleBold().run()}
                            active={(editor): boolean => editor.isActive('bold')}
                            disabled={(editor): boolean =>
                                !editor.can().chain().focus().toggleBold().run() ||
                                editor.getAttributes('heading').level !== undefined
                            }
                            dataTestId={`${dataTestId}-menu-bold`}
                        />
                        <TextEditorMenuToggleButton
                            icon={<Italic size="1em" />}
                            onClick={(editor): boolean => editor.chain().focus().toggleItalic().run()}
                            active={(editor): boolean => editor.isActive('italic')}
                            disabled={(editor): boolean => !editor.can().chain().focus().toggleItalic().run()}
                            dataTestId={`${dataTestId}-menu-italic`}
                        />
                        {onLinkClick && (
                            <TextEditorMenuToggleButton
                                icon={<Link2 size="1em" />}
                                onClick={handleLinkClick}
                                active={(editor): boolean => editor.isActive('link')}
                                disabled={(editor): boolean =>
                                    !editor.can().chain().focus().toggleLink({ href: '' }).run()
                                }
                                dataTestId={`${dataTestId}-menu-link`}
                            />
                        )}
                        <TextEditorMenuToggleButton
                            icon={<List size="1em" />}
                            onClick={(editor): boolean => editor.chain().focus().toggleBulletList().run()}
                            active={(editor): boolean => editor.isActive('bulletList')}
                            disabled={(editor): boolean => !editor.can().chain().focus().toggleBulletList().run()}
                            dataTestId={`${dataTestId}-menu-bullet-list`}
                        />
                        <TextEditorMenuToggleButton
                            icon={<ListOrdered size="1em" />}
                            onClick={(editor): boolean => editor.chain().focus().toggleOrderedList().run()}
                            active={(editor): boolean => editor.isActive('orderedList')}
                            disabled={(editor): boolean => !editor.can().chain().focus().toggleOrderedList().run()}
                            dataTestId={`${dataTestId}-menu-numbered-list`}
                        />

                        {onImageClick && (
                            <TextEditorMenuToggleButton
                                icon={<Image size="1em" />}
                                onClick={handleImageClick}
                                active={false}
                                disabled={false}
                                dataTestId={`${dataTestId}-menu-image`}
                            />
                        )}
                        {menuControls}
                    </ToggleButtonGroup>
                </Box>
                <Divider />
            </Box>
        </TextEditorMenuTestIdProvider>
    );
}
