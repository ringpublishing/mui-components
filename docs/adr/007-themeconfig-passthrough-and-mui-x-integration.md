# ADR-007: ThemeConfig as a thin passthrough wrapper with opt-in MUI X

## Status

Proposed (May 2026)

## Summary (TL;DR)

`<ThemeConfig>` in ring-ui-components becomes a **thin passthrough wrapper** around `<ThemeConfig>` from `@ringpublishing/mui-theme`. The wrapper:

1. Exposes an **identical interface** as the core — `ThemeConfigProps = CoreThemeConfigProps` (zero shape duplication, zero drift).
2. **Consumes the sub-entry `/mui-x`** from theme.lib (`ringDataGridOverrides`, `getMuiXLocales`) — wires them into `themeOverrides.components` + `externalLocales` automatically. The ring-ui-components consumer writes nothing, gets Ring DataGrid styling and locale out of the box.
3. **Merges consumer values on top of Ring defaults** — the consumer can extend Ring branding (e.g. add their own `MuiButton` styling) without losing the Ring DataGrid baseline.
4. **Keeps a local mirror of Category B augmentations** (Typography label/headline1-3, Paper borderless, Button/IconButton contrast) in a dedicated file `src/theme/muiAugmentation.ts`.

Point #4 is enforced by a TS module resolution quirk under `moduleResolution: "node16"` — see [theme.lib ADR-006](https://github.com/Ringier-Axel-Springer-PL/ring-ui-mui-theme/blob/master/docs/adr/006-mui-module-augmentation-categories.md). Points #1–3 are made possible by [theme.lib ADR-005](https://github.com/Ringier-Axel-Springer-PL/ring-ui-mui-theme/blob/master/docs/adr/005-sub-entry-mui-x.md) (sub-entry) and [theme.lib ADR-007](https://github.com/Ringier-Axel-Springer-PL/ring-ui-mui-theme/blob/master/docs/adr/007-themeconfig-api-expansion.md) (passthrough types).

## Context

Ring-ui-components **assumes that the consumer uses MUI X** (has its own components based on DataGrid, date pickers, TreeView). MUI X is a required peer dep (not optional, as in theme.lib).

Ring-ui-components has long had its own `<ThemeConfig>` wrapper, but:

1. **The wrapper duplicated the `ThemeConfigProps` shape** — its own interface with a subset of fields. `themeOverrides`, `externalLocales`, `version` were missing. The consumer could not extend Ring brand without losing defaults.

2. **MUI X integration was hardcoded** — the wrapper directly imported `@mui/x-data-grid-pro/locales` etc. MUI X-related code lived inside the wrapper files. After the theme.lib refactor (sub-entry `/mui-x`) — that code could be moved to theme.lib and consumed via sub-entry.

3. **Routing through `externalComponentsTheme`** (deprecated) instead of `themeOverrides.components` (supported). Runtime-equivalent for our use case, but new code should use the supported path.

4. **TS augmentation mirror** (Category B from theme.lib ADR-006) — lived inline in `src/theme/theme.tsx`, co-located with the wrapper's runtime code. It should be in a separate file for discoverability and clean separation.

## Decision

### 1. Passthrough types

`ThemeConfigProps` and `GetCreatedThemeOptions` are simple type aliases from `@ringpublishing/mui-theme` — zero shape duplication, zero drift. Single source of truth in theme.lib (per [theme.lib ADR-007](https://github.com/Ringier-Axel-Springer-PL/ring-ui-mui-theme/blob/master/docs/adr/007-themeconfig-api-expansion.md)).

### 2. Auto-wiring MUI X via sub-entry

The wrapper imports `getMuiXLocales` and `ringDataGridOverrides` from the sub-entry `@ringpublishing/mui-theme/mui-x` and merges them with consumer values (Ring defaults at the bottom, consumer values on top) before passing to `CoreThemeConfig`. Details in [`src/theme/theme.tsx`](../../src/theme/theme.tsx).

### 3. Category B mirror in a dedicated file

`src/theme/muiAugmentation.ts` contains **all 4** Category B mirrors (Typography, Paper, Button, IconButton). The file is a 1:1 copy from theme.lib. `src/theme/theme.tsx` imports it as a side-effect (`import './muiAugmentation.js'`).

## Consequences

- **Backward compatibility** — all existing ring-ui-components consumers work without changes. Their `<ThemeConfig mode="light">` retains the previous Ring defaults (DataGrid + locales).
- **Consumer can now extend Ring branding** — previously blocked by the narrow wrapper.
- **The wrapper is minimal** — 50 lines of code vs 150 before. Adding a new field to the core `ThemeConfigProps` requires no touchpoint in the wrapper.
- **Category B mirror requires synchronization** — every new augmentation in theme.lib must be added here as well.
- **MUI X as required peer dep** in ring-ui-components — unchanged (ring-ui-components assumes use of MUI X in its components like DataGridToolbar).
- **Routing through `themeOverrides.components`** instead of deprecated `externalComponentsTheme` — aligned with theme.lib API direction.

## Related

- **theme.lib ADR-005** — sub-entry `/mui-x`. The wrapper consumes `getMuiXLocales` + `ringDataGridOverrides` from this sub-entry.
- **theme.lib ADR-006** — Category A vs Category B augmentations. The mechanism that enforces the local mirror in `muiAugmentation.ts`.
- **theme.lib ADR-007** — export of `ThemeConfigProps` / `GetThemeOptions`. This enables passthrough types in the wrapper.

## Critical files

- [`src/theme/theme.tsx`](../../src/theme/theme.tsx) — passthrough wrapper with Ring defaults merged under consumer values
- [`src/theme/muiAugmentation.ts`](../../src/theme/muiAugmentation.ts) — local Category B mirror
- [`package.json`](../../package.json) — `peerDependencies` MUI X **required** (difference vs theme.lib where optional)
