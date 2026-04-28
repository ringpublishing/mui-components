import { useEffect } from 'react';

interface UsePanPinchEventListenersParams {
    isPanning: boolean;
    isPinching: boolean;
    containerRef: React.RefObject<HTMLDivElement | null>;
    handleMouseMove: (e: MouseEvent) => void;
    handleMouseUp: () => void;
    handleTouchMove: (e: TouchEvent) => void;
    handleTouchEnd: () => void;
    handleWheel: (e: WheelEvent) => void;
}

export function usePanPinchEventListeners({
    isPanning,
    isPinching,
    containerRef,
    handleMouseMove,
    handleMouseUp,
    handleTouchMove,
    handleTouchEnd,
    handleWheel,
}: UsePanPinchEventListenersParams): void {
    useEffect(() => {
        if (isPanning || isPinching) {
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
            window.addEventListener('touchmove', handleTouchMove, { passive: false });
            window.addEventListener('touchend', handleTouchEnd);

            if (isPanning) {
                document.body.style.cursor = 'grabbing';
            }

            return () => {
                window.removeEventListener('mousemove', handleMouseMove);
                window.removeEventListener('mouseup', handleMouseUp);
                window.removeEventListener('touchmove', handleTouchMove);
                window.removeEventListener('touchend', handleTouchEnd);
                document.body.style.cursor = '';
            };
        }

        return undefined;
    }, [isPanning, isPinching, handleMouseMove, handleMouseUp, handleTouchMove, handleTouchEnd]);

    useEffect(() => {
        const container = containerRef.current;

        if (!container) {
            return undefined;
        }

        container.addEventListener('wheel', handleWheel, { passive: false });

        return () => {
            container.removeEventListener('wheel', handleWheel);
        };
    }, [containerRef, handleWheel]);
}
