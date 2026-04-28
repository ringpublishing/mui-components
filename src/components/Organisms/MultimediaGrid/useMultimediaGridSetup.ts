import { useEffect } from 'react';
import { MediaGridApi, MediaGridItemsProps } from './gridApi.js';
import { BottomBarContextState } from '../../internal/BottomBar/BottomBarContext.js';

/**
 * Custom hook to synchronize items with the grid API
 *
 * @param apiRef - Reference to the MediaGrid API
 * @param items - Array of items to be displayed in the grid
 */
export function useItemsSync(apiRef: MediaGridApi, items: MediaGridItemsProps): void {
    useEffect(() => {
        if (!apiRef.current) {
            return;
        }

        apiRef.current.setItems(items);
    }, [apiRef, items]);
}

/**
 * Custom hook to setup BottomBar integration with MultimediaGrid
 *
 * @param checkboxSelection - Whether checkbox selection is enabled
 * @param apiRef - Reference to the MediaGrid API
 * @param setBottomBarState - Function to update BottomBar state
 */
export function useBottomBarSetup(
    checkboxSelection: boolean,
    apiRef: MediaGridApi,
    setBottomBarState?: (state: Partial<BottomBarContextState>) => void,
): void {
    useEffect(() => {
        if (!checkboxSelection) {
            return;
        }

        if (setBottomBarState) {
            setBottomBarState({
                isSelectionModeEnabled: checkboxSelection,
                apiRef,
            });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [apiRef, checkboxSelection]);
}
