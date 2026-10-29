import React from 'react';
import { describe, expect, it } from 'vitest';
import { SvgIcon, ThemeProvider, alpha, createTheme, useTheme, type Theme } from '@mui/material';
import { ImageOff, Sparkles, type LucideIcon } from 'lucide-react';

import { FeaturedIcon, type FeaturedIconColor } from '../../../src/components/Atoms/FeaturedIcon/FeaturedIcon.js';
import { RingLucideIcon } from '../../../src/helpers/RingLucideIcon.js';
import { render, screen } from '../../test-utils/customRenderer.js';

const rootOf = (suffix?: string): HTMLElement =>
    screen.getByTestId(suffix ? `ring-featuredicon-${suffix}` : 'ring-featuredicon');
const plateOf = (root: HTMLElement): HTMLElement => root.firstElementChild as HTMLElement;

// jsdom does not compute `stroke-width` and keeps declared values, so rules are read from the element's own class.
const ruleOf = (element: Element, selector: string): string => {
    const className = Array.from(element.classList).find((name) => name.startsWith('css-')) ?? '';
    const css = document.head.textContent ?? '';
    const start = css.indexOf(`.${className}${selector}{`);

    return start < 0 ? '' : css.slice(start, css.indexOf('}', start));
};

const GLYPH_RULE = ' svg:not(.ring-gradient-definition)';

// The browser writes `rgba(…, 1)` as `rgb(…)`; compare colours the way it reports them.
const asComputed = (color: string): string => {
    const probe = document.createElement('div');

    probe.style.color = color;

    return probe.style.color;
};

describe('FeaturedIcon', () => {
    it('renders a lucide glyph on a circular plate 2.5 times its size', () => {
        render(<FeaturedIcon icon={ImageOff} />);

        const root = rootOf();
        const plate = plateOf(root);

        expect(root.className).toContain('ring-featuredicon');
        expect(root.querySelector('svg.lucide-image-off')).not.toBeNull();
        expect(getComputedStyle(plate).borderRadius).toBe('50%');
        expect(getComputedStyle(plate).width).toBe('2.5em');
        expect(getComputedStyle(plate).height).toBe('2.5em');
        expect(plate.getAttribute('aria-hidden')).toBe('true');
    });

    it('is medium by default: a 60 px plate with a 24 px glyph and the usual stroke', () => {
        render(<FeaturedIcon icon={ImageOff} />);

        const root = rootOf();

        expect(getComputedStyle(root).width).toBe('60px');
        expect(getComputedStyle(root).height).toBe('60px');
        expect(getComputedStyle(plateOf(root)).fontSize).toBe('24px');
        expect(ruleOf(plateOf(root), GLYPH_RULE)).not.toContain('stroke-width');
    });

    it('takes the fixed sizes small 40 / large 80, with a 1 px stroke only under a 24 px glyph', () => {
        render(
            <>
                <FeaturedIcon icon={ImageOff} size="small" dataTestIdSuffix="small" />
                <FeaturedIcon icon={ImageOff} size="large" dataTestIdSuffix="large" />
            </>,
        );

        const small = rootOf('small');
        const large = rootOf('large');

        expect(getComputedStyle(small).width).toBe('40px');
        expect(getComputedStyle(plateOf(small)).fontSize).toBe('16px');
        expect(ruleOf(plateOf(small), GLYPH_RULE)).toContain('stroke-width:1px');
        expect(getComputedStyle(large).width).toBe('80px');
        expect(getComputedStyle(plateOf(large)).fontSize).toBe('32px');
        expect(ruleOf(plateOf(large), GLYPH_RULE)).not.toContain('stroke-width');
    });

    it('with size="inherit" fills its box and takes half of its shorter side, 40–120 px', () => {
        render(<FeaturedIcon icon={ImageOff} size="inherit" />);

        const root = rootOf();

        expect(getComputedStyle(root).containerType).toBe('size');
        expect(getComputedStyle(root).minHeight).toBe('40px');
        expect(getComputedStyle(root).minWidth).toBe('40px');
        expect(getComputedStyle(plateOf(root)).fontSize).toBe('clamp(16px, 20cqmin, 48px)');
        expect(document.head.textContent).toContain('@container (max-width: 119.98px) or (max-height: 119.98px)');
    });

    it('colours the plate and the glyph by `color`, from the hover opacity where the theme has no fill', () => {
        let theme: Theme | undefined;

        function Probe(): null {
            theme = useTheme();

            return null;
        }

        render(
            <>
                <Probe />
                <FeaturedIcon icon={ImageOff} dataTestIdSuffix="default" />
                <FeaturedIcon icon={ImageOff} color="error" dataTestIdSuffix="error" />
            </>,
        );

        const palette = (theme as Theme).palette;

        expect(getComputedStyle(plateOf(rootOf('default'))).color).toBe(asComputed(palette.action.active));
        expect(getComputedStyle(plateOf(rootOf('error'))).color).toBe(asComputed(palette.error.main));
        expect(getComputedStyle(plateOf(rootOf('error'))).backgroundColor).toBe(
            asComputed(alpha(palette.error.main, palette.action.hoverOpacity)),
        );
    });

    it('reads the plate fills and a partial sizing rule from the theme', () => {
        function WithFeaturedIconTheme({ children }: { children: React.ReactNode }): React.JSX.Element {
            const parent = useTheme();
            const theme = createTheme(parent, {
                palette: { components: { featuredIcon: { primaryFill: 'rgb(1, 2, 3)' } } },
                featuredIcon: { sizes: { medium: 50 } },
            });

            return <ThemeProvider theme={theme}>{children}</ThemeProvider>;
        }

        render(
            <WithFeaturedIconTheme>
                <FeaturedIcon icon={ImageOff} color="primary" />
            </WithFeaturedIconTheme>,
        );

        const root = rootOf();

        expect(getComputedStyle(plateOf(root)).backgroundColor).toBe('rgb(1, 2, 3)');
        expect(getComputedStyle(root).width).toBe('50px');
        expect(getComputedStyle(plateOf(root)).fontSize).toBe('20px');
    });

    it('sizes a ready element such as an MUI icon, and leaves the AI gradient definition out of the glyph rule', () => {
        render(
            <>
                <FeaturedIcon
                    dataTestIdSuffix="mui"
                    icon={
                        <SvgIcon data-testid="mui-glyph">
                            <path d="M0 0h24v24H0z" />
                        </SvgIcon>
                    }
                />
                <FeaturedIcon dataTestIdSuffix="ai" icon={<RingLucideIcon icon={Sparkles} color="ai" />} />
            </>,
        );

        const definition = rootOf('ai').querySelector('svg.ring-gradient-definition');

        expect(screen.getByTestId('mui-glyph')).toBeDefined();
        expect(ruleOf(plateOf(rootOf('mui')), GLYPH_RULE)).toContain('font-size:inherit');
        expect(definition).not.toBeNull();
        expect(definition?.matches('svg:not(.ring-gradient-definition)')).toBe(false);
    });

    it('sizes a RingLucideIcon element like a lucide icon passed as a component', () => {
        render(<FeaturedIcon icon={<RingLucideIcon icon={Sparkles} />} size="large" />);

        const plate = plateOf(rootOf());

        expect(getComputedStyle(plate).fontSize).toBe('32px');
        expect(ruleOf(plate, '>.ring-lucide-icon')).toContain('font-size:inherit');
    });

    it('falls back to the default colours for a colour the palette lacks, instead of failing', () => {
        let theme: Theme | undefined;

        function Probe(): null {
            theme = useTheme();

            return null;
        }

        render(
            <>
                <Probe />
                <FeaturedIcon icon={ImageOff} color={'unknown' as FeaturedIconColor} />
            </>,
        );

        const palette = (theme as Theme).palette;
        const plate = plateOf(rootOf());

        expect(getComputedStyle(plate).color).toBe(asComputed(palette.action.active));
        expect(getComputedStyle(plate).backgroundColor).toBe(asComputed(palette.action.hover));
    });

    it('applies plate styles from slot props over its own', () => {
        render(<FeaturedIcon icon={ImageOff} slotProps={{ plate: { sx: { backgroundColor: 'rgb(1, 2, 3)' } } }} />);

        expect(getComputedStyle(plateOf(rootOf())).backgroundColor).toBe('rgb(1, 2, 3)');
    });

    it('renders an empty plate when no icon is passed, instead of failing', () => {
        render(<FeaturedIcon icon={undefined as unknown as LucideIcon} />);

        const plate = plateOf(rootOf());

        expect(getComputedStyle(plate).borderRadius).toBe('50%');
        expect(plate.querySelector('svg')).toBeNull();
    });

    it('appends the data test id suffix', () => {
        render(<FeaturedIcon icon={ImageOff} dataTestIdSuffix="Gallery" />);

        expect(screen.getByTestId('ring-featuredicon-gallery')).toBeDefined();
    });
});
