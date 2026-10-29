import { vi, describe, it, expect } from 'vitest';
import { fireEvent, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { Video } from 'lucide-react';
import { SvgIcon } from '@mui/material';
import { MediaCard, MediaCardProps } from '../../../src/components/Organisms/MediaCard/MediaCard.js';
import { RingLucideIcon } from '../../../src/helpers/RingLucideIcon.js';
import { renderWithTheme } from '../../test-utils/theme.js';

describe('MediaCard common tests:', () => {
    const props: MediaCardProps = {
        sx: { width: '275px' },
        fields: [
            { value: 'www.onet.pl' },
            { value: 'Najnowsze informacje na temat protestów w stolicy' },
            { value: 'Aktualizowane na bieżąco z najnowszymi wiadomościami' },
        ],
    };

    it('Should render correctly', () => {
        const { container } = renderWithTheme(<MediaCard {...props} />);
        expect(container).toMatchSnapshot();
    });

    it('Should not display the actions button if no actions are defined', () => {
        const { queryByTestId } = renderWithTheme(<MediaCard {...props} />);
        const actionButton = queryByTestId('more-actions');

        expect(actionButton).toBeNull();
    });

    it('names the actions button "More actions" by default', () => {
        const { getByRole } = renderWithTheme(<MediaCard {...props} actions={[{ label: 'See more' }]} />);

        expect(getByRole('button', { name: 'More actions' })).toBeTruthy();
    });

    it('takes the actions button name from actionsAriaLabel', () => {
        const { getByRole } = renderWithTheme(
            <MediaCard {...props} actions={[{ label: 'See more' }]} actionsAriaLabel="Card options" />,
        );

        expect(getByRole('button', { name: 'Card options' })).toBeTruthy();
    });

    it('falls back to "More actions" when actionsAriaLabel is blank', () => {
        const { getByRole } = renderWithTheme(
            <MediaCard {...props} actions={[{ label: 'See more' }]} actionsAriaLabel=" " />,
        );

        expect(getByRole('button', { name: 'More actions' })).toBeTruthy();
    });

    it('Should display the actions button if actions are defined', () => {
        const { queryByTestId } = renderWithTheme(<MediaCard {...props} actions={[{ label: 'See more' }]} />);
        const actionButton = queryByTestId('ring-mediacard-actions');

        expect(actionButton).not.toBeNull();
    });

    it('does not run the card onClick when its actions menu is dismissed by a click beside it', async () => {
        const user = userEvent.setup();
        const onClick = vi.fn();
        const { getByRole, queryByRole } = renderWithTheme(
            <MediaCard {...props} onClick={onClick} actions={[{ label: 'See more' }]} />,
        );

        await user.click(getByRole('button', { name: 'More actions' }));
        await user.click(document.querySelector('.MuiBackdrop-root') as Element);

        await waitFor(() => expect(queryByRole('menu')).toBeNull());
        expect(onClick).not.toHaveBeenCalled();
    });
});

describe('MediaCard media source tests:', () => {
    it('Should render info placeholder when no src is provided', () => {
        const { container } = renderWithTheme(<MediaCard />);

        const placeholderDefaultIconElement = container.querySelector('svg.lucide-image');
        expect(placeholderDefaultIconElement).not.toBeNull();
    });

    it.each([null, false])('leaves the frame empty when iconPlaceholder is %s', (iconPlaceholder) => {
        const { container } = renderWithTheme(<MediaCard iconPlaceholder={iconPlaceholder} />);

        expect(container.querySelector('.ring-featuredicon')).toBeNull();
        expect(container.querySelector('svg')).toBeNull();
    });

    it('sizes every supported placeholder icon through its plate', () => {
        const { container } = renderWithTheme(
            <>
                <MediaCard iconPlaceholder={<Video data-testid="bare-icon" />} />
                <MediaCard
                    iconPlaceholder={
                        <SvgIcon data-testid="mui-icon">
                            <path d="M0 0h24v24H0z" />
                        </SvgIcon>
                    }
                />
                <MediaCard iconPlaceholder={<RingLucideIcon icon={Video} data-testid="ring-icon" />} />
            </>,
        );

        const bareIcon = container.querySelector('[data-testid="bare-icon"]');
        const muiIcon = container.querySelector('[data-testid="mui-icon"]');
        const ringIcon = container.querySelector('[data-testid="ring-icon"]');

        expect(bareIcon?.getAttribute('stroke')).toBe('currentColor');
        expect(bareIcon?.parentElement?.className).toContain('MuiBox-root');
        expect(getComputedStyle(ringIcon?.querySelector('svg') as SVGElement).width).toBe('1em');
        expect(document.head.textContent).toContain('font-size:inherit!important');

        // The wrapper inherits; the FeaturedIcon plate around it carries the glyph size — 20cqmin, 40% of a plate
        // that is half the frame's shorter side — and is 2.5 times as wide as the glyph.
        for (const icon of [bareIcon, muiIcon, ringIcon]) {
            const wrapper = icon?.parentElement as HTMLElement;
            const plate = wrapper.parentElement as HTMLElement;

            expect(getComputedStyle(wrapper).fontSize).toBe('inherit');
            expect(getComputedStyle(plate).fontSize).toBe('clamp(16px, 20cqmin, 48px)');
            expect(getComputedStyle(plate).width).toBe('2.5em');
            expect(getComputedStyle(plate).borderRadius).toBe('50%');
        }
    });

    it('Should not render info placeholder when image is provided', () => {
        const { container } = renderWithTheme(<MediaCard image="image-mock.jpeg" />);

        expect(container.querySelector('svg.lucide-image')).toBeNull();
    });

    it('Should display image when image is provided', () => {
        const { getByRole } = renderWithTheme(<MediaCard image="image-mock.jpeg" title="Test image" />);

        getByRole('img');
    });

    it('Should display image when src is provided by slotProps.cardMedia', () => {
        const { getByRole } = renderWithTheme(
            <MediaCard title="Test image" slotProps={{ cardMedia: { src: 'image-mock.jpeg' } }} />,
        );

        getByRole('img');
    });
});

describe('MediaCard onClick test:', () => {
    it('Calls onClick when MediaCard was clicked', () => {
        const mockOnClick = vi.fn();
        const { getByTestId } = renderWithTheme(<MediaCard onClick={mockOnClick} />);

        const mediaCard = getByTestId('ring-mediacard');
        fireEvent.click(mediaCard);

        expect(mockOnClick).toHaveBeenCalledTimes(1);
    });
});

describe('MediaCard with slots for media presentation:', () => {
    it('Should render correctly slot for "mediaCard"', () => {
        const slots = { mediaCard: <div data-testid="media-slot">Media Slot</div> };

        const { getByTestId } = renderWithTheme(<MediaCard slots={slots} />);

        getByTestId('media-slot');
    });
});
