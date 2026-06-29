# CHANGELOG

The format is based on [Keep a Changelog](https://keepachangelog.com/), and this project adheres to [Semantic Versioning](https://semver.org/).

## [1.9.1] - 2026-06-25

### Fixed
- [@pjarolewski]: `DataView` now updates the left slot width when the `leftSlotWidth` prop changes.

## [1.9.0] - 2026-06-11

### Added
- [@rsarata]: `Media` — added `description` prop and support for editing title and description text via `onTitleSubmit` and `onDescriptionSubmit` callbacks.
- [@rsarata]: `Media` — added `height` prop that switches the component into a fixed-height layout mode. When set, the component always renders at exactly the specified height, the image fills the full height, and its width is derived from the `ratio` prop.

## [1.8.0] - 2026-05-31

### Added
- [@wniemiec]: `<ThemeConfig>` exposes `themeOverrides`, `externalLocales`, and `version` props.

### Changed
- [@wniemiec]: `ThemeConfig` and `getCreatedTheme` are thin passthroughs over `@ringpublishing/mui-theme` — full `ThemeConfigProps` / `GetThemeOptions` surface. Ring MUI X defaults merged underneath consumer values.
- [@wniemiec]: Component overrides routed through `themeOverrides.components`. Deep-merge semantics differ for shallow style functions / slot-prop callbacks.
- [@wniemiec]: `externalLocales` prepended with Ring's MUI X locales; consumer entries win on collision.
- [@wniemiec]: MUI sub-module augmentations mirrored in `src/theme/muiAugmentation.ts`.

## [1.7.3] - 2026-06-11

### Fixed
- [@pjarolewski]: Fixed WCAG AA accessibility across `SearchBox`, `RingDataGrid`, `RingDataGridToolbar`, `DataToolbar`, `Detail`, `MediaCard`, `DataView`, and `GridSpacer` — added missing `aria-label` attributes to icon buttons, loading overlays, and media elements.

## [1.7.2] - 2026-05-28

### Fixed
- [@pjarolewski]: Fixed WCAG AA accessibility in `TextField`, `EditableText`, `DatePicker`, `DateTimePicker`, and `TimePicker` — label and icon button colors now meet the required 4.5:1 contrast ratio; updated test snapshots.

## [1.7.1] - 2026-05-27

### Fixed
- [@rmusial2]: Fixed `@ringpublishing/mui-components-mcp` publish error.

## [1.7.0] - 2026-05-27

### Added
- [@rmusial2]: Added `mcp-server` — MCP server for AI tooling, deployed as separate package `@ringpublishing/mui-components-mcp`.
- [@rmusial2]: Enriched all 33 components with complete argTypes metadata (descriptions, types, categories).

## [1.6.1] - 2026-05-26

### Fixed
- [@dhebda]: Storybook `<Canvas>` copy button was copying 96k lines (serialized `<Playground availableImports>` tree) instead of the code example. Fixed by introducing a lightweight `stories/storySourceRegistry.ts` module; `createCodeStory()` registers the `customCode` string on each render, and a global `docs.source.transform` in `.storybook/preview.tsx` returns it for the copy button. Registry entries are cleared when `customCode` is absent to prevent stale results during HMR.

## [1.6.0] - 2026-05-11

### Added
- [@omaziarz]: `MultimediaGrid` and `RingDataGrid` — new optional `placeholderLabels` prop. Lets consumers override the error/empty placeholder labels and the retry button text.

## [1.5.1] - 2026-05-14

### Fixed
- [@pjarolewski]: CI — updated Playwright Docker image in `ci-storybook.yaml` from `v1.59.1` to `v1.60.0` to match the installed `@playwright/test` version. The mismatch caused all E2E tests to fail after merge to master with `Executable doesn't exist` error.

## [1.5.0] - 2026-05-11

### Added
- [@pjarolewski]: Added Playwright-based WCAG accessibility e2e tests (`e2e/accessibility/`). Tests run against WCAG 2.1 AA standard using `@axe-core/playwright` and cover critical/serious violations as well as component-scoped checks (initial coverage: `DataGrid`).
- [@pjarolewski]: Added `playwright.config.ts` with Chromium desktop and mobile projects, configurable base URL via `E2E_BASE_URL` env variable.

## [1.4.2] - 2026-05-08

### Added
- [@psulich]: CI workflow to sync private repository to public repository, with support for excluding specific paths.

## [1.4.1] - 2026-05-08

### Fixed
- [@omaziarz]: `SimpleTree` / `DataTree` — after a page reload, cached dynamic items can be expanded again. Previously their `loadItems` functions were dropped by `JSON.stringify` and never re-attached, leaving subtrees un-expandable; the cache is now refetched on mount so live `loadItems` are restored.

## [1.4.0] - 2026-05-07

### Added
- [@wniemiec]: New `rename-package` codemod (`npx @ringpublishing/mui-components run-migration rename-package .`) that auto-rewrites every `import` / `require` / dynamic `import()` / side-effect import from `@ring-internal/ui-components` to `@ringpublishing/mui-components`. Subpath imports (e.g. `@ring-internal/ui-components/dist/foo`) are preserved. `package.json` is intentionally left untouched — consumers update the dependency manually.
- [@wniemiec]: Pluggable migrator architecture — new `MigrationPlan` / `MigrationContext` / `MigrationExecutor` types and a shared `runMigration` harness in `src/migration-utilities/`. New migration scripts are thin orchestrators (~25 lines of declarative plan + executor); existing `skeleton-to-dataview` and `ring-feature-tooltip-to-feature-tooltip` codemods were rewritten in this shape. Documented in [ADR-006](docs/adr/006-pluggable-migrator-architecture.md).

### Changed
- [@wniemiec]: `BreakingMigrations` — added `[1.1.4]` section covering the package rename, with a `Fast track` automated-codemod block and an explicit run-order warning (run `rename-package` before component-rename codemods, which match imports from `@ringpublishing/mui-components` only).
- [@wniemiec]: `tsconfig.json` — `.storybook` entry in `include` widened to the explicit glob `.storybook/**/*` so `tsc` now type-checks Storybook config files. Surfaced and fixed four pre-existing TS issues in `.storybook/main.ts` and `.storybook/preview.tsx` (implicit `any` on Rollup `onwarn` and Monaco `onMonacoLoad` callbacks, unused `React` namespace import). No impact on the published build.
- [@wniemiec]: Relaxed `@tanstack/react-query` devDependency range from `^5.100.9` to `^5.0.0` to match the peerDependency declaration (`^4.0.0 || ^5.0.0`). No install-time effect — `npm install` continues to resolve the latest 5.x — but the declared range now honestly reflects what we promise to support.

### Fixed
- [@wniemiec]: `RingDataGrid` - Restored `stopPropagation` on action button click to prevent unintended row selection.

### Security
- [@wniemiec]: Bumped `vite` devDependency from `~6.2.0` to `~6.4.2`, clearing 5 high-severity advisories (GHSA-g4jq-h2w9-997c, GHSA-jqfw-vq24-v9c3, GHSA-93m4-6634-74q7, GHSA-4w7w-66w2-5vf9, GHSA-p9ff-h696-f583) — all related to Vite dev-server file-serving / path-traversal. No runtime impact on the published package (vite is build/dev-time only).

## [1.3.1] - 2026-05-07

### Fixed
- [@omaziarz]: **Hotfix** — `@tanstack/react-query` is now actually optional at the consumer's build. Two issues stacked: the package was missing from `peerDependencies` (only listed under `peerDependenciesMeta`), so Vite/Rollup never recognised it as optional and hard-failed to resolve. After re-adding the entry, the bundler then failed against the optional-peer-dep stub on every named import (`import { QueryClient, QueryClientProvider, useQuery, useQueryClient }`) because the stub exposes no named exports. Switched all five `*Dynamic.{ts,tsx}` files in `Organisms/SimpleTree/` and `Organisms/DataTree/` to namespace imports (`import * as ReactQuery from '@tanstack/react-query'`) so they compile against the stub; the actual values are accessed as `ReactQuery.QueryClient`, `ReactQuery.useQuery`, etc. Verified end-to-end by `npm pack`-ing the lib and consuming it from a clean app with and without `@tanstack/react-query` installed: static `<DataTree items={…}/>` builds and renders without the dep, dynamic `loadItems` builds without it (warns) and works once the dep is installed.

## [1.3.0] - 2026-05-05

### Added
- [@wniemiec]: `MediaCard` — new `slotProps.card` slot exposing the root MUI `<Card>` for native DOM events (`onMouseEnter`, `onMouseLeave`, `onFocus`, `onKeyDown`, `onContextMenu`, `aria-*`, `data-*`, …). Top-level `MediaCardProps` (`variant`, `square`, `onClick`, `tabIndex`, `className`, `sx`) take precedence; `className` and `sx` are merged additively rather than overwritten. The slot is typed as `Omit<CardProps, 'children' | 'variant' | 'square' | 'onClick' | 'tabIndex'>`.
- [@wniemiec]: `MediaCard` — new `CardEvents` story demonstrating the canonical pattern: custom native `<video>` in `slots.mediaCard` driven by hover events forwarded through `slotProps.card.onMouseEnter` / `onMouseLeave`.
- [@wniemiec]: `Media` — new `slots.media` slot accepting any `ReactNode` to replace the default `<CardMedia>` element (wrapped in `<AspectRatio>` so `ratio` and `objectFit` still apply). When provided, the LightBox full-screen preview is suppressed.
- [@wniemiec]: `Media` — new `slotProps.card` slot mirroring the `MediaCard` pattern. Forwards arbitrary `CardProps` to the root `<Card>`. Top-level `MediaProps.sx` takes precedence and is merged on top of `slotProps.card.sx`.
- [@wniemiec]: `Media` — new `CardEvents` story showing the same hover-driven preview pattern as `MediaCard`.
- [@wniemiec]: `Detail` — `DetailMain` now also renders `<Media>` (and the bottom-icons row) when `mediaProps.slots.media` is provided, in addition to the existing `image` / `slotProps.media.src` checks. Without this, custom-slot consumers passing only `slots.media` saw no media section.
- [@wniemiec]: `Detail` — new `WithVideoHoverPreview` story demonstrating end-to-end Detail use-case: `<HoverVideoPreview>` with overlay progress bar in `mediaProps.slots.media`, hover-driven `play()` / `pause()` via `mediaProps.slotProps.card.onMouseEnter` / `onMouseLeave`.
- [@wniemiec]: `MediaCard` and `Media` — Storybook docs reorganised MUI-style: argTypes split into per-row entries under `slots` / `slotProps` categories, and MDX gained dedicated **Slots** and **Slot props** sections with markdown reference tables and precedence rules.

### Changed
- [@wniemiec]: `MediaCard` and `Media` — internal `sx` composition refactored to MUI's array form (`sx={[internalSx, slotProps.card.sx, topLevelSx]}`), so all three style sources layer correctly without overwriting each other. Internal type uses `Exclude<SxProps<Theme>, ReadonlyArray<unknown>>` to keep the array elements well-typed without an `as` cast. Rendered DOM is unchanged; emotion CSS-class hashes shift, and snapshots have been refreshed accordingly.
- [@wniemiec]: `MediaCard` and `Media` — default-rendered `<img>` element is no longer draggable (`draggable={false}` is set on the internal `<CardMedia>` before user `slotProps`). Prevents the browser's native drag-and-drop ghost from appearing when users hold the mouse on the image. Consumers can opt back in via `slotProps.cardMedia.draggable` (MediaCard) or `slotProps.media.draggable` (Media). Custom slot media (`slots.mediaCard` / `slots.media`) is untouched — consumers control their own elements.

### Fixed
- [@wniemiec]: `Media` and `Detail` — built-in `<LightBox>` (and Detail's zoom/download bottom-icons row) is now properly suppressed when `slots.media` replaces the default `<CardMedia>` render, even if `image` and `imageFullScreenPreview` are also provided. Previously, passing both `slots.media` and `image` caused the LightBox to mount in the React tree and the zoom button to remain clickable, opening a fullscreen preview that showed the still `image` while the card itself rendered the custom slot — a content desync between the rendered media and the fullscreen preview. The render gate now also checks `!slots?.media`. Consumers that want a custom fullscreen viewer for non-image media (e.g. a video player) should drive their own modal through `slotProps.card` event handlers; a first-class `slots.fullScreenContent` may be added in a follow-up.

## [1.2.1] - 2026-05-05

### Fixed
- [@rsarata]: Fixed clear icon fontSize in `DatePicker`, `DateTimePicker` and `TimePicker`.

## [1.2.0] - 2026-04-29

### Added
- [@omaziarz]: New `SimpleTree` organism — standalone component for the compact tree variant. Single selection, search, custom row elements, and dynamic loading via `loadItems`. No checkboxes, columns, or drag-and-drop. Replaces `TreeView` with `variant="compact"`.
- [@omaziarz]: New `DataTree` organism — standalone component for the default tree variant. Columns with optional headers, checkboxes, drag-and-drop with drop-in, row actions, search, and dynamic loading. Replaces `TreeView` with `variant="default"`.
- [@omaziarz]: TanStack Query–backed dynamic loading. Each tree provisions an internal `QueryClient` (`staleTime: Infinity`, `retry: false`) so consumers do not need to set up a `QueryClientProvider` themselves. `@tanstack/react-query` (`^4.0.0 || ^5.0.0`) is added as an optional peer dependency — consumers with fully static trees do not need to install it.
- [@omaziarz]: `persistence` prop on `SimpleTree` and `DataTree` — opt-in localStorage persistence with `cacheKey` (namespaces persisted entries; query cache hydrated on mount and serialized on every change), `restoreExpandedItems`, and `restoreSelectedItem` (uncontrolled mode only).
- [@omaziarz]: `queryClient` prop on `SimpleTree` and `DataTree` — accept an external `QueryClient` so consumers can inspect tree queries in React Query DevTools, share cache policies, and invalidate items programmatically. localStorage persistence still works with an external client.
- [@omaziarz]: `queryKeyPrefix` prop on `SimpleTree` and `DataTree` — namespaces query keys when multiple tree instances share an external `QueryClient`. Falls back to a per-instance `useId()` on an external client; stays empty for the internal client to keep keys stable across reloads.
- [@omaziarz]: Storybook coverage for both trees — `Default`, `WithSearch`, `WithDynamicLoading`, `ControlledSelection`, `WithPersistence`, `WithExternalQueryClient` (with a debug toolbar showing live cache entry count, invalidate, clear cache, reset client, clear localStorage). `DataTree` adds `WithDragAndDrop` and `WithDropIn`; `SimpleTree` adds `WithCustomElements`.
- [@omaziarz]: Test suites — `SimpleTree.spec.tsx` and `DataTree.spec.tsx` covering selection, expansion, search, dynamic loading, and persistence.
- [@omaziarz]: ADR-005 (`docs/adr/005-treeview-split-and-tanstack-query.md`) documenting the split, TanStack Query adoption, optional `persistence` and `queryClient` props, and the deprecation of `TreeView`.

### Changed
- [@omaziarz]: `DataTree` drop-in detection requires a stricter IoU threshold and is only triggered when `onDropIn` is provided; the visual drop-in cue is suppressed otherwise.

### Deprecated
- [@omaziarz]: `TreeView` and all its exports (`TreeViewProps`, `TreeViewItem`, `CommonTreeViewProps`, `VariantType`, `globalDynamicItemsCache`) are marked `@deprecated`. The Storybook title is now `Organisms/TreeView (Deprecated)`. Existing usage continues to work unchanged.

### Fixed
- [@omaziarz]: `DataTree` drop-in detection for the last nested item now correctly resolves the destination, and the hover zone is tightened to reduce accidental drop-ins.
- [@omaziarz]: `SimpleTree` / `DataTree` / `TreeView` (deprecated) — search box no longer crashes with `SyntaxError: Invalid regular expression` when the query contains a regex metacharacter (`(`, `[`, `*`, `+`, `?`, `{`, `\`, …) that also appears in a label. The highlight-regex source is now built from `escapeRegExp(word)` in a shared helper. Bug was present in the deprecated `TreeView`.
- [@omaziarz]: `DataTree` — toggling a checkbox no longer loses keyboard focus and no longer unmounts/remounts the row. The MUI `checkbox` slot is now a stable module-scope `forwardRef` (`DataTreeCheckboxSlot`) instead of an inline IIFE that produced a fresh component type on every render. Bug was present in the deprecated `TreeView`.
- [@omaziarz]: `SimpleTree` / `DataTree` — labels are now sanitized with `DOMPurify` (`ALLOWED_TAGS: ['span']`) at every `dangerouslySetInnerHTML` site, preventing arbitrary HTML/JS injection through label values from any data source. The deprecated `TreeView` already sanitized; the new components missed it on initial release.

## [1.1.6] - 2026-04-23
### Changed
- [@dhebda]: Updated Accordion stories.

## [1.1.5] - 2026-04-25

### Fixed

- [@rsarata]: `Autocomplete` - Fixed recently used items for multiple selections.
- [@rsarata]: `ActionBox` - added sx prop per item in actions.
- [@rsarata]: `Ranges` - migrated stories to new stories standard.
- [@rsarata]: `RingDataGrid` - memoized columns to prevent unnecessary recalculations and re-renders.

## [1.1.4] - 2026-04-24
### Added
- [@psulich]: Updated Storybook `BreakingMigrations` document with missing migrations pre `1.0.0`.

### Changed
- [@psulich]: Package name changed to `@ringpublishing/mui-components`.
- [@psulich]: Updated Node.js engine support to include v24.
- [@psulich]: Changed `.npmrc` registry from internal to `npmjs`.

### Removed
- [@psulich]: Removed changelog entries pre `1.0.0`.

## [1.1.3] - 2026-04-23
### Fixed
- [@psulich]: Removed internal link from Storybook `Testing` document.

## [1.1.2] - 2026-04-21
### Changed
- [@psulich]: Updated Storybook `Introduction` and `Setup` documents.

## [1.1.1] - 2026-04-16
### Added
- [@psulich]: Added DOM sanitization to `TreeView` marked labels.

## [1.1.0] - 2026-03-24
### Added
- [@psulich]: Added LICENSE file with GNU Lesser General Public License v3.0.

### Changed
- [@psulich]: Package name changed to `@ringpublishing/ui-components`.
- [@psulich]: Moved MUI-X key to environment variable.
- [@psulich]: Updated README, CONTRIBUTING, Introduction and Setup documentation.

## [1.0.0] - 2026-03-12

### Added

- [@wniemiec]: Release v1.0.0 planning document (`docs/RELEASE_V1.md`).
- [@wniemiec]: Dual typography mode — `ThemeConfig` accepts new `typographyMode` prop (`'rem'` | `'deprecated-px'`). Default is `'rem'` (browser-standard, 1rem = 16px); no global `html { font-size }` override required.
- [@wniemiec]: New internal helper `tv(remValue)` in `src/helpers/typographyMode.ts` — returns correct font-size value based on active `typographyMode`: rem value in `'rem'` mode, absolute px in `'deprecated-px'` mode.
- [@wniemiec]: Migration guide for the rem change added to Storybook Breaking Version Upgrades (`BreakingMigrations.mdx`).
- [@wniemiec]: Migrated `DatePicker`, `DateTimePicker`, `TimePicker` stories to new MDX-based stories standard.

### Changed

- [@wniemiec]: Typography values in 12 components updated to rem (browser-standard): `EditableText`, `Media`, `ChipsGroup`, `renderComboCell`, `Detail`, `FileUploader`, `FileItem`, `FileStatusSlot`, `LightBox`, `MediaCard`, `ImageBoxItem`, `EditableSelect`.
- [@wniemiec]: `Setup.mdx` — removed pre-v1 requirement for `html { font-size: 62.5% }`. `ThemeConfig` now works out of the box without any global font-size override.
- [@rmusial2]: **Breaking:** `Placeholder` — `labels` prop now expects a flat object (`{ header?, description?, footer? }`) instead of language-keyed objects. See `stories/migrations/BreakingMigrations.mdx` for migration guidance.
- [@rmusial2]: **Breaking:** `RingFeatureTooltip` has been renamed to `FeatureTooltip`. All related types (`RingFeatureTooltipProps` → `FeatureTooltipProps`, `RingFeatureTooltipAction` → `FeatureTooltipAction`) have been updated accordingly. The `localStorage` persistence key has also changed from `RingFeatureTooltips` to `FeatureTooltips`. Use the automated migration script or follow the guide in Breaking Version Upgrades.

### Removed

- [@wniemiec]: **Breaking:** Removed `placeholder` prop from `DatePicker`, `DateTimePicker`, `TimePicker`. Use the `label` prop instead, which provides native floating label behavior. See [ADR-001](docs/adr/001-date-picker-placeholder-and-accessible-dom.md).

### Deprecated

- [@wniemiec]: `typographyMode="deprecated-px"` on `ThemeConfig` is deprecated from introduction. It is a temporary migration bridge for apps not yet ready to remove `html { font-size: 62.5% }` and will be removed in a future major release.

### Changed

- [@wniemiec]: **Breaking:** `getCreatedTheme` now accepts an options object as the second argument instead of positional parameters. Calls using only `mode` (e.g. `getCreatedTheme('light')`) are unaffected. See `stories/migrations/BreakingMigrations.mdx`.
