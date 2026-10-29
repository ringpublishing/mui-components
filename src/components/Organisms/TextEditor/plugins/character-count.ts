/**
 * This plugin is copied from the original source and modified to fit the needs of the project.
 * https://github.com/ueberdosis/tiptap/blob/main/packages/extension-character-count/src/character-count.ts#L121
 * Licence is MIT: https://github.com/ueberdosis/tiptap/blob/main/packages/extension-character-count/package.json#L10
 */
// eslint-disable @typescript-eslint/explicit-function-return-type
import { Extension } from '@tiptap/core';
import { Node as ProseMirrorNode } from '@tiptap/pm/model';
import { Plugin, PluginKey } from '@tiptap/pm/state';

export interface CharacterCountOptions {
    /**
     * The maximum number of characters; `null`, `undefined` or `0` means no limit.
     * @default null
     * @example 180
     */
    limit: number | null | undefined;

    /**
     * Allow the limit to be exceeded. Defaults to `false`.
     */
    allowExceedLimit: boolean;

    /**
     * How the size is calculated: the document's `textContent` length for `textSize`, its
     * `nodeSize` for `nodeSize`.
     * @default 'textSize'
     * @example 'textSize'
     */
    mode: 'textSize' | 'nodeSize';
    /**
     * The text counter function to use. Defaults to a simple character count.
     * @default (text) => text.length
     * @example (text) => [...new Intl.Segmenter().segment(text)].length
     */
    textCounter: (text: string) => number;
    /**
     * The word counter function to use. Defaults to a simple word count.
     * @default (text) => text.split(' ').filter(word => word !== '').length
     * @example (text) => text.split(/\s+/).filter(word => word !== '').length
     */
    wordCounter: (text: string) => number;
}

export interface CharacterCountStorage {
    /**
     * Get the number of characters for the current document.
     * @param options The options for the character count. (optional)
     * @param options.node The node to get the characters from. Defaults to the current document.
     * @param options.mode The mode by which the size is calculated. If set to `textSize`, the textContent of the document is used.
     */
    characters: (options?: { node?: ProseMirrorNode; mode?: 'textSize' | 'nodeSize' }) => number;

    /**
     * Get the number of words for the current document.
     * @param options The options for the character count. (optional)
     * @param options.node The node to get the words from. Defaults to the current document.
     */
    words: (options?: { node?: ProseMirrorNode }) => number;
}

/**
 * This extension allows you to count the characters and words of your document.
 * @see https://tiptap.dev/api/extensions/character-count
 */
export const CharacterCount = Extension.create<CharacterCountOptions, CharacterCountStorage>({
    name: 'characterCount',

    addOptions() {
        return {
            limit: null,
            allowExceedLimit: false,
            mode: 'textSize',
            textCounter: (text) => text.length,
            wordCounter: (text) => text.split(' ').filter((word) => word !== '').length,
        };
    },

    addStorage() {
        return {
            characters: () => 0,
            words: () => 0,
        };
    },

    onBeforeCreate() {
        this.storage.characters = (options) => {
            const node = options?.node || this.editor.state.doc;
            const mode = options?.mode || this.options.mode;

            if (mode === 'textSize') {
                const text = node.textBetween(0, node.content.size, undefined, ' ');

                return this.options.textCounter(text);
            }

            return node.nodeSize;
        };

        this.storage.words = (options) => {
            const node = options?.node || this.editor.state.doc;
            const text = node.textBetween(0, node.content.size, ' ', ' ');

            return this.options.wordCounter(text);
        };
    },

    addProseMirrorPlugins() {
        let initialEvaluationDone = false;

        return [
            new Plugin({
                key: new PluginKey('characterCount'),
                // @ts-expect-error - this is a private API
                appendTransaction: (transactions, oldState, newState) => {
                    if (initialEvaluationDone) {
                        return;
                    }

                    const limit = this.options.limit;

                    if (limit === null || limit === undefined || limit === 0) {
                        initialEvaluationDone = true;

                        return;
                    }

                    const initialContentSize = this.storage.characters({ node: newState.doc });

                    if (initialContentSize > limit) {
                        const over = initialContentSize - limit;
                        const from = 0;
                        const to = over;

                        if (this.options.allowExceedLimit === false) {
                            console.warn(
                                `[CharacterCount] Initial content exceeded limit of ${limit} characters. Content was automatically trimmed.`,
                            );
                            const tr = newState.tr.deleteRange(from, to);
                            initialEvaluationDone = true;

                            return tr;
                        }
                    }

                    initialEvaluationDone = true;
                },
                filterTransaction: (transaction, state) => {
                    if (this.options.allowExceedLimit) {
                        return true;
                    }

                    const limit = this.options.limit;

                    // Nothing has changed or no limit is defined. Ignore it.
                    if (!transaction.docChanged || limit === 0 || limit === null || limit === undefined) {
                        return true;
                    }

                    const oldSize = this.storage.characters({ node: state.doc });
                    const newSize = this.storage.characters({ node: transaction.doc });

                    // Everything is in the limit. Good.
                    if (newSize <= limit) {
                        return true;
                    }

                    // The limit has already been exceeded but will be reduced.
                    if (oldSize > limit && newSize > limit && newSize <= oldSize) {
                        return true;
                    }

                    // The limit has already been exceeded and will be increased further.
                    if (oldSize > limit && newSize > limit && newSize > oldSize) {
                        return false;
                    }

                    const isPaste = transaction.getMeta('paste');

                    // Block all exceeding transactions that were not pasted.
                    if (!isPaste) {
                        return false;
                    }

                    // For pasted content, we try to remove the exceeding content.
                    const pos = transaction.selection.$head.pos;
                    const over = newSize - limit;
                    const from = pos - over;
                    const to = pos;

                    // `filterTransaction` is documented only for cancelling a transaction; this one is
                    // trimmed in place instead, so the paste applies cut to the limit.
                    transaction.deleteRange(from, to);

                    // The limit may still be exceeded after trimming, e.g. when truncating inside a
                    // complex node such as a table; the transaction is then blocked entirely.
                    const updatedSize = this.storage.characters({ node: transaction.doc });

                    if (updatedSize > limit) {
                        return false;
                    }

                    return true;
                },
            }),
        ];
    },
});
