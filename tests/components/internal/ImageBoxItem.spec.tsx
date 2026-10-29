import { describe, expect, it } from 'vitest';

import { ImageBoxItem } from '../../../src/components/internal/BottomBar/ImageBoxItem.js';
import { render, screen } from '../../test-utils/customRenderer.js';

const FIELD_MAP = { id: 'id', name: 'name', image: 'image' };

describe('ImageBoxItem', () => {
    it('gives the placeholder of an item without an image a test id under the item', () => {
        render(
            <ImageBoxItem
                selectedRow={{ id: 7, name: 'No image' }}
                fieldMap={FIELD_MAP}
                onRemove={(): void => undefined}
                dataTestId="ring-dataview-bottom-bar-item-7"
            />,
        );

        const placeholder = screen.getByTestId('ring-dataview-bottom-bar-item-7-placeholder-icon');

        expect(placeholder.className).toContain('ring-featuredicon');
        expect(getComputedStyle(placeholder).containerType).toBe('size');
    });
});
