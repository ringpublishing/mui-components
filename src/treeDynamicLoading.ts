// Published as `@ringpublishing/mui-components/tree-dynamic-loading`.
import { registerTreeDynamicLoading } from './components/internal/tree/treeDynamicRegistry.js';

/**
 * Enables `loadItems` in `SimpleTree` and `DataTree`; requires `@tanstack/react-query` 4 or 5.
 * Call it in browser code (a client module under React Server Components) before such a tree renders; repeated calls
 * are harmless.
 */
export function enableTreeDynamicLoading(): void {
    registerTreeDynamicLoading({
        simpleTree: () => import('./components/Organisms/SimpleTree/SimpleTreeDynamic.js'),
        dataTree: () => import('./components/Organisms/DataTree/DataTreeDynamic.js'),
    });
}
