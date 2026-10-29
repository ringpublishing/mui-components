import { describe, expect, it } from 'vitest';
import { LucideProvider } from 'lucide-react';
import { AIPencil } from '../../src/icons/AiPencil.js';
import { render } from '../test-utils/customRenderer.js';

describe('custom Lucide icons', () => {
    it('hides a decorative icon from assistive technologies', () => {
        const { container } = render(<AIPencil />);

        expect(container.querySelector('svg')?.getAttribute('aria-hidden')).toBe('true');
    });

    it('preserves explicit accessibility semantics', () => {
        const { container } = render(<AIPencil aria-label="AI edit" />);

        const icon = container.querySelector('svg');

        expect(icon?.getAttribute('aria-hidden')).toBeNull();
        expect(icon?.getAttribute('aria-label')).toBe('AI edit');
    });

    it('preserves role and accessible name semantics', () => {
        const { container } = render(<AIPencil role="img" aria-label="AI edit" />);

        const icon = container.querySelector('svg');

        expect(icon?.getAttribute('aria-hidden')).toBeNull();
        expect(icon?.getAttribute('role')).toBe('img');
        expect(icon?.getAttribute('aria-label')).toBe('AI edit');
    });

    it('uses Lucide provider defaults for custom icons', () => {
        const { container } = render(
            <LucideProvider size={32} color="rebeccapurple" className="provider-icon">
                <AIPencil />
            </LucideProvider>,
        );

        const icon = container.querySelector('svg');

        expect(icon?.getAttribute('width')).toBe('32');
        expect(icon?.getAttribute('height')).toBe('32');
        expect(icon?.getAttribute('stroke')).toBe('rebeccapurple');
        expect(icon?.classList).toContain('provider-icon');
    });
});

describe('custom Lucide icons — absoluteStrokeWidth under RingIconDefaults', () => {
    // ThemeConfig mounts RingIconDefaults, so the context asks for a non-scaling 1.5px stroke.
    it('pins the stroke with non-scaling-stroke when no absoluteStrokeWidth is given', () => {
        const { container } = render(<AIPencil size={32} />);
        const path = container.querySelector('svg path');

        expect(container.querySelector('svg')?.getAttribute('stroke-width')).toBe('1.5');
        expect(path?.getAttribute('vector-effect')).toBe('non-scaling-stroke');
    });

    it('drops the non-scaling stroke from context when absoluteStrokeWidth compensates already', () => {
        const { container } = render(<AIPencil size={32} absoluteStrokeWidth={true} />);
        const svg = container.querySelector('svg');

        // 1.5 * 24 / 32 in viewBox units, scaled back up to 1.5px by the 32px box.
        expect(svg?.getAttribute('stroke-width')).toBe('1.125');
        expect(svg?.querySelector('[vector-effect]')).toBeNull();
    });

    it('still honours an explicit nonScalingStroke next to absoluteStrokeWidth', () => {
        const { container } = render(<AIPencil size={32} absoluteStrokeWidth={true} nonScalingStroke={true} />);

        expect(container.querySelector('svg path')?.getAttribute('vector-effect')).toBe('non-scaling-stroke');
    });
});
