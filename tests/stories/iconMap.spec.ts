import { describe, expect, it } from 'vitest';
import * as lucide from 'lucide-react';

import * as ringIcons from '../../src/icons/index.js';
import { ICON_MAP, type IconMapEntry } from '../../stories/migrations/breaking/icon-map/iconMapData.js';

const normalize = (value: string): string => value.toLowerCase().replace(/[^a-z0-9]/g, '');
const exportsOf = ({ from }: IconMapEntry): Record<string, unknown> =>
    (from ? ringIcons : lucide) as unknown as Record<string, unknown>;

describe('Material → lucide icon map', () => {
    it('names every icon by its export', () => {
        const wrong = ICON_MAP.filter((entry) => !entry.icon || exportsOf(entry)[entry.lucide] !== entry.icon);

        expect(wrong.map(({ lucide: name }) => name)).toEqual([]);
    });

    it('lists each icon once, aliases included', () => {
        // lucide exports one component under several names (`History` is `RotateCcwClock`), so compare components.
        const icons = ICON_MAP.map(({ icon }) => icon);

        expect(
            ICON_MAP.filter(({ icon }, index) => icons.indexOf(icon) !== index).map(({ lucide: name }) => name),
        ).toEqual([]);
    });

    it('maps each Material icon to one replacement', () => {
        // Compared as the page searches them, so `ManageSearch` and `manage_search` are one icon; within a row
        // the export and the font name of one icon (`Image`, `image`) collapse first.
        const names = ICON_MAP.flatMap(({ material }) => [...new Set(material.map(normalize))]);

        expect(names.filter((name, index) => names.indexOf(name) !== index)).toEqual([]);
        expect(ICON_MAP.every(({ material }) => material.length > 0)).toBe(true);
    });
});
