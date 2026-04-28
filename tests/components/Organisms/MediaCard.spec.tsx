import { vi, describe, it, expect } from 'vitest';
import { fireEvent } from '@testing-library/react';
import { MediaCard, MediaCardProps } from '../../../src/components/Organisms/MediaCard/MediaCard.js';
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

    it('Should display the actions button if actions are defined', () => {
        const { queryByTestId } = renderWithTheme(<MediaCard {...props} actions={[{ label: 'See more' }]} />);
        const actionButton = queryByTestId('ring-mediacard-actions');

        expect(actionButton).not.toBeNull();
    });
});

describe('MediaCard media source tests:', () => {
    it('Should render info placeholder when no src is provided', () => {
        const { getByTestId } = renderWithTheme(<MediaCard />);

        const placeholderDefaultIconElement = getByTestId('PhotoOutlinedIcon');
        expect(placeholderDefaultIconElement).not.toBeNull();
    });

    it('Should not render info placeholder when image is provided', () => {
        const { queryByTestId } = renderWithTheme(<MediaCard image="image-mock.jpeg" />);

        expect(queryByTestId('PhotoOutlinedIcon')).toBeNull();
    });

    it('Should display image when image is provided', () => {
        const { getByRole } = renderWithTheme(<MediaCard image="image-mock.jpeg" />);

        getByRole('img');
    });

    it('Should display image when src is provided by slotProps.cardMedia', () => {
        const { getByRole } = renderWithTheme(
            <MediaCard slotProps={{ cardMedia: { component: 'img', src: 'image-mock.jpeg' } }} />,
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
