import type { GridRowId, GridRowSelectionModel } from '@mui/x-data-grid-pro';
import type { MediaCardProps } from '../Organisms/MediaCard/MediaCard.js';
import type { SpacerItem } from './spacer.js';
import type { VirtualRow } from '../Organisms/MultimediaGrid/gridHelpers.js';

// Shapes of the MultimediaGrid API. Only types live here, so internal components such as BottomBar can describe
// the grid they talk to without importing an organism at runtime.

export interface MediaGridItemProps extends Omit<MediaCardProps, 'id'> {
    id: GridRowId;
}

export type MediaGridItemsProps = ReadonlyArray<MediaGridItemProps | SpacerItem>;

export interface GridState {
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

export type GridAction =
    | { type: 'SET_ITEMS'; payload: MediaGridItemsProps }
    | { type: 'UPDATE_ITEMS'; payload: MediaGridItemsProps }
    | { type: 'SELECT_ITEMS'; payload: GridRowId[] }
    | { type: 'TOGGLE_ITEM_SELECTION'; payload: GridRowId }
    | { type: 'CLEAR_SELECTION' }
    | { type: 'SET_SELECTION_CONFIG'; payload: { isEnabled?: boolean; disableSelectionOnClick?: boolean } }
    | { type: 'SET_ACTIVE_CARD'; payload: GridRowId | null };

export type EventHandler = (params: any) => void;
export type Unsubscribe = () => void;

export interface GridCallbackDetails {
    reason: 'selectItems' | 'toggleItem' | 'clearSelection';
}

/**
 * Ref to the `MultimediaGrid` API, created with `useGridApiRef()` and passed as `apiRef`. Its `current.mode` is
 * `'media'`, which tells it apart from a `RingDataGrid` API in a `BottomBarApiRef`.
 */
export interface MediaGridApi {
    current: MediaGridApiInstance | null;
}

export interface MediaGridApiInstance {
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

export interface DispatchOptions {
    silent?: boolean;
    skipSelectionCallback?: boolean;
}
