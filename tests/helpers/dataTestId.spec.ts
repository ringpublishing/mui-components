import { describe, expect, it } from 'vitest';
import { resolveItemDataTestId } from '../../src/helpers/dataTestId.js';

describe('resolveItemDataTestId', () => {
    it('builds ring-<component>-item-<id> by default', () => {
        expect(resolveItemDataTestId({ componentName: 'MultimediaGrid', itemId: 'abc123' })).toBe(
            'ring-multimediagrid-item-abc123',
        );
    });

    it('inserts the list suffix between component and item', () => {
        expect(
            resolveItemDataTestId({ componentName: 'MultimediaGrid', listSuffix: 'gallery', itemId: 'abc123' }),
        ).toBe('ring-multimediagrid-gallery-item-abc123');
    });

    it('falls back to the index when the item has no id', () => {
        expect(resolveItemDataTestId({ componentName: 'ContentList', index: 2 })).toBe('ring-contentlist-item-2');
    });

    it('uses index 0 rather than dropping it', () => {
        expect(resolveItemDataTestId({ componentName: 'ContentList', index: 0 })).toBe('ring-contentlist-item-0');
    });

    it('replaces the item segment with the item itemDataTestIdSuffix', () => {
        expect(
            resolveItemDataTestId({
                componentName: 'MultimediaGrid',
                listSuffix: 'gallery',
                itemId: 'abc123',
                item: { itemDataTestIdSuffix: 'hero-card' },
            }),
        ).toBe('ring-multimediagrid-gallery-hero-card');
    });

    it('uses the item dataTestId verbatim, without a ring- prefix', () => {
        expect(
            resolveItemDataTestId({
                componentName: 'MultimediaGrid',
                listSuffix: 'gallery',
                itemId: 'abc123',
                item: { dataTestId: 'my-custom-card' },
            }),
        ).toBe('my-custom-card');
    });

    it('prefers item dataTestId over item itemDataTestIdSuffix', () => {
        expect(
            resolveItemDataTestId({
                componentName: 'MultimediaGrid',
                itemId: 'abc123',
                item: { dataTestId: 'wins', itemDataTestIdSuffix: 'loses' },
            }),
        ).toBe('wins');
    });

    it('lets the list-level override beat every per-item value', () => {
        expect(
            resolveItemDataTestId({
                componentName: 'MultimediaGrid',
                itemId: 'abc123',
                item: { dataTestId: 'loses' },
                override: 'wins',
            }),
        ).toBe('wins');
    });
});
