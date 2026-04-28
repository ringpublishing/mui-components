import { useEffect } from 'react';

interface UseKeyboardNavigationParams {
    open: boolean;
    currentImageIndex: number;
    imagesLength: number;
    handlePrevImage: () => void;
    handleNextImage: () => void;
}

export function useKeyboardNavigation({
    open,
    currentImageIndex,
    imagesLength,
    handlePrevImage,
    handleNextImage,
}: UseKeyboardNavigationParams): void {
    useEffect(() => {
        if (!open) {
            return;
        }

        const handleKeyDown = (e: KeyboardEvent): void => {
            if (e.key === 'ArrowLeft') {
                e.preventDefault();
                handlePrevImage();
            } else if (e.key === 'ArrowRight') {
                e.preventDefault();
                handleNextImage();
            }
        };

        window.addEventListener('keydown', handleKeyDown);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [open, currentImageIndex, imagesLength, handlePrevImage, handleNextImage]);
}
