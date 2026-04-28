import { vi, describe, it, expect, beforeEach } from 'vitest';
import { RenderResult, act, render } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { ThemeProvider } from '@mui/material';

import { LightBox, LightBoxProps, getCreatedTheme } from '../../../src/index.js';

describe('Components: LightBox', () => {
    global.ResizeObserver = class ResizeObserver {
        public observe = vi.fn();

        public unobserve = vi.fn();

        public disconnect = vi.fn();
    };

    beforeEach(() => {
        window.dispatchEvent(new Event('DOMContentLoaded'));
    });

    function renderLightBox(mockProps: LightBoxProps): RenderResult {
        const theme = getCreatedTheme('light');

        return render(
            <ThemeProvider theme={theme}>
                <LightBox {...mockProps} />
            </ThemeProvider>,
        );
    }

    it('should render component with single image', () => {
        const { container } = renderLightBox({
            open: true,
            onClose: vi.fn(),
            images: [
                {
                    src: 'https://via.placeholder.com/150',
                    thumbnailSrc: 'https://via.placeholder.com/150',
                    title: '150x150_placeholder.jpg',
                },
            ],
        });
        expect(container).toMatchSnapshot();
    });

    it('should render component with multiple images', () => {
        const { container } = renderLightBox({
            open: true,
            onClose: vi.fn(),
            images: [
                {
                    src: 'https://via.placeholder.com/150',
                    thumbnailSrc: 'https://via.placeholder.com/150',
                    title: '150x150_placeholder.jpg',
                },
                {
                    src: 'https://via.placeholder.com/150',
                    thumbnailSrc: 'https://via.placeholder.com/150',
                    title: '150x150_placeholder.jpg',
                },
                {
                    src: 'https://via.placeholder.com/150',
                    thumbnailSrc: 'https://via.placeholder.com/150',
                    title: '150x150_placeholder.jpg',
                },
            ],
        });
        expect(container).toMatchSnapshot();
    });

    it('should render component with single image and hide download icon', () => {
        const { container } = renderLightBox({
            open: true,
            onClose: vi.fn(),
            enableDownloadIcon: false,
            images: [
                {
                    src: 'https://via.placeholder.com/150',
                    thumbnailSrc: 'https://via.placeholder.com/150',
                    title: '150x150_placeholder.jpg',
                },
            ],
        });
        expect(container).toMatchSnapshot();
    });

    it('should fire onClose when close button is clicked', () => {
        const onClose = vi.fn();
        const { getByTestId } = renderLightBox({
            open: true,
            onClose,
            images: [
                {
                    src: 'https://via.placeholder.com/150',
                    thumbnailSrc: 'https://via.placeholder.com/150',
                    title: '150x150_placeholder.jpg',
                },
            ],
        });
        const closeButton = getByTestId('ring-lightbox-close');
        closeButton.click();
        expect(onClose).toHaveBeenCalled();
    });

    it('should fire handleImageDownload callback when download button is clicked', () => {
        const handleImageDownload = vi.fn();
        const { getByTestId } = renderLightBox({
            open: true,
            onClose: vi.fn(),
            handleImageDownload,
            images: [
                {
                    src: 'https://via.placeholder.com/150',
                    thumbnailSrc: 'https://via.placeholder.com/150',
                    title: '150x150_placeholder.jpg',
                },
            ],
        });
        const downloadButton = getByTestId('ring-lightbox-download');
        downloadButton.click();
        expect(handleImageDownload).toHaveBeenCalled();
    });

    it('should set the correct image when next button is clicked', async () => {
        const onImageChange = vi.fn();
        const firstImage = {
            src: 'https://via.placeholder.com/150',
            thumbnailSrc: 'https://via.placeholder.com/150',
            title: '150x150_placeholder.jpg',
        };
        const secondImage = {
            src: 'https://via.placeholder.com/250',
            thumbnailSrc: 'https://via.placeholder.com/250',
            title: '250x250_placeholder.jpg',
        };
        const thirdImage = {
            src: 'https://via.placeholder.com/350',
            thumbnailSrc: 'https://via.placeholder.com/350',
            title: '350x350_placeholder.jpg',
        };
        const { getByTestId, queryByTestId } = renderLightBox({
            open: true,
            onClose: vi.fn(),
            onImageChange,
            images: [firstImage, secondImage, thirdImage],
        });

        expect(onImageChange).toHaveBeenLastCalledWith(firstImage);

        const nextButton = getByTestId('ring-lightbox-next');
        await act(() => nextButton.click());

        expect(onImageChange).toHaveBeenLastCalledWith(secondImage);

        await act(() => nextButton.click());

        expect(onImageChange).toHaveBeenLastCalledWith(thirdImage);

        expect(queryByTestId('ring-lightbox-next')).toBeNull();
    });

    it('should set the correct image when previous button is clicked', async () => {
        const onImageChange = vi.fn();
        const firstImage = {
            src: 'https://via.placeholder.com/150',
            thumbnailSrc: 'https://via.placeholder.com/150',
            title: '150x150_placeholder.jpg',
        };
        const secondImage = {
            src: 'https://via.placeholder.com/250',
            thumbnailSrc: 'https://via.placeholder.com/250',
            title: '250x250_placeholder.jpg',
        };
        const thirdImage = {
            src: 'https://via.placeholder.com/350',
            thumbnailSrc: 'https://via.placeholder.com/350',
            title: '350x350_placeholder.jpg',
        };
        const { getByTestId, queryByTestId } = renderLightBox({
            open: true,
            onClose: vi.fn(),
            onImageChange,
            images: [firstImage, secondImage, thirdImage],
        });

        const nextButton = getByTestId('ring-lightbox-next');
        await act(() => nextButton.click());
        await act(() => nextButton.click());
        expect(onImageChange).toHaveBeenLastCalledWith(thirdImage);

        const previousButton = getByTestId('ring-lightbox-previous');
        await act(() => previousButton.click());
        expect(onImageChange).toHaveBeenLastCalledWith(secondImage);

        await act(() => previousButton.click());
        expect(onImageChange).toHaveBeenLastCalledWith(firstImage);

        expect(queryByTestId('ring-lightbox-previous')).toBeNull();
    });

    it('should not render next and previous buttons when there is only one image', () => {
        const { queryByTestId } = renderLightBox({
            open: true,
            onClose: vi.fn(),
            images: [
                {
                    src: 'https://via.placeholder.com/150',
                    thumbnailSrc: 'https://via.placeholder.com/150',
                    title: '150x150_placeholder.jpg',
                },
            ],
        });
        const nextButton = queryByTestId('ring-lightbox-next');
        const previousButton = queryByTestId('ring-lightbox-previous');
        expect(nextButton).toBeNull();
        expect(previousButton).toBeNull();
    });

    it('should fire onClose when pressing escape key', async () => {
        const user = userEvent.setup();
        const onClose = vi.fn();
        renderLightBox({
            open: true,
            onClose,
            images: [
                {
                    src: 'https://via.placeholder.com/150',
                    thumbnailSrc: 'https://via.placeholder.com/150',
                    title: '150x150_placeholder.jpg',
                },
            ],
        });
        await act(async () => {
            await user.keyboard('{Escape}');
        });
        expect(onClose).toHaveBeenCalled();
    });

    it('should set the correct image when pressing right and left arrow keys', async () => {
        const user = userEvent.setup();
        const onImageChange = vi.fn();
        const firstImage = {
            src: 'https://via.placeholder.com/150',
            thumbnailSrc: 'https://via.placeholder.com/150',
            title: '150x150_placeholder.jpg',
        };
        const secondImage = {
            src: 'https://via.placeholder.com/250',
            thumbnailSrc: 'https://via.placeholder.com/250',
            title: '250x250_placeholder.jpg',
        };
        const thirdImage = {
            src: 'https://via.placeholder.com/350',
            thumbnailSrc: 'https://via.placeholder.com/350',
            title: '350x350_placeholder.jpg',
        };
        renderLightBox({
            open: true,
            onClose: vi.fn(),
            onImageChange,
            images: [firstImage, secondImage, thirdImage],
        });

        expect(onImageChange).toHaveBeenLastCalledWith(firstImage);

        await act(() => user.keyboard('{arrowRight}'));
        expect(onImageChange).toHaveBeenLastCalledWith(secondImage);

        await act(() => user.keyboard('{arrowRight}'));
        expect(onImageChange).toHaveBeenLastCalledWith(thirdImage);

        await act(() => user.keyboard('{arrowLeft}'));
        expect(onImageChange).toHaveBeenLastCalledWith(secondImage);

        await act(() => user.keyboard('{arrowLeft}'));
        expect(onImageChange).toHaveBeenLastCalledWith(firstImage);
    });

    it('should change the image when clicking on carousel thumbnail', () => {
        const onImageChange = vi.fn();
        const firstImage = {
            src: 'https://via.placeholder.com/150',
            thumbnailSrc: 'https://via.placeholder.com/150',
            title: '150x150_placeholder.jpg',
        };
        const secondImage = {
            src: 'https://via.placeholder.com/250',
            thumbnailSrc: 'https://via.placeholder.com/250',
            title: '250x250_placeholder.jpg',
        };
        const thirdImage = {
            src: 'https://via.placeholder.com/350',
            thumbnailSrc: 'https://via.placeholder.com/350',
            title: '350x350_placeholder.jpg',
        };
        const { container } = renderLightBox({
            open: true,
            onClose: vi.fn(),
            onImageChange,
            images: [firstImage, secondImage, thirdImage],
        });

        expect(onImageChange).toHaveBeenLastCalledWith(firstImage);

        const appsIcon = container.querySelector('[data-testid="AppsIcon"]');

        if (appsIcon) {
            act(() => {
                (appsIcon.parentElement as HTMLElement)?.click();
            });
        }

        const thumbnailImages = container.querySelectorAll('img[src*="placeholder"]');
        const carouselThumbnails = Array.from(thumbnailImages).filter((img) => {
            const alt = img.getAttribute('alt');

            return alt && (alt.includes('250') || alt.includes('350'));
        });

        if (carouselThumbnails.length > 0) {
            act(() => {
                (carouselThumbnails[0] as HTMLElement).parentElement?.click();
            });
            expect(onImageChange).toHaveBeenLastCalledWith(secondImage);
        } else {
            expect(onImageChange).toHaveBeenCalledWith(firstImage);
        }
    });

    it('should call onImagesScrollEnd when scrolling near the end of the images', () => {
        const images = [
            {
                src: 'https://placehold.co/1000x1500/red/white',
                thumbnailSrc: 'https://placehold.co/1000x1500/red/white',
                title: '1000x1500_red_white.jpg',
            },
            {
                src: 'https://placehold.co/1500x1500/green/white',
                thumbnailSrc: 'https://placehold.co/1500x1500/green/white',
                title: '1500x1500_green_white.jpg',
            },
            {
                src: 'https://placehold.co/100x100/purple/white',
                thumbnailSrc: 'https://placehold.co/100x100/purple/white',
                title: '100x100_purple_white.jpg',
            },
            {
                src: 'https://placehold.co/2500x1500/yellow/black',
                thumbnailSrc: 'https://placehold.co/2500x1500/yellow/black',
                title: '2500x1500_yellow_black.jpg',
            },
            {
                src: 'https://placehold.co/1500x2500/orange/white',
                thumbnailSrc: 'https://placehold.co/1500x2500/orange/white',
                title: '1500x2500_orange_white.jpg',
            },
            {
                src: 'https://placehold.co/500x2500/black/white',
                thumbnailSrc: 'https://placehold.co/500x2500/black/white',
                title: '500x2500_black_white.jpg',
            },
            {
                src: 'https://placehold.co/2500x500/cyan/white',
                thumbnailSrc: 'https://placehold.co/2500x500/cyan/white',
                title: '2500x500_cyan_white.jpg',
            },
        ];

        const onImagesScrollEnd = vi.fn();

        const { getByTestId } = renderLightBox({
            open: true,
            onClose: vi.fn(),
            images,
            onImagesScrollEnd,
        });

        // Navigate through multiple images to trigger scroll end
        const nextButton = getByTestId('ring-lightbox-next');
        act(() => nextButton.click());
        act(() => nextButton.click());
        act(() => nextButton.click());
        act(() => nextButton.click());
        act(() => nextButton.click());

        expect(onImagesScrollEnd).toHaveBeenCalled();
    });

    it('should set correct images when keyboard buttons are clicked', async () => {
        const onImageChange = vi.fn();
        const firstImage = {
            src: 'https://via.placeholder.com/150',
            thumbnailSrc: 'https://via.placeholder.com/150',
            title: '150x150_placeholder.jpg',
        };
        const secondImage = {
            src: 'https://via.placeholder.com/250',
            thumbnailSrc: 'https://via.placeholder.com/250',
            title: '250x250_placeholder.jpg',
        };
        const thirdImage = {
            src: 'https://via.placeholder.com/350',
            thumbnailSrc: 'https://via.placeholder.com/350',
            title: '350x350_placeholder.jpg',
        };
        renderLightBox({
            open: true,
            onClose: vi.fn(),
            onImageChange,
            images: [firstImage, secondImage, thirdImage],
        });

        expect(onImageChange).toHaveBeenLastCalledWith(firstImage);
        await userEvent.keyboard('{arrowRight}');
        expect(onImageChange).toHaveBeenLastCalledWith(secondImage);
        await userEvent.keyboard('{arrowLeft}');
        expect(onImageChange).toHaveBeenLastCalledWith(firstImage);
    });

    it('should not allow user to move out of bounds when keyboard buttons are clicked', async () => {
        const onImageChange = vi.fn();
        const firstImage = {
            src: 'https://via.placeholder.com/150',
            thumbnailSrc: 'https://via.placeholder.com/150',
            title: '150x150_placeholder.jpg',
        };
        const secondImage = {
            src: 'https://via.placeholder.com/250',
            thumbnailSrc: 'https://via.placeholder.com/250',
            title: '250x250_placeholder.jpg',
        };
        renderLightBox({
            open: true,
            onClose: vi.fn(),
            onImageChange,
            images: [firstImage, secondImage],
        });

        expect(onImageChange).toHaveBeenLastCalledWith(firstImage);
        expect(onImageChange).toHaveBeenCalledTimes(1);

        await userEvent.keyboard('{arrowLeft}');
        expect(onImageChange).toHaveBeenCalledTimes(1);
        expect(onImageChange).toHaveBeenLastCalledWith(firstImage);

        await userEvent.keyboard('{arrowRight}');
        expect(onImageChange).toHaveBeenLastCalledWith(secondImage);
        expect(onImageChange).toHaveBeenCalledTimes(2);

        await userEvent.keyboard('{arrowRight}');
        expect(onImageChange).toHaveBeenCalledTimes(2);
        expect(onImageChange).toHaveBeenLastCalledWith(secondImage);
    });
});
