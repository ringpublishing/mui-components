import { describe, expect, it } from 'vitest';
import { Trash2 } from 'lucide-react';
import * as theme from '@ringpublishing/mui-theme';
import { render } from '../test-utils/customRenderer.js';
import { getCreatedTheme } from '../../src/theme/theme.js';
import * as library from '../../src/index.js';

function injectedCss(): string {
    return Array.from(document.head.querySelectorAll('style'))
        .map((style) => style.textContent ?? '')
        .join('\n');
}

// The provider and its rules live in the theme and are tested there; this checks what the library's
// `ThemeConfig` hands an application on top of it.
describe('RingIconDefaults under the library ThemeConfig', () => {
    it('re-exports the theme provider and constants unchanged', () => {
        expect(library.RingIconDefaults).toBe(theme.RingIconDefaults);
        expect(library.DEFAULT_LUCIDE_ICON_SIZE).toBe(20);
        expect(library.DEFAULT_LUCIDE_STROKE_WIDTH).toBe(1.5);
    });

    it('gives plain lucide icons the design system size and stroke', () => {
        const { container } = render(<Trash2 data-testid="icon" />);
        const svg = container.querySelector('[data-testid="icon"]');

        expect(svg?.getAttribute('width')).toBe('20');
        expect(svg?.getAttribute('stroke-width')).toBe('1.5');
        expect(svg?.querySelector('path')?.getAttribute('vector-effect')).toBe('non-scaling-stroke');
    });

    it('injects the palette and fontSize rules once, against the library default theme', () => {
        render(<Trash2 color="error" fontSize="small" />);
        const css = injectedCss();
        const rule = `:where(svg.lucide[stroke="error"]){stroke:${getCreatedTheme('light').palette.error.main};}`;

        expect(css.split(rule)).toHaveLength(2);
        expect(css).toContain(':where(svg.lucide[font-size="small"]){width:20px;height:20px;}');
    });
});
