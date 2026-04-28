import React, { useEffect } from 'react';
import {
    calculateScaledDimensions,
    calculateImageDimensions,
    calculateVisibleHeight,
    calculateClampedPosition,
    getCarouselHeight,
    getTopBarHeight,
} from '../lightBoxUtils.js';

const WINDOW_RESIZE_DEBOUNCE_DELAY = 10;
const MARGIN = 32;

interface UseWindowResizeParams {
    open: boolean;
    containerRef: React.RefObject<HTMLDivElement | null>;
    imageDimensions: { width: number; height: number } | null;
    baseScale: number;
    zoom: number;
    imagePos: { x: number; y: number };
    topBarHeight: number;
    carouselHeight: number;
    enableCarousel: boolean;
    imagesLength: number;
    setTopBarHeight: (height: number) => void;
    setCarouselHeight: (height: number) => void;
    setBaseScale: (scale: number) => void;
    setImagePos: (pos: { x: number; y: number }) => void;
}

export function useWindowResize({
    open,
    containerRef,
    imageDimensions,
    baseScale,
    zoom,
    imagePos,
    topBarHeight,
    carouselHeight,
    enableCarousel,
    imagesLength,
    setTopBarHeight,
    setCarouselHeight,
    setBaseScale,
    setImagePos,
}: UseWindowResizeParams): void {
    useEffect(() => {
        if (!open) {
            return;
        }

        let resizeTimeout: NodeJS.Timeout;

        const handleResize = (): void => {
            setTopBarHeight(getTopBarHeight());
            setCarouselHeight(getCarouselHeight());

            if (!containerRef.current || !imageDimensions) {
                return;
            }

            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                if (!containerRef.current || !imageDimensions) {
                    return;
                }

                const container = containerRef.current;
                const oldContainerWidth = container.clientWidth;
                const oldContainerHeight = container.clientHeight;

                const { width: imageWidth, height: imageHeight } = calculateImageDimensions(
                    imageDimensions.width,
                    imageDimensions.height,
                    baseScale,
                    zoom,
                );
                const imageCenterX = imagePos.x + imageWidth / 2;
                const imageCenterY = imagePos.y + imageHeight / 2;

                const relativeX = imageCenterX / oldContainerWidth;
                const relativeY = imageCenterY / oldContainerHeight;

                const scaled = calculateScaledDimensions(
                    imageDimensions.width,
                    imageDimensions.height,
                    containerRef,
                    topBarHeight,
                    carouselHeight,
                    enableCarousel,
                    imagesLength,
                    MARGIN,
                );

                const { width: newImageWidth, height: newImageHeight } = calculateImageDimensions(
                    imageDimensions.width,
                    imageDimensions.height,
                    scaled.scale,
                    zoom,
                );

                const newImageCenterX = relativeX * container.clientWidth;
                const newImageCenterY = relativeY * container.clientHeight;

                const newX = newImageCenterX - newImageWidth / 2;
                const newY = newImageCenterY - newImageHeight / 2;

                const containerWidth = container.clientWidth;
                const visibleHeight = calculateVisibleHeight(
                    container.clientHeight,
                    topBarHeight,
                    carouselHeight,
                    enableCarousel,
                    imagesLength,
                );

                const clampedPos = calculateClampedPosition(
                    newX,
                    newY,
                    newImageWidth,
                    newImageHeight,
                    containerWidth,
                    topBarHeight,
                    visibleHeight,
                    MARGIN,
                );

                React.startTransition(() => {
                    setBaseScale(scaled.scale);
                    setImagePos(clampedPos);
                });
            }, WINDOW_RESIZE_DEBOUNCE_DELAY);
        };

        window.addEventListener('resize', handleResize);

        return () => {
            clearTimeout(resizeTimeout);
            window.removeEventListener('resize', handleResize);
        };
    }, [
        open,
        containerRef,
        imageDimensions,
        baseScale,
        zoom,
        imagePos,
        topBarHeight,
        carouselHeight,
        enableCarousel,
        imagesLength,
        setTopBarHeight,
        setCarouselHeight,
        setBaseScale,
        setImagePos,
    ]);
}
