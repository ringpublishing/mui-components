import { describe, expect, it } from 'vitest';
import { getStringColor } from '@ringpublishing/mui-theme';

import { Avatar, type AvatarSize } from '../../../src/components/Atoms/Avatar/Avatar.js';
import { AvatarGroup } from '../../../src/components/Molecules/AvatarGroup/AvatarGroup.js';
import { getCreatedTheme } from '../../../src/theme/theme.js';
import { render, screen } from '../../test-utils/customRenderer.js';

// The browser writes `rgba(…, 1)` as `rgb(…)`; compare colours the way it reports them.
const asComputed = (color: string): string => {
    const probe = document.createElement('div');

    probe.style.color = color;

    return probe.style.color;
};

describe('Avatar', () => {
    it('shows the initials of the first and the last word, and is named after the person', () => {
        render(<Avatar name="Jan Maria Kowalski" />);

        const avatar = screen.getByRole('img', { name: 'Jan Maria Kowalski' });

        expect(avatar.textContent).toBe('JK');
    });

    it.each([
        ['Ewa', 'E'],
        ['  łucja   zielińska ', 'ŁZ'],
        ['𝒜da Lovelace', '𝒜L'],
        // Decomposed (NFD) letters, as some sources send Polish names.
        ['Świątek Łucja'.normalize('NFD'), 'ŚŁ'],
    ])('takes the initials of %j as %j', (name, initials) => {
        render(<Avatar name={name} />);

        expect(screen.getByTestId('ring-avatar').textContent).toBe(initials);
    });

    it('falls back to the default person glyph when the name has no letters', () => {
        render(<Avatar name="" />);

        expect(screen.getByTestId('ring-avatar').querySelector('svg')).not.toBeNull();
    });

    it('colours the initials from colorKey, or from the name without it', () => {
        const theme = getCreatedTheme('light');

        render(
            <>
                <Avatar name="Jan Kowalski" dataTestIdSuffix="by-name" />
                <Avatar name="Jan Kowalski" colorKey="u-6400" dataTestIdSuffix="by-key" />
            </>,
        );

        for (const [suffix, key] of [
            ['by-name', 'Jan Kowalski'],
            ['by-key', 'u-6400'],
        ]) {
            const { fill, fillText } = getStringColor(key, theme);
            const style = getComputedStyle(screen.getByTestId(`ring-avatar-${suffix}`));

            expect(style.backgroundColor).toBe(asComputed(fill));
            expect(style.color).toBe(asComputed(fillText));
        }
    });

    it.each(['', '   '])('colours the initials from the name when colorKey is %j', (colorKey) => {
        const { fill } = getStringColor('Jan Kowalski', getCreatedTheme('light'));

        render(<Avatar name="Jan Kowalski" colorKey={colorKey} />);

        expect(getComputedStyle(screen.getByTestId('ring-avatar')).backgroundColor).toBe(asComputed(fill));
    });

    it.each([
        ['small', '24px'],
        ['medium', '32px'],
        ['large', '40px'],
    ] as const)('is %s at %s', (size: AvatarSize, px) => {
        render(<Avatar name="Jan Kowalski" size={size} />);

        const style = getComputedStyle(screen.getByTestId('ring-avatar'));

        expect(style.width).toBe(px);
        expect(style.height).toBe(px);
    });

    it('is large by default', () => {
        render(<Avatar name="Jan Kowalski" />);

        expect(getComputedStyle(screen.getByTestId('ring-avatar')).width).toBe('40px');
    });

    it('shows the photo with the name as its alternative text', () => {
        render(<Avatar name="Jan Kowalski" src="https://example.com/jan.jpg" />);

        expect(screen.getByAltText('Jan Kowalski').getAttribute('src')).toBe('https://example.com/jan.jpg');
    });

    it('takes the size of the group it is in', () => {
        render(
            <AvatarGroup size="small">
                <Avatar name="Jan Kowalski" size="large" />
            </AvatarGroup>,
        );

        expect(getComputedStyle(screen.getByTestId('ring-avatar')).width).toBe('24px');
    });

    it('builds its test id from the suffix and lets dataTestId replace it', () => {
        render(
            <>
                <Avatar name="A" dataTestIdSuffix="owner" />
                <Avatar name="B" dataTestId="custom-avatar" />
            </>,
        );

        expect(screen.getByTestId('ring-avatar-owner')).not.toBeNull();
        expect(screen.getByTestId('custom-avatar')).not.toBeNull();
    });

    it('keeps the ring- class next to the one passed in', () => {
        render(<Avatar name="A" className="extra" />);

        expect(Array.from(screen.getByTestId('ring-avatar').classList)).toEqual(
            expect.arrayContaining(['ring-avatar', 'extra']),
        );
    });
});
