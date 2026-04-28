import { useEffect } from 'react';

const IMAGE_FADE_OUT_DELAY = 300;
const IMAGE_FADE_IN_DELAY = 10;

interface UseImageTransitionParams {
    currentImageIndex: number;
    displayedImageIndex: number;
    imageDimensions: { width: number; height: number } | null;
    setIsFading: (isFading: boolean) => void;
    setPreviousImageDimensions: (dimensions: { width: number; height: number } | null) => void;
    setDisplayedImageIndex: (index: number) => void;
    setImageDimensions: (dimensions: { width: number; height: number } | null) => void;
    setZoom: (zoom: number) => void;
    setBaseScale: (scale: number) => void;
    setImagePos: (pos: { x: number; y: number }) => void;
    setHasManuallyPanned: (panned: boolean) => void;
}

export function useImageTransition({
    currentImageIndex,
    displayedImageIndex,
    imageDimensions,
    setIsFading,
    setPreviousImageDimensions,
    setDisplayedImageIndex,
    setImageDimensions,
    setZoom,
    setBaseScale,
    setImagePos,
    setHasManuallyPanned,
}: UseImageTransitionParams): void {
    useEffect(() => {
        if (currentImageIndex !== displayedImageIndex) {
            setIsFading(true);
            setPreviousImageDimensions(imageDimensions);

            const fadeOutTimeout = setTimeout(() => {
                setDisplayedImageIndex(currentImageIndex);
                setImageDimensions(null);
                setZoom(100);
                setBaseScale(100);
                setImagePos({ x: 0, y: 0 });
                setHasManuallyPanned(false);

                setTimeout(() => {
                    setIsFading(false);
                    setPreviousImageDimensions(null);
                }, IMAGE_FADE_IN_DELAY);
            }, IMAGE_FADE_OUT_DELAY);

            return () => clearTimeout(fadeOutTimeout);
        }

        return undefined;
    }, [
        currentImageIndex,
        displayedImageIndex,
        imageDimensions,
        setIsFading,
        setPreviousImageDimensions,
        setDisplayedImageIndex,
        setImageDimensions,
        setZoom,
        setBaseScale,
        setImagePos,
        setHasManuallyPanned,
    ]);
}
