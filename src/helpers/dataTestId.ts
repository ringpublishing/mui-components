import { RingDataTestIdSegment, buildRingDataTestId } from './hooks/useRingDataTestId.js';

/**
 * Per-item `data-testid` overrides accepted by every list component (`RingDataGrid`,
 * `MultimediaGrid`, `SimpleTree`, `DataTree`, `TreeView`, `ContentList`, `SortableList`).
 */
export interface WithItemDataTestId {
    /**
     * Replaces this item's generated `data-testid` entirely. Used verbatim — no `ring-`
     * prefix is added, so the value is whatever the test selects on.
     */
    dataTestId?: string;
    /**
     * Replaces the generated `item-<id>` segment for this item, keeping the
     * `ring-<component>[-<list suffix>]` prefix; ignored when `dataTestId` is set. Not named
     * `dataTestIdSuffix`, which list components flatten into row props and would overwrite.
     */
    itemDataTestIdSuffix?: string;
}

/**
 * A component whose generated root id can be replaced verbatim by the caller, as `dataTestId`
 * (the library's spelling) or `data-testid` (which MUI would spread onto the root anyway).
 */
export interface WithRootDataTestIdOverride {
    dataTestId?: string;
    'data-testid'?: string;
}

/**
 * Resolves a component's root test id. Use the result for the sub-element ids too, so an
 * override namespaces the whole subtree rather than just the root.
 */
export function resolveRootDataTestId(overrides: WithRootDataTestIdOverride, generated: string): string {
    return overrides.dataTestId ?? overrides['data-testid'] ?? generated;
}

/**
 * An internal sub-component that renders under its owner's id rather than building its
 * own. `ring-<component>` would be wrong here — a picker's clear button belongs to
 * `ring-datepicker[-<suffix>]`, not to the sub-component that draws it.
 */
export interface WithOwnerDataTestId {
    dataTestId: string;
}

interface ResolveItemDataTestIdArgs {
    /** Owning list component, e.g. `'MultimediaGrid'`. Ignored when `rootId` is given. */
    componentName?: string;
    /**
     * An already-built root id to hang items off, e.g. a grid card's own
     * `ring-multimediagrid-gallery-item-a1`. Use this when the owner's id is not simply
     * `ring-<componentName>` — it avoids re-prefixing and producing `ring-x-ring-y-…`.
     */
    rootId?: string;
    listSuffix?: string;
    /** Identifier of the item; `index` is used instead when this is absent. */
    itemId?: RingDataTestIdSegment;
    index?: number;
    item?: WithItemDataTestId;
    override?: string;
}

/**
 * Resolves an item's `data-testid`, in precedence order: `override` (a list-level
 * `getItemDataTestId` result) verbatim, `item.dataTestId` verbatim, `<root>-<itemDataTestIdSuffix>`,
 * then `<root>-item-<itemId ?? index>`, where `<root>` is `rootId` or `ring-<componentName>[-<listSuffix>]`.
 * Keying off `itemId` keeps ids stable across sorting, filtering and virtualization.
 */
export function resolveItemDataTestId({
    componentName,
    rootId,
    listSuffix,
    itemId,
    index,
    item,
    override,
}: ResolveItemDataTestIdArgs): string {
    if (override) {
        return override;
    }

    if (item?.dataTestId) {
        return item.dataTestId;
    }

    if (item?.itemDataTestIdSuffix) {
        return rootId
            ? `${rootId}-${item.itemDataTestIdSuffix}`
            : buildRingDataTestId(componentName ?? '', listSuffix, item.itemDataTestIdSuffix);
    }

    const resolvedId = itemId === null || itemId === undefined || itemId === '' ? index : itemId;

    return rootId
        ? `${rootId}-item-${resolvedId}`
        : buildRingDataTestId(componentName ?? '', listSuffix, 'item', resolvedId);
}

/**
 * Signature of the `getItemDataTestId` escape hatch exposed by list components, for
 * consumers who cannot attach overrides to the item objects themselves.
 */
export type GetItemDataTestId<TItem> = (item: TItem, index: number) => string | undefined;
