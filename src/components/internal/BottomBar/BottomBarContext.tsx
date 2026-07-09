import { GridApi, GridRowSelectionModel } from '@mui/x-data-grid-pro';
import React, { createContext, SetStateAction, useContext, Dispatch, useState, RefObject } from 'react';
import { MediaGridApi } from '../../Organisms/MultimediaGrid/gridApi.js';

export type BottomBarContextState = {
    isSelectionModeEnabled?: boolean;
    rowSelectionModel?: GridRowSelectionModel;
    allSelected?: boolean;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    items?: any[];
    apiRef?: RefObject<GridApi | null> | MediaGridApi;
};
export interface BottomBarContext {
    bottomBarState: BottomBarContextState;
    setBottomBarState: Dispatch<SetStateAction<BottomBarContextState>>;
}

const initialState: BottomBarContextState = {
    isSelectionModeEnabled: false,
    rowSelectionModel: { type: 'include', ids: new Set() },
    allSelected: false,
    items: [],
    apiRef: undefined,
};

const BottomBarContext = createContext<BottomBarContext>({
    bottomBarState: initialState,
    setBottomBarState: (n) => n,
});

export function BottomBarProvider(props: { children: React.ReactNode }): React.JSX.Element {
    const { children } = props;
    const [bottomBarState, setState] = useState<BottomBarContextState>(initialState);

    const setBottomBarState = (newState: SetStateAction<BottomBarContextState>): void => {
        setState((prev) => ({
            ...prev,
            ...(typeof newState === 'function' ? newState(prev) : newState),
        }));
    };

    return (
        <BottomBarContext.Provider value={{ bottomBarState, setBottomBarState }}>{children}</BottomBarContext.Provider>
    );
}

export const useBottomBarContext = (): BottomBarContext => {
    const context = useContext(BottomBarContext);

    if (!context) {
        throw new Error('useBottomBarContext must be used within a BottomBarProvider');
    }

    return context;
};
