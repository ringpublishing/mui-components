import { useEffect, useRef } from 'react';
import {
    calculateScaledDimensions,
    calculateImageDimensions,
    calculateVisibleHeight,
    calculateCenteredPosition,
} from '../lightBoxUtils.js';

const DETAIL_PANEL_REPOSITION_DELAY = 350;
const MARGIN = 32;

interface UseDetailPanelRepositionParams {
    showDetail: boolean;
    containerRef: React.RefObject<HTMLDivElement | null>;
    imageDimensions: { width: number; height: number } | null;
    zoom: number;
    topBarHeight: number;
    carouselHeight: number;
    enableCarousel: boolean;
    imagesLength: number;
    setHasManuallyPanned: (panned: boolean) => void;
    setBaseScale: (scale: number) => void;
    setImagePos: (pos: { x: number; y: number }) => void;
}

export function useDetailPanelReposition({
    showDetail,
    containerRef,
    imageDimensions,
    zoom,
    topBarHeight,
    carouselHeight,
    enableCarousel,
    imagesLength,
    setHasManuallyPanned,
    setBaseScale,
    setImagePos,
}: UseDetailPanelRepositionParams): void {
    const prevShowDetailRef = useRef(showDetail);

    useEffect(() => {
        const showDetailChanged = prevShowDetailRef.current !== showDetail;
        prevShowDetailRef.current = showDetail;

        if (!showDetailChanged || !containerRef.current || !imageDimensions) {
            return;
        }

        setHasManuallyPanned(false);

        const timeoutId = setTimeout(() => {
            if (!containerRef.current || !imageDimensions) {
                return;
            }

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
            setBaseScale(scaled.scale);

            const container = containerRef.current;
            const { width: imageWidth, height: imageHeight } = calculateImageDimensions(
                imageDimensions.width,
                imageDimensions.height,
                scaled.scale,
                zoom,
            );

            const visibleHeight = calculateVisibleHeight(
                container.clientHeight,
                topBarHeight,
                carouselHeight,
                enableCarousel,
                imagesLength,
            );

            const centeredPos = calculateCenteredPosition(
                container.clientWidth,
                imageWidth,
                topBarHeight,
                visibleHeight,
                imageHeight,
            );

            setImagePos(centeredPos);
        }, DETAIL_PANEL_REPOSITION_DELAY);

        return () => clearTimeout(timeoutId);
    }, [
        showDetail,
        containerRef,
        imageDimensions,
        zoom,
        topBarHeight,
        carouselHeight,
        enableCarousel,
        imagesLength,
        setHasManuallyPanned,
        setBaseScale,
        setImagePos,
    ]);
}
