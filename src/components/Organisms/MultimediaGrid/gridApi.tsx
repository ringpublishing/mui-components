import { useEffect, useRef, useState } from 'react';
import { createVirtualRows, VirtualRow } from './gridHelpers.js';
import { MediaCardProps } from '../MediaCard/MediaCard.js';
import { SelectionModelChangeHandler } from './multimediaGrid.types.js';
import { SpacerItem } from '../DataGrid/spacer.js';
import { GridRowId, GridRowSelectionModel } from '@mui/x-data-grid-pro';

export interface MediaGridItemProps extends Omit<MediaCardProps, 'id'> {
    id: GridRowId;
}

export type MediaGridItemsProps = ReadonlyArray<MediaGridItemProps | SpacerItem>;

interface GridState {
    items: {
        idItemsLookup: Map<GridRowId, MediaGridItemProps>;
        ids: GridRowId[];
    };
    selection: {
        selectedIds: Set<GridRowId>;
        isEnabled: boolean;
        disableSelectionOnClick: boolean;
    };
    activeCard: {
        activeCardId: GridRowId | null;
    };
    sorting: { field: string; direction: 'asc' | 'desc' } | null;
}

type GridAction =
    | { type: 'SET_ITEMS'; payload: MediaGridItemsProps }
    | { type: 'UPDATE_ITEMS'; payload: MediaGridItemsProps }
    | { type: 'SELECT_ITEMS'; payload: GridRowId[] }
    | { type: 'TOGGLE_ITEM_SELECTION'; payload: GridRowId }
    | { type: 'CLEAR_SELECTION' }
    | { type: 'SET_SELECTION_CONFIG'; payload: { isEnabled?: boolean; disableSelectionOnClick?: boolean } }
    | { type: 'SET_ACTIVE_CARD'; payload: GridRowId | null };

type EventHandler = (params: any) => void;
type Unsubscribe = () => void;

export interface GridCallbackDetails {
    reason: 'selectItems' | 'toggleItem' | 'clearSelection';
}

export interface MediaGridApi {
    current: GridApi | null;
}

interface GridApi {
    mode: 'media';

    getState: () => GridState;
    dispatch: (action: GridAction, options?: DispatchOptions) => void;

    subscribeEvent: (event: string, handler: EventHandler) => Unsubscribe;
    publishEvent: (event: string, params: any) => void;

    getItem: (id: GridRowId) => MediaGridItemProps | undefined;
    getAllItems: () => MediaGridItemsProps;
    getAllCells: () => Map<GridRowId, MediaGridItemProps>;
    updateItems: (updates: MediaGridItemsProps) => void;
    setItems: (items: MediaGridItemsProps) => void;
    getItemIdForIndex: (index: number) => GridRowId;

    getSelectedItems: () => MediaGridItemsProps;
    getSelectionModel: () => GridRowSelectionModel;
    setSelectionModel: (selectionModel: GridRowSelectionModel) => void;
    toggleItemSelection: (id: GridRowId) => void;
    isItemSelected: (id: GridRowId) => boolean;
    clearSelection: () => void;

    isSelectionEnabled: () => boolean;
    setSelectionEnabled: (enabled: boolean) => void;
    isSelectionOnClickDisabled: () => boolean;
    setSelectionOnClickDisabled: (disabled: boolean) => void;

    getActiveCardId: () => GridRowId | null;
    setActiveCardId: (id: GridRowId | null) => void;
    isCardActive: (id: GridRowId) => boolean;
    setOnSelectionModelChange: (
        callback: ((selectionModel: GridRowSelectionModel, details: GridCallbackDetails) => void) | null,
    ) => void;

    // Virtual Rows API
    setColumnsRef: (getColumns: () => number) => void;
    getVirtualRows: () => VirtualRow[];
}

class EventBus {
    private listeners = new Map<string, Set<EventHandler>>();

    public subscribe(event: string, handler: EventHandler): Unsubscribe {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, new Set());
        }

        this.listeners.get(event)?.add(handler);

        return () => {
            this.listeners.get(event)?.delete(handler);
        };
    }

    public publish(event: string, params: unknown): void {
        this.listeners.get(event)?.forEach((handler) => {
            handler(params);
        });
    }
}

const initialState: GridState = {
    items: {
        idItemsLookup: new Map(),
        ids: [],
    },
    selection: {
        selectedIds: new Set(),
        isEnabled: false,
        disableSelectionOnClick: false,
    },
    activeCard: {
        activeCardId: null,
    },
    sorting: null,
};

function gridReducer(state: GridState, action: GridAction): GridState {
    switch (action.type) {
        case 'SET_ITEMS': {
            const lookup = new Map<GridRowId, MediaGridItemProps>();
            const ids: GridRowId[] = [];

            action.payload.forEach((item) => {
                lookup.set(item.id, item);
                ids.push(item.id);
            });

            return {
                ...state,
                items: { idItemsLookup: lookup, ids },
            };
        }
        case 'UPDATE_ITEMS': {
            const newLookup = new Map(state.items.idItemsLookup);

            action.payload.forEach((item) => {
                newLookup.set(item.id, { ...newLookup.get(item.id), ...item });
            });

            return {
                ...state,
                items: { ...state.items, idItemsLookup: newLookup },
            };
        }
        case 'SELECT_ITEMS': {
            return {
                ...state,
                selection: {
                    ...state.selection,
                    selectedIds: new Set(action.payload),
                },
            };
        }
        case 'TOGGLE_ITEM_SELECTION': {
            const newSelection = new Set(state.selection.selectedIds);

            if (newSelection.has(action.payload)) {
                newSelection.delete(action.payload);
            } else {
                newSelection.add(action.payload);
            }

            return {
                ...state,
                selection: {
                    ...state.selection,
                    selectedIds: newSelection,
                },
            };
        }
        case 'CLEAR_SELECTION': {
            return {
                ...state,
                selection: {
                    ...state.selection,
                    selectedIds: new Set(),
                },
            };
        }
        case 'SET_SELECTION_CONFIG': {
            return {
                ...state,
                selection: {
                    ...state.selection,
                    ...action.payload,
                },
            };
        }
        case 'SET_ACTIVE_CARD': {
            return {
                ...state,
                activeCard: {
                    activeCardId: action.payload,
                },
            };
        }
        default:
            return state;
    }
}

interface DispatchOptions {
    silent?: boolean;
    skipSelectionCallback?: boolean;
}

function createGridApi(): GridApi {
    let stateRef = initialState;
    const eventBus = new EventBus();

    let getColumnsRef: (() => number) | null = null;
    let virtualRowsCache: {
        items: MediaGridItemProps[];
        columns: number;
        result: VirtualRow[];
    } | null = null;

    let onSelectionModelChangeRef:
        | ((newSelection: GridRowSelectionModel, details: GridCallbackDetails) => void)
        | null = null;

    const dispatch = (action: GridAction, options: DispatchOptions = {}): void => {
        const prevState = stateRef;
        const nextState = gridReducer(prevState, action);

        stateRef = nextState;

        if (action.type === 'SET_ITEMS' || action.type === 'UPDATE_ITEMS') {
            virtualRowsCache = null;
        }

        if (!options.silent) {
            eventBus.publish('stateChange', { action, state: nextState });
        }

        if (action.type === 'SET_ITEMS' || action.type === 'UPDATE_ITEMS') {
            eventBus.publish('itemsChange', {
                items: Array.from(nextState.items.idItemsLookup.values()),
            });
        }

        if (
            action.type === 'SELECT_ITEMS' ||
            action.type === 'TOGGLE_ITEM_SELECTION' ||
            action.type === 'CLEAR_SELECTION'
        ) {
            const selectedIds = Array.from(nextState.selection.selectedIds);

            eventBus.publish('selectionChange', {
                selectedIds,
                selectedItems: selectedIds.map((id) => nextState.items.idItemsLookup.get(id)).filter(Boolean),
                action: action.type,
            });

            if (!options.skipSelectionCallback && onSelectionModelChangeRef) {
                const details: GridCallbackDetails = {
                    reason:
                        action.type === 'CLEAR_SELECTION'
                            ? 'clearSelection'
                            : action.type === 'TOGGLE_ITEM_SELECTION'
                              ? 'toggleItem'
                              : 'selectItems',
                };
                onSelectionModelChangeRef({ type: 'include', ids: new Set(selectedIds) }, details);
            }
        }

        if (action.type === 'SET_ACTIVE_CARD') {
            eventBus.publish('activeCardChange', {
                activeCardId: nextState.activeCard.activeCardId,
            });
        }
    };

    const api: GridApi = {
        mode: 'media',
        getState: () => stateRef,
        dispatch,

        subscribeEvent: (event, handler) => eventBus.subscribe(event, handler),
        publishEvent: (event, params) => eventBus.publish(event, params),

        // Items API
        getItem: (id) => stateRef.items.idItemsLookup.get(id),
        getAllItems: () => Array.from(stateRef.items.idItemsLookup.values()),
        getAllCells: () => stateRef.items.idItemsLookup,
        updateItems: (updates) => {
            dispatch({ type: 'UPDATE_ITEMS', payload: updates });
        },
        setItems: (items) => {
            dispatch({ type: 'SET_ITEMS', payload: items });
        },
        getItemIdForIndex: (index) => {
            return stateRef.items.ids[index] ?? index;
        },

        // ✨ Selection API - Simplified & Intuitive
        getSelectedItems: () => {
            return Array.from(stateRef.selection.selectedIds)
                .map((id) => stateRef.items.idItemsLookup.get(id))
                .filter((item): item is MediaGridItemProps => item !== undefined);
        },

        getSelectionModel: () => {
            return { type: 'include', ids: new Set(stateRef.selection.selectedIds) };
        },

        setSelectionModel: (selectionModel) => {
            if (!stateRef.selection.isEnabled) {
                console.warn('[GridAPI] Selection is disabled. Enable it first with setSelectionEnabled(true)');

                return;
            }

            dispatch(
                { type: 'SELECT_ITEMS', payload: [...selectionModel.ids] },
                { silent: true, skipSelectionCallback: true },
            );
        },

        toggleItemSelection: (id) => {
            if (!stateRef.selection.isEnabled) {
                console.warn('[GridAPI] Selection is disabled. Enable it first with setSelectionEnabled(true)');

                return;
            }

            dispatch({ type: 'TOGGLE_ITEM_SELECTION', payload: id }, { silent: true });
        },

        isItemSelected: (id) => {
            return stateRef.selection.selectedIds.has(id);
        },

        clearSelection: () => {
            if (!stateRef.selection.isEnabled) {
                return;
            }

            dispatch({ type: 'CLEAR_SELECTION' }, { silent: true });
        },

        isSelectionEnabled: () => {
            return stateRef.selection.isEnabled;
        },

        setSelectionEnabled: (enabled) => {
            dispatch({
                type: 'SET_SELECTION_CONFIG',
                payload: { isEnabled: enabled },
            });
        },

        isSelectionOnClickDisabled: () => {
            return stateRef.selection.disableSelectionOnClick;
        },

        setSelectionOnClickDisabled: (disabled) => {
            dispatch({
                type: 'SET_SELECTION_CONFIG',
                payload: { disableSelectionOnClick: disabled },
            });
        },

        setOnSelectionModelChange: (callback) => {
            onSelectionModelChangeRef = callback;
        },

        getActiveCardId: () => {
            return stateRef.activeCard.activeCardId;
        },

        setActiveCardId: (id) => {
            dispatch({ type: 'SET_ACTIVE_CARD', payload: id }, { silent: true });
        },

        isCardActive: (id) => {
            return stateRef.activeCard.activeCardId === id;
        },

        // Virtual Rows API
        setColumnsRef: (getColumns) => {
            getColumnsRef = getColumns;
            virtualRowsCache = null;
        },

        getVirtualRows: () => {
            if (!getColumnsRef) {
                console.warn('Columns ref not set. Call setColumnsRef first.');

                return [];
            }

            const currentItems = Array.from(stateRef.items.idItemsLookup.values());
            const currentColumns = getColumnsRef();

            if (
                virtualRowsCache &&
                virtualRowsCache.items === currentItems &&
                virtualRowsCache.columns === currentColumns
            ) {
                return virtualRowsCache.result;
            }

            const result = createVirtualRows(currentItems, currentColumns);
            virtualRowsCache = {
                items: currentItems,
                columns: currentColumns,
                result,
            };

            return result;
        },
    };

    return api;
}

export function useGridApiRef(): MediaGridApi {
    const apiRef = useRef<GridApi | null>(null);

    if (apiRef.current === null) {
        apiRef.current = createGridApi();
    }

    return apiRef as MediaGridApi;
}

export function useGridSelector<T>(apiRef: MediaGridApi, selector: (state: GridState) => T): T {
    const [value, setValue] = useState<T>(() => selector(apiRef.current!.getState()));

    useEffect(() => {
        const unsubscribe = apiRef.current!.subscribeEvent('stateChange', ({ state }) => {
            const newValue = selector(state);
            setValue((prev) => {
                if (prev !== newValue) {
                    return newValue;
                }

                return prev;
            });
        });

        return unsubscribe;
    }, [apiRef]);

    return value;
}

interface SelectionChangeParams {
    selectedIds: GridRowId[];
    selectedItems: MediaGridItemProps[];
    action: string;
}

export function useSelectionChange(apiRef: MediaGridApi, callback: (params: SelectionChangeParams) => void): void {
    useEffect(() => {
        if (!apiRef.current) {
            return;
        }

        const unsubscribe = apiRef.current.subscribeEvent('selectionChange', callback);

        return unsubscribe;
    }, [apiRef, callback]);
}

interface ActiveCardChangeParams {
    activeCardId: GridRowId | null;
}

export function useActiveCardChange(apiRef: MediaGridApi, callback: (params: ActiveCardChangeParams) => void): void {
    useEffect(() => {
        if (!apiRef.current) {
            return;
        }

        const unsubscribe = apiRef.current.subscribeEvent('activeCardChange', callback);

        return unsubscribe;
    }, [apiRef, callback]);
}

interface UseSyncGridPropsOptions {
    apiRef: MediaGridApi;
    checkboxSelection?: boolean;
    disableSelection?: boolean;
    disableSelectionOnClick?: boolean;
    selectionModel?: GridRowSelectionModel;
    onSelectionModelChange?: SelectionModelChangeHandler;
}

export function useSyncGridProps(options: UseSyncGridPropsOptions): void {
    const {
        apiRef,
        checkboxSelection = false,
        disableSelection = false,
        disableSelectionOnClick = false,
        selectionModel,
        onSelectionModelChange,
    } = options;

    useEffect(() => {
        if (!apiRef.current) {
            return;
        }

        const shouldEnable = checkboxSelection && !disableSelection;
        apiRef.current.setSelectionEnabled(shouldEnable);
    }, [apiRef, checkboxSelection, disableSelection]);

    useEffect(() => {
        if (!apiRef.current) {
            return;
        }

        apiRef.current.setSelectionOnClickDisabled(disableSelectionOnClick);
    }, [apiRef, disableSelectionOnClick]);

    const isControlled = selectionModel !== undefined;

    useEffect(() => {
        if (!apiRef.current || !isControlled) {
            return;
        }

        const nextSelection = selectionModel ?? [];
        const currentSelection = apiRef.current.getSelectionModel();

        if (nextSelection.ids.size === currentSelection.ids.size) {
            const currentSet = new Set(currentSelection.ids);
            const hasSameValues = [...nextSelection.ids].every((id) => currentSet.has(id));

            if (hasSameValues) {
                return;
            }
        }

        apiRef.current.setSelectionModel(nextSelection);
    }, [apiRef, isControlled, selectionModel]);

    useEffect(() => {
        if (!apiRef.current) {
            return;
        }

        apiRef.current.setOnSelectionModelChange(onSelectionModelChange || null);
    }, [apiRef, onSelectionModelChange]);
}
