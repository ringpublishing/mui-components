import { useEffect, useRef } from 'react';
import { Image } from '../../../../types.js';

interface UseLightBoxResetParams {
    open: boolean;
    images: (Image & { id?: string | number })[];
    setImageDimensions: (dimensions: { width: number; height: number } | null) => void;
    setZoom: (zoom: number) => void;
    setBaseScale: (scale: number) => void;
    setImagePos: (pos: { x: number; y: number }) => void;
    setHasManuallyPanned: (panned: boolean) => void;
    setCurrentImageIndex: (index: number) => void;
    setDisplayedImageIndex: (index: number) => void;
    onImageChange?: (image?: Image & { id?: string | number }) => void;
    initialImageId?: string | number;
}

export function useLightBoxReset({
    open,
    images,
    setImageDimensions,
    setZoom,
    setBaseScale,
    setImagePos,
    setHasManuallyPanned,
    setCurrentImageIndex,
    setDisplayedImageIndex,
    onImageChange,
    initialImageId,
}: UseLightBoxResetParams): void {
    const prevOpenRef = useRef(false);

    useEffect(() => {
        const wasOpen = prevOpenRef.current;
        prevOpenRef.current = open;

        if (open && !wasOpen) {
            const initialIndex =
                initialImageId !== undefined ? images.findIndex((img) => img.id === initialImageId) : -1;
            const indexToSet = initialIndex !== -1 ? initialIndex : 0;

            setImageDimensions(null);
            setZoom(100);
            setBaseScale(100);
            setImagePos({ x: 0, y: 0 });
            setHasManuallyPanned(false);
            setCurrentImageIndex(indexToSet);
            setDisplayedImageIndex(indexToSet);
            onImageChange?.(images[indexToSet]);
        }
    }, [
        open,
        images,
        setImageDimensions,
        setZoom,
        setBaseScale,
        setImagePos,
        setHasManuallyPanned,
        setCurrentImageIndex,
        setDisplayedImageIndex,
        onImageChange,
        initialImageId,
    ]);
}
