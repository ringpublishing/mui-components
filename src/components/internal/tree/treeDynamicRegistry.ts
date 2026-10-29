import { lazy, type ComponentType, type LazyExoticComponent } from 'react';
import type { DataTreeProps } from '../../Organisms/DataTree/DataTree.js';
import type { SimpleTreeProps } from '../../Organisms/SimpleTree/SimpleTree.js';

interface TreeProps {
    simpleTree: SimpleTreeProps;
    dataTree: DataTreeProps;
}

type TreeKey = keyof TreeProps;
type TreeComponent<K extends TreeKey> = ComponentType<TreeProps[K]>;

export type TreeDynamicLoaders = { [K in TreeKey]: () => Promise<{ default: TreeComponent<K> }> };

let loaders: TreeDynamicLoaders | undefined;
const components: { [K in TreeKey]?: LazyExoticComponent<TreeComponent<K>> } = {};

/**
 * Called by `enableTreeDynamicLoading()`, the only way the TanStack Query implementations become reachable. Nothing
 * reachable from `index.ts` may reference `@tanstack/react-query`, even lazily, or apps without that optional peer
 * would fail to build or load.
 */
export function registerTreeDynamicLoading(value: TreeDynamicLoaders): void {
    loaders = value;
}

/**
 * The lazily loaded TanStack Query implementation of a tree, for rendering inside `Suspense`. Throws during render
 * while dynamic loading is not enabled rather than caching a lazy component whose rejected load would outlive
 * the later `enableTreeDynamicLoading()` call.
 */
export function getTreeDynamicComponent<K extends TreeKey>(key: K): LazyExoticComponent<TreeComponent<K>> {
    if (!loaders) {
        const component = key === 'simpleTree' ? 'SimpleTree' : 'DataTree';

        throw new Error(
            `${component}: items with \`loadItems\` need dynamic loading enabled. Call \`enableTreeDynamicLoading()\` ` +
                "from '@ringpublishing/mui-components/tree-dynamic-loading' once in your app and install " +
                '`@tanstack/react-query` (^4 || ^5).',
        );
    }

    const load = loaders[key];

    components[key] ??= lazy(load) as (typeof components)[K];

    return components[key] as LazyExoticComponent<TreeComponent<K>>;
}
