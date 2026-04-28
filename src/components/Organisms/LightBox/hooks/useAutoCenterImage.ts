import { useEffect } from 'react';
import { calculateImageDimensions, calculateVisibleHeight, calculateCenteredPosition } from '../lightBoxUtils.js';

interface UseAutoCenterImageParams {
    containerRef: React.RefObject<HTMLDivElement | null>;
    imageDimensions: { width: number; height: number } | null;
    baseScale: number;
    zoom: number;
    hasManuallyPanned: boolean;
    topBarHeight: number;
    carouselHeight: number;
    enableCarousel: boolean;
    imagesLength: number;
    setImagePos: (pos: { x: number; y: number }) => void;
}

export function useAutoCenterImage({
    containerRef,
    imageDimensions,
    baseScale,
    zoom,
    hasManuallyPanned,
    topBarHeight,
    carouselHeight,
    enableCarousel,
    imagesLength,
    setImagePos,
}: UseAutoCenterImageParams): void {
    useEffect(() => {
        if (!containerRef.current || !imageDimensions || hasManuallyPanned) {
            return;
        }

        const container = containerRef.current;
        const { width: imageWidth, height: imageHeight } = calculateImageDimensions(
            imageDimensions.width,
            imageDimensions.height,
            baseScale,
            zoom,
        );

        const visibleHeight = calculateVisibleHeight(
            container.clientHeight,
            topBarHeight,
            carouselHeight,
            enableCarousel,
            imagesLength,
        );

        if (imageHeight <= visibleHeight && imageWidth <= container.clientWidth) {
            const centeredPos = calculateCenteredPosition(
                container.clientWidth,
                imageWidth,
                topBarHeight,
                visibleHeight,
                imageHeight,
            );

            setImagePos(centeredPos);
        }
    }, [
        containerRef,
        imageDimensions,
        baseScale,
        zoom,
        hasManuallyPanned,
        topBarHeight,
        carouselHeight,
        enableCarousel,
        imagesLength,
        setImagePos,
    ]);
}
