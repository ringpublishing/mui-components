import { useEffect, useRef } from 'react';

interface UseCarouselAutoScrollParams {
    currentImageIndex: number;
    enableCarousel: boolean;
    imagesLength: number;
    carouselRef: React.RefObject<HTMLDivElement | null>;
}

export function useCarouselAutoScroll({
    currentImageIndex,
    enableCarousel,
    imagesLength,
    carouselRef,
}: UseCarouselAutoScrollParams): void {
    const prevIndexRef = useRef(currentImageIndex);

    useEffect(() => {
        if (currentImageIndex !== prevIndexRef.current) {
            prevIndexRef.current = currentImageIndex;

            if (enableCarousel && carouselRef.current && imagesLength > 1) {
                const carousel = carouselRef.current;
                const thumbnails = carousel.children;

                if (thumbnails[currentImageIndex]) {
                    const thumbnail = thumbnails[currentImageIndex] as HTMLElement;
                    const carouselRect = carousel.getBoundingClientRect();
                    const thumbnailRect = thumbnail.getBoundingClientRect();

                    const isVisible =
                        thumbnailRect.left >= carouselRect.left && thumbnailRect.right <= carouselRect.right;

                    if (!isVisible) {
                        const scrollLeft = thumbnail.offsetLeft - carousel.clientWidth / 2 + thumbnail.clientWidth / 2;
                        carousel.scrollTo({ left: scrollLeft, behavior: 'smooth' });
                    }
                }
            }
        }
    }, [currentImageIndex, enableCarousel, imagesLength, carouselRef]);
}
