import { describe, expect, it } from 'vitest';
import { decomposeColor } from '@mui/material/styles';
import { Trash2 } from 'lucide-react';
import { render } from '../test-utils/customRenderer.js';
import { getCreatedTheme } from '../../src/theme/theme.js';
import { AIPencil, AIPencilIcon, EarthOffIcon, ListFilterOffIcon, createRingIcon } from '../../src/icons/index.js';

function toRgb(color: string): string {
    const { values } = decomposeColor(color);

    return `rgb(${values.slice(0, 3).join(', ')})`;
}

describe('custom icons with the MUI API', () => {
    it('gives the glyph the MUI SvgIcon prop surface', () => {
        const ref = { current: null as HTMLSpanElement | null };
        const { container } = render(
            <AIPencilIcon ref={ref} color="error" fontSize="small" sx={{ mr: 1 }} data-testid="icon" />,
        );

        const root = container.querySelector('[data-testid="icon"]') as HTMLSpanElement;
        const svg = root.querySelector('svg');
        const theme = getCreatedTheme('light');

        expect(ref.current).toBe(root);
        expect(root.classList).toContain('ring-lucide-icon');
        expect(svg?.classList).toContain('lucide-ai-pencil');
        expect(svg?.getAttribute('stroke')).toBe('currentColor');
        expect(getComputedStyle(root).color).toBe(toRgb(theme.palette.error.main));
        expect(getComputedStyle(root).fontSize).toBe('1.25rem');
        expect(getComputedStyle(root).marginRight).toBe('8px');
    });

    it('ships every custom glyph wrapped under its name with an Icon suffix', () => {
        expect(AIPencilIcon.displayName).toBe('AIPencilIcon');
        expect(EarthOffIcon.displayName).toBe('EarthOffIcon');
        expect(ListFilterOffIcon.displayName).toBe('ListFilterOffIcon');
        expect(AIPencil.displayName).toBe('AIPencil');
    });

    it('wraps any lucide-compatible glyph the same way for application code', () => {
        const TrashIcon = createRingIcon(Trash2, 'TrashIcon');
        const { container } = render(<TrashIcon color="primary" data-testid="icon" />);

        const root = container.querySelector('[data-testid="icon"]') as HTMLSpanElement;

        expect(TrashIcon.displayName).toBe('TrashIcon');
        expect(root.querySelector('svg')?.classList).toContain('lucide-trash');
        expect(getComputedStyle(root).color).toBe(toRgb(getCreatedTheme('light').palette.primary.main));
    });
});
