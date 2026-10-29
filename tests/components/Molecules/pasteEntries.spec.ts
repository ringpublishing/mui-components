import { describe, it, expect } from 'vitest';
import {
    DEFAULT_PASTE_SEPARATORS,
    splitPastedText,
} from '../../../src/components/Molecules/Autocomplete/pasteEntries.js';

describe('splitPastedText', () => {
    it('splits on the default separators and trims', () => {
        expect(splitPastedText('a, b;c\nd\te', DEFAULT_PASTE_SEPARATORS)).toEqual(['a', 'b', 'c', 'd', 'e']);
    });

    it('drops empty fragments', () => {
        expect(splitPastedText(' , ;\n ,a,, ', DEFAULT_PASTE_SEPARATORS)).toEqual(['a']);
    });

    it('returns nothing for whitespace and separators only', () => {
        expect(splitPastedText(' , ;\n\t', DEFAULT_PASTE_SEPARATORS)).toEqual([]);
    });

    it('handles CRLF line breaks without leaving a carriage return', () => {
        expect(splitPastedText('a\r\nb\r\n', DEFAULT_PASTE_SEPARATORS)).toEqual(['a', 'b']);
    });

    it('treats a text without separators as one entry', () => {
        expect(splitPastedText('  single value ', DEFAULT_PASTE_SEPARATORS)).toEqual(['single value']);
    });

    it('honours custom separators, including regex metacharacters', () => {
        expect(splitPastedText('a|b.c', ['|', '.'])).toEqual(['a', 'b', 'c']);
    });

    it('does not split at all with an empty separator list', () => {
        expect(splitPastedText('a,b', [])).toEqual(['a,b']);
    });
});
