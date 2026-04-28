import React, { useImperativeHandle } from 'react';
import classNames from 'classnames';
import { Box } from '@mui/material';

import { Content, Editor, EditorProvider, Extension, Mark } from '@tiptap/react';
import { Transaction } from '@tiptap/pm/state';
import { Document } from '@tiptap/extension-document';
import { Text } from '@tiptap/extension-text';
import { Paragraph } from '@tiptap/extension-paragraph';
import { Bold } from '@tiptap/extension-bold';
import { Italic } from '@tiptap/extension-italic';
import { BulletList, OrderedList, ListItem } from '@tiptap/extension-list';
import { UndoRedo } from '@tiptap/extensions';

import { CommonComponentProps } from '../../../helpers/commonTypes.js';
import { TextEditorMenu } from './TextEditorMenu.js';
import Link from './Link.js';
import Image from './Image.js';
import { EditorCounter } from './EditorCounter.js';
import { CharacterCount } from './plugins/character-count.js';
import { useRingDataTestId } from '../../../helpers/hooks/useRingDataTestId.js';

export interface TextEditorImageAttributes {
    src: string;
    alt: string;
    title: string;
}

export interface TextEditorLinkAttributes {
    href: string;
    title: string;
    role: string;
    text: string;
}

export interface TextEditorProps extends CommonComponentProps {
    /**
     * The initial content to be rendered in the editor.
     * Can be provided as HTML or JSON.
     * @type {Content}
     */
    content: Content;

    /**
     * Callback function triggered when the editor's state is updated.
     * @param {Editor} editor - The instance of the TipTap editor.
     * @param {Transaction} transaction - The transaction object representing the changes made to the editor's state.
     */
    onUpdate: (editor: Editor, transaction: Transaction) => void;

    /**
     * Ref to the editor instance.
     */
    ref?: React.Ref<Editor | null>;

    /**
     * Used to handle adding links - TextEditor passes currently chosen link as a parameter and awaits for new link as a return value.
     * When null is returned, the link will be removed.
     * If not provided, the menu button for links will not be rendered.
     */
    onLinkClick?: (link: TextEditorLinkAttributes) => Promise<TextEditorLinkAttributes | null>;

    /**
     * Used to handle adding images - TextEditor awaits for new image as a return value.
     * If not provided, the menu button for images will not be rendered.
     */
    onImageClick?: () => Promise<TextEditorImageAttributes | null>;

    /**
     * Additional extensions for the editor.
     */
    extensions?: (Extension | Mark)[];

    /**
     * Additional menu controls - TextEditorMenuToggleButtons, TextEditorMenuSelectHeading or custom controls.
     */
    menuControls?: React.JSX.Element[];

    /**
     * Floating editor menu - imported from tiptap/react (refer to TipTap documentation).
     */
    floatingMenu?: React.JSX.Element;

    /**
     * Bubble editor menu - imported from tiptap/react (refer to TipTap documentation).
     */
    bubbleMenu?: React.JSX.Element;

    /**
     * The maximum number of characters allowed in the editor.
     */
    limit?: number;

    /**
     * If true, the editor will allow the content to exceed the defined limit.
     * @default true
     */
    allowExceedLimit?: boolean;
}

export const TextEditor = React.forwardRef<Editor | null, TextEditorProps>((props, ref): React.JSX.Element => {
    const {
        content,
        onUpdate,
        onLinkClick,
        onImageClick,
        extensions = [],
        menuControls,
        floatingMenu,
        bubbleMenu,
        className,
        sx,
        limit,
        allowExceedLimit = true,
        dataTestIdSuffix,
    } = props;
    const [editorForRef, setEditorForRef] = React.useState<Editor | null>(null);
    useImperativeHandle<Editor | null, Editor | null>(ref, () => editorForRef, [editorForRef]);

    const dataTestId = useRingDataTestId('TextEditor', dataTestIdSuffix);

    if (typeof limit === 'number') {
        extensions.push(
            CharacterCount.configure({
                limit,
                allowExceedLimit,
                textCounter: (text: string) => [...new Intl.Segmenter().segment(text)].length,
            }),
        );
    }

    return (
        <Box
            className={classNames('ring-text-editor', className)}
            sx={{
                // @ts-expect-error - theme type definition does not contain this color
                borderColor: (theme): string => theme.palette.secondary.focus,
                borderWidth: '1px',
                borderStyle: 'solid',
                borderRadius: '10px',
                paddingY: 1,
                '.ProseMirror-focused': {
                    outlineWidth: '0px',
                },
                a: {
                    color: (theme): string => theme.palette.primary.main,
                },
                ...sx,
            }}
        >
            <EditorProvider
                extensions={[
                    Document,
                    Text,
                    UndoRedo,
                    Paragraph,
                    ListItem,
                    BulletList,
                    OrderedList,
                    Image,
                    Bold,
                    Italic,
                    Link,
                    ...extensions,
                ]}
                content={content}
                shouldRerenderOnTransaction={true}
                slotBefore={
                    <TextEditorMenu
                        menuControls={menuControls}
                        onLinkClick={onLinkClick}
                        onImageClick={onImageClick}
                        dataTestId={dataTestId}
                    />
                }
                onCreate={({ editor }): void => {
                    setEditorForRef(editor);
                }}
                onUpdate={({ editor, transaction }): void => {
                    onUpdate(editor, transaction);
                }}
            >
                {floatingMenu}
                {bubbleMenu}
                {typeof limit === 'number' && <EditorCounter limit={limit} />}
            </EditorProvider>
        </Box>
    );
});

TextEditor.displayName = 'TextEditor';
