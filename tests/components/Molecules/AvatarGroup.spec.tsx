import { describe, expect, it } from 'vitest';
import { getStringColor } from '@ringpublishing/mui-theme';

import { Avatar } from '../../../src/components/Atoms/Avatar/Avatar.js';
import { AvatarGroup } from '../../../src/components/Molecules/AvatarGroup/AvatarGroup.js';
import { getCreatedTheme } from '../../../src/theme/theme.js';
import { render, screen } from '../../test-utils/customRenderer.js';

const PEOPLE = ['Jan Kowalski', 'Anna Nowak', 'Piotr Wiśniewski', 'Maria Wójcik', 'Tomasz Lewandowski'];

const asComputed = (color: string): string => {
    const probe = document.createElement('div');

    probe.style.color = color;

    return probe.style.color;
};

const surplusOf = (): HTMLElement => {
    const surplus = screen.getByTestId('ring-avatargroup').querySelector('.MuiAvatarGroup-avatar:not(.ring-avatar)');

    if (!(surplus instanceof HTMLElement)) {
        throw new Error('No counter rendered');
    }

    return surplus;
};

describe('AvatarGroup', () => {
    it('renders every avatar when they fit in max', () => {
        render(
            <AvatarGroup>
                {PEOPLE.map((name) => (
                    <Avatar key={name} name={name} />
                ))}
            </AvatarGroup>,
        );

        expect(screen.getAllByTestId('ring-avatar')).toHaveLength(5);
        expect(screen.getByTestId('ring-avatargroup').querySelector('.MuiAvatarGroup-avatar:not(.ring-avatar)')).toBe(
            null,
        );
    });

    it('replaces the rest with a counter named by surplusAriaLabel', () => {
        render(
            <AvatarGroup max={3} surplusAriaLabel={(count): string => `${count} more people`}>
                {PEOPLE.map((name) => (
                    <Avatar key={name} name={name} />
                ))}
            </AvatarGroup>,
        );

        expect(screen.getAllByTestId('ring-avatar')).toHaveLength(2);
        expect(surplusOf().querySelector('[aria-hidden="true"]')?.textContent).toBe('+3');
        expect(screen.getByText('3 more people')).not.toBeNull();
    });

    it('names the counter "N more" by default and counts total beyond the rendered avatars', () => {
        render(
            <AvatarGroup total={10}>
                {PEOPLE.slice(0, 3).map((name) => (
                    <Avatar key={name} name={name} />
                ))}
            </AvatarGroup>,
        );

        expect(surplusOf().querySelector('[aria-hidden="true"]')?.textContent).toBe('+7');
        expect(screen.getByText('7 more')).not.toBeNull();
    });

    it.each([
        ['small', '24px'],
        ['medium', '32px'],
        ['large', '40px'],
    ] as const)('sizes the avatars and the counter %s at %s', (size, px) => {
        render(
            <AvatarGroup size={size} max={2}>
                {PEOPLE.map((name) => (
                    <Avatar key={name} name={name} />
                ))}
            </AvatarGroup>,
        );

        expect(getComputedStyle(screen.getByTestId('ring-avatar')).width).toBe(px);
        expect(getComputedStyle(surplusOf()).width).toBe(px);
    });

    it('overlaps neighbouring avatars by 6px', () => {
        render(
            <AvatarGroup>
                {PEOPLE.slice(0, 3).map((name) => (
                    <Avatar key={name} name={name} />
                ))}
            </AvatarGroup>,
        );

        expect(screen.getByTestId('ring-avatargroup').style.getPropertyValue('--AvatarGroup-spacing')).toBe('-6px');
    });

    it('keeps 2px of padding on every side of the group', () => {
        render(
            <AvatarGroup>
                {PEOPLE.slice(0, 3).map((name) => (
                    <Avatar key={name} name={name} />
                ))}
            </AvatarGroup>,
        );

        const style = getComputedStyle(screen.getByTestId('ring-avatargroup'));

        expect([style.paddingTop, style.paddingRight, style.paddingBottom, style.paddingLeft]).toEqual([
            '2px',
            '2px',
            '2px',
            '2px',
        ]);
    });

    it('draws the counter in the neutral avatar colour', () => {
        const { fill, fillText } = getStringColor('', getCreatedTheme('light'));

        render(
            <AvatarGroup max={2}>
                {PEOPLE.map((name) => (
                    <Avatar key={name} name={name} />
                ))}
            </AvatarGroup>,
        );

        const style = getComputedStyle(surplusOf());

        expect(style.backgroundColor).toBe(asComputed(fill));
        expect(style.color).toBe(asComputed(fillText));
    });

    it('builds its test id from the suffix and lets dataTestId replace it', () => {
        render(
            <>
                <AvatarGroup dataTestIdSuffix="team">
                    <Avatar name="A" />
                </AvatarGroup>
                <AvatarGroup dataTestId="custom-group">
                    <Avatar name="B" />
                </AvatarGroup>
            </>,
        );

        expect(screen.getByTestId('ring-avatargroup-team').classList.contains('ring-avatargroup')).toBe(true);
        expect(screen.getByTestId('custom-group')).not.toBeNull();
    });
});
