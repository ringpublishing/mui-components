import { useEffect } from 'react';

const CAROUSEL_SCROLL_CHECK_DELAY = 100;

interface UseCarouselScrollCheckParams {
    open: boolean;
    enableCarousel: boolean;
    imagesLength: number;
    moreImagesLoading?: boolean;
    carouselRef: React.RefObject<HTMLDivElement | null>;
    onImagesScrollEnd?: () => void;
}

export function useCarouselScrollCheck({
    open,
    enableCarousel,
    imagesLength,
    moreImagesLoading,
    carouselRef,
    onImagesScrollEnd,
}: UseCarouselScrollCheckParams): void {
    useEffect(() => {
        if (!open || !enableCarousel || !onImagesScrollEnd || moreImagesLoading || imagesLength <= 1) {
            return;
        }

        const checkCarouselScroll = (): void => {
            if (!carouselRef.current) {
                return;
            }

            const carousel = carouselRef.current;
            const hasScroll = carousel.scrollWidth > carousel.clientWidth;

            if (!hasScroll && onImagesScrollEnd) {
                onImagesScrollEnd();
            }
        };

        const timeoutId = setTimeout(checkCarouselScroll, CAROUSEL_SCROLL_CHECK_DELAY);

        return () => clearTimeout(timeoutId);
    }, [open, enableCarousel, imagesLength, onImagesScrollEnd, moreImagesLoading, carouselRef]);
}
