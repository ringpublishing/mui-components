import { useEffect } from 'react';

interface UseTopBarAutoHideParams {
    open: boolean;
    hideTopBarTimeoutRef: React.RefObject<NodeJS.Timeout | null>;
    hideTopBarWithDelay: () => void;
    setShowTopBar: (show: boolean) => void;
}

export function useTopBarAutoHide({
    open,
    hideTopBarTimeoutRef,
    hideTopBarWithDelay,
    setShowTopBar,
}: UseTopBarAutoHideParams): void {
    useEffect(() => {
        if (!open) {
            return;
        }

        setShowTopBar(true);
        hideTopBarWithDelay();

        return () => {
            // Capture the current timeout ID at cleanup time
            // eslint-disable-next-line react-hooks/exhaustive-deps
            const timeoutId = hideTopBarTimeoutRef.current;

            if (timeoutId) {
                clearTimeout(timeoutId);
            }
        };
    }, [open, hideTopBarWithDelay, hideTopBarTimeoutRef, setShowTopBar]);
}
