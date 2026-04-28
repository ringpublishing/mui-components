import { createContext, SetStateAction, useContext, Dispatch, useState } from 'react';

export type DataViewContextState = {
    onDetailClose: (() => void) | null;
    isMobile: boolean;
    isLeftSlotOpen?: boolean;
    setLeftSlotOpen?: ((n: boolean) => void) | null;
    hasLeftSlot?: boolean;
    showLeftSlotToggleButton: boolean;
};
export interface DataViewContext {
    dataViewState: DataViewContextState;
    setDataViewState: Dispatch<SetStateAction<DataViewContextState>>;
}

const initialState: DataViewContextState = {
    onDetailClose: null,
    isMobile: false,
    isLeftSlotOpen: true,
    setLeftSlotOpen: null,
    hasLeftSlot: false,
    showLeftSlotToggleButton: true,
};

const DataViewContext = createContext<DataViewContext>({
    dataViewState: initialState,
    setDataViewState: (n) => n,
});

export const DataViewProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [dataViewState, setDataViewState] = useState<DataViewContextState>(initialState);

    return <DataViewContext.Provider value={{ dataViewState, setDataViewState }}>{children}</DataViewContext.Provider>;
};

export const useDataViewContext = () => {
    const context = useContext(DataViewContext);

    if (!context) {
        throw new Error('useDataViewContext must be used within a DataViewProvider');
    }

    return context;
};
