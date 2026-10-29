import { escapeRegExp } from 'lodash';

/** Separators used to split pasted text into entries when none are configured. */
export const DEFAULT_PASTE_SEPARATORS: ReadonlyArray<string> = [',', ';', '\n', '\t'];

/**
 * Splits pasted text into trimmed, non-empty entries.
 * `\r` is removed by the trim, so CRLF line breaks need no separator of their own.
 */
export const splitPastedText = (text: string, separators: ReadonlyArray<string>): string[] => {
    const fragments = separators.length === 0 ? [text] : text.split(new RegExp(separators.map(escapeRegExp).join('|')));

    return fragments.map((fragment) => fragment.trim()).filter((fragment) => fragment !== '');
};
