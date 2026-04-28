import { useState, useCallback } from 'react';

export const IMAGE_STATUS = {
    LOADING: 'LOADING',
    LOADED: 'LOADED',
    ERROR: 'ERROR',
} as const;

type ImageStatus = (typeof IMAGE_STATUS)[keyof typeof IMAGE_STATUS];

interface UseImageLoaderReturn {
    status: ImageStatus;

    handleLoad: () => void;
    handleError: () => void;
    resetStatus: () => void;
}

export const useImageLoader = (): UseImageLoaderReturn => {
    const [status, setStatus] = useState<ImageStatus>(IMAGE_STATUS.LOADING);

    const handleLoad = useCallback(() => {
        setStatus(IMAGE_STATUS.LOADED);
    }, []);

    const handleError = useCallback(() => {
        setStatus(IMAGE_STATUS.ERROR);
    }, []);

    const resetStatus = useCallback(() => {
        setStatus(IMAGE_STATUS.LOADING);
    }, []);

    return {
        status,
        handleLoad,
        handleError,
        resetStatus,
    };
};
