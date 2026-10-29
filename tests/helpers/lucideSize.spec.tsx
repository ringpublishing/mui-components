import { describe, expect, it } from 'vitest';
import { Save, X } from 'lucide-react';
import { decomposeColor } from '@mui/material/styles';
import { render } from '../test-utils/customRenderer.js';
import { RingLucideIcon } from '../../src/helpers/RingLucideIcon.js';
import {
    DEFAULT_LUCIDE_ICON_SIZE,
    DEFAULT_LUCIDE_STROKE_WIDTH,
    getAbsoluteStrokeWidth,
    getLucideFontSize,
    getLucideSizeFromComponentSize,
    getLucideSizeFromFontSize,
} from '../../src/helpers/lucideSize.js';
import { RingIconDefaults } from '../../src/index.js';
import { EarthOff } from '../../src/icons/index.js';
import { getCreatedTheme } from '../../src/theme/theme.js';

describe('Lucide icon helpers', () => {
    it('should preserve MUI SvgIcon size mappings', () => {
        expect(getLucideFontSize('inherit')).toBe('inherit');
        expect(getLucideFontSize('small')).toBe('1.25rem');
        expect(getLucideFontSize('medium')).toBe('1.5rem');
        expect(getLucideFontSize('large')).toBe('2rem');
        expect(getLucideSizeFromFontSize('small')).toBe(20);
        expect(getLucideSizeFromFontSize('medium')).toBe(24);
        expect(getLucideSizeFromFontSize('large')).toBe(32);
        expect(getLucideSizeFromComponentSize('small')).toBe(18);
        expect(getLucideSizeFromComponentSize('medium')).toBe(20);
        expect(getLucideSizeFromComponentSize('large')).toBe(22);
    });

    it('should forward refs, retain the root class, and resolve MUI palette colors', () => {
        const ref = { current: null as HTMLSpanElement | null };
        const { container } = render(
            <RingLucideIcon ref={ref} icon={X} color="primary" className="consumer-class" data-testid="icon" />,
        );

        const icon = container.querySelector('[data-testid="icon"]') as HTMLSpanElement;
        const svg = icon.querySelector('svg');
        const theme = getCreatedTheme('light');
        const { values } = decomposeColor(theme.palette.primary.main);
        const expectedColor = `rgb(${values.slice(0, 3).join(', ')})`;

        expect(ref.current).toBe(icon);
        expect(icon.classList).toContain('ring-lucide-icon');
        expect(icon.classList).toContain('consumer-class');
        expect(getComputedStyle(icon).color).toBe(expectedColor);
        expect(svg?.getAttribute('stroke')).toBe('currentColor');
    });

    it('should compensate absoluteStrokeWidth for the pixel size behind each fontSize variant', () => {
        expect(getAbsoluteStrokeWidth(2, 'small')).toBe(2.4);
        expect(getAbsoluteStrokeWidth(2, 'medium')).toBe(2);
        expect(getAbsoluteStrokeWidth(2, 'large')).toBe(1.5);
        // No statically known pixel size — the stroke scales with the icon instead.
        expect(getAbsoluteStrokeWidth(2, 'inherit')).toBe(2);
    });

    it('should render a usable stroke width when absoluteStrokeWidth is set', () => {
        const { container } = render(
            <RingLucideIcon icon={X} fontSize="small" absoluteStrokeWidth={true} strokeWidth={2} />,
        );

        const strokeWidth = container.querySelector('svg')?.getAttribute('stroke-width');

        expect(strokeWidth).toBe('2.4');
        expect(Number(strokeWidth)).not.toBeNaN();
    });

    it('should leave the stroke width alone when absoluteStrokeWidth is not set', () => {
        const { container } = render(<RingLucideIcon icon={X} fontSize="small" strokeWidth={2} />);

        expect(container.querySelector('svg')?.getAttribute('stroke-width')).toBe('2');
    });

    it('should take the stroke width from the lucide context without producing NaN', () => {
        // This component renders lucide at `size="1em"`, which is what makes lucide's own
        // `absoluteStrokeWidth` divide by `Number('1em')`. The context has to be resolved here.
        const { container } = render(
            <RingIconDefaults>
                <RingLucideIcon icon={X} fontSize="small" data-testid="from-context" />
                <RingLucideIcon icon={X} fontSize="small" strokeWidth={3} data-testid="own-stroke" />
            </RingIconDefaults>,
        );

        const fromContext = container.querySelector('[data-testid="from-context"] svg');
        const ownStroke = container.querySelector('[data-testid="own-stroke"] svg');

        expect(fromContext?.getAttribute('stroke-width')).toBe(String(DEFAULT_LUCIDE_STROKE_WIDTH));
        expect(Number(fromContext?.getAttribute('stroke-width'))).not.toBeNaN();
        // The thickness is pinned to the rendered pixel on the drawn shapes, not on the root.
        expect(fromContext?.querySelector('path')?.getAttribute('vector-effect')).toBe('non-scaling-stroke');
        // An explicit value wins over the context.
        expect(ownStroke?.getAttribute('stroke-width')).toBe('3');
    });

    it('should pin the stroke of bare lucide icons to the rendered pixel at every size', () => {
        const { container } = render(
            <RingIconDefaults>
                <Save data-testid="ds-20" />
                <Save data-testid="ds-32" size={32} />
            </RingIconDefaults>,
        );

        for (const testId of ['ds-20', 'ds-32']) {
            const svg = container.querySelector(`[data-testid="${testId}"]`);

            // Same nominal width at both sizes; `vector-effect` is what holds it at 1.5 rendered
            // pixels, which only a real layout engine can measure.
            expect(svg?.getAttribute('stroke-width')).toBe(String(DEFAULT_LUCIDE_STROKE_WIDTH));
            expect(svg?.querySelector('path')?.getAttribute('vector-effect')).toBe('non-scaling-stroke');
        }
    });

    it('should pin the stroke of the custom icons the same way', () => {
        const { container } = render(
            <RingIconDefaults>
                <EarthOff data-testid="custom" />
            </RingIconDefaults>,
        );

        const svg = container.querySelector('[data-testid="custom"]');

        expect(svg?.getAttribute('stroke-width')).toBe(String(DEFAULT_LUCIDE_STROKE_WIDTH));
        expect(svg?.querySelector('path')?.getAttribute('vector-effect')).toBe('non-scaling-stroke');
    });

    it('should give bare lucide icons the design system size, while an explicit size still wins', () => {
        const { container } = render(
            <RingIconDefaults>
                <Save data-testid="default-size" />
                <Save data-testid="own-size" size={28} />
            </RingIconDefaults>,
        );

        expect(container.querySelector('[data-testid="default-size"]')?.getAttribute('width')).toBe(
            String(DEFAULT_LUCIDE_ICON_SIZE),
        );
        expect(container.querySelector('[data-testid="own-size"]')?.getAttribute('width')).toBe('28');
    });
});
