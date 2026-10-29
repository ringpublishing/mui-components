import { Component, ReactNode } from 'react';
import { ThemeProvider } from '@mui/material';
import { render, RenderResult } from '@testing-library/react';
import { vi } from 'vitest';

import type { DataTreeItem, SimpleTreeItem } from '../../../../src/index.js';

type Library = typeof import('../../../../src/index.js');

export type TreeName = 'SimpleTree' | 'DataTree';

export const TREES: TreeName[] = ['SimpleTree', 'DataTree'];

export function setupMessage(tree: TreeName): string {
    return (
        `${tree}: items with \`loadItems\` need dynamic loading enabled. Call \`enableTreeDynamicLoading()\` ` +
        "from '@ringpublishing/mui-components/tree-dynamic-loading' once in your app and install " +
        '`@tanstack/react-query` (^4 || ^5).'
    );
}

const libraries = new Map<boolean, Promise<Library>>();

/** Calls `enableTreeDynamicLoading()` on the library copy loaded last. */
export async function enableDynamicLoading(): Promise<void> {
    const { enableTreeDynamicLoading } = await import('../../../../src/treeDynamicLoading.js');

    enableTreeDynamicLoading();
}

async function importFreshLibrary(withDynamicLoading: boolean): Promise<Library> {
    vi.resetModules();

    const library = await import('../../../../src/index.js');

    if (withDynamicLoading) {
        await enableDynamicLoading();
    }

    return library;
}

/**
 * A copy of the library with or without dynamic loading enabled. The dynamic-loading registry is module state, so
 * each state gets its own fresh modules, loaded once per state; `fresh` gives a test a copy of its own to change.
 */
export function loadLibrary(options: { withDynamicLoading: boolean; fresh?: boolean }): Promise<Library> {
    const { withDynamicLoading, fresh = false } = options;

    if (fresh) {
        return importFreshLibrary(withDynamicLoading);
    }

    if (!libraries.has(withDynamicLoading)) {
        libraries.set(withDynamicLoading, importFreshLibrary(withDynamicLoading));
    }

    return libraries.get(withDynamicLoading) as Promise<Library>;
}

class ErrorBoundary extends Component<{ children: ReactNode }, { error: Error | null }> {
    public static getDerivedStateFromError(error: Error): { error: Error } {
        return { error };
    }

    public state = { error: null };

    public render(): ReactNode {
        const { error } = this.state as { error: (Error & { cause?: unknown }) | null };

        if (!error) {
            return this.props.children;
        }

        const cause = error.cause instanceof Error ? ` ${error.cause.message}` : '';

        return <p role="alert">{`${error.message}${cause}`}</p>;
    }
}

/** Renders one tree inside the Ring theme; a render error shows up as `role="alert"` with its message and cause. */
export function renderTree(
    library: Library,
    tree: TreeName,
    items: Array<SimpleTreeItem & DataTreeItem>,
    props: Record<string, unknown> = {},
): RenderResult {
    const Tree = library[tree] as (props: { items: typeof items }) => React.JSX.Element;

    return render(
        <ThemeProvider theme={library.getCreatedTheme('light')}>
            <ErrorBoundary>
                <Tree items={items} {...props} />
            </ErrorBoundary>
        </ThemeProvider>,
    );
}
