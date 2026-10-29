import { describe, expect, it } from 'vitest';
import { buildRingDataTestId } from '../../src/helpers/hooks/useRingDataTestId.js';

describe('buildRingDataTestId', () => {
    it('prefixes and lowercases the component name', () => {
        expect(buildRingDataTestId('TreeView')).toBe('ring-treeview');
    });

    it('appends segments in order', () => {
        expect(buildRingDataTestId('TreeView', 'sfx', 'item', 'abc')).toBe('ring-treeview-sfx-item-abc');
    });

    it('drops nullish, false and empty segments instead of stringifying them', () => {
        expect(buildRingDataTestId('TreeView', undefined, 'item', null, '', false, 'abc')).toBe(
            'ring-treeview-item-abc',
        );
    });

    it('accepts numeric segments', () => {
        expect(buildRingDataTestId('ChipsGroup', 'chip', 0)).toBe('ring-chipsgroup-chip-0');
    });

    it('keeps a zero index rather than treating it as falsy', () => {
        expect(buildRingDataTestId('Placeholder', 'button', 0)).toBe('ring-placeholder-button-0');
    });
});
