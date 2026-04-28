import { useEffect, useState, RefObject } from 'react';

export function useContainerWidth(containerRef: RefObject<HTMLElement | null>): number {
    const [width, setWidth] = useState<number>(0);

    useEffect(() => {
        if (!containerRef.current) {
            return;
        }

        const resizeObserver = new ResizeObserver((entries) => {
            for (const entry of entries) {
                const { width: newWidth } = entry.contentRect;
                setWidth(newWidth);
            }
        });

        resizeObserver.observe(containerRef.current);

        setWidth(containerRef.current.offsetWidth);

        return () => {
            resizeObserver.disconnect();
        };
    }, [containerRef]);

    return width;
}
