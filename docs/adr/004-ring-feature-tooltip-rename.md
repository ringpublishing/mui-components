# ADR-004: `RingFeatureTooltip` renamed to `FeatureTooltip`

## Status

Accepted (March 2026)

## Context

The component was originally named `RingFeatureTooltip`, following an older convention in the library where the `Ring` prefix was used to avoid name collisions with third-party components and native HTML elements. This prefix was never a project-wide standard — the vast majority of components in `@ringpublishing/mui-components` (e.g. `Accordion`, `Autocomplete`, `SearchBox`, `DataGrid`) do not use it.

The inconsistency caused confusion:
- Consumers had to remember which components carry the `Ring` prefix and which do not.
- The `Ring` prefix added noise without conveying meaningful information, since all components in this package are already scoped under `@ringpublishing/mui-components`.
- Related types (`RingFeatureTooltipProps`, `RingFeatureTooltipAction`) were unnecessarily verbose.
- The localStorage key (`RingFeatureTooltips`) used internally for tooltip state persistence also carried the prefix, making it harder to understand and potentially conflicting with applications that might use the same key.

The v1.0.0 release presented a natural opportunity to clean up naming inconsistencies under a breaking change.

## Decision

Rename the component and all related identifiers to drop the `Ring` prefix:

| Before | After |
|--------|-------|
| `RingFeatureTooltip` | `FeatureTooltip` |
| `RingFeatureTooltipProps` | `FeatureTooltipProps` |
| `RingFeatureTooltipAction` | `FeatureTooltipAction` |
| localStorage key `RingFeatureTooltips` | `FeatureTooltips` |

The source file is also moved from `Tooltip/RingFeatureTooltip.tsx` to its own directory `FeatureTooltip/FeatureTooltip.tsx`, consistent with the structure of all other components in the library.

An automated codemod (`ring-feature-tooltip-to-feature-tooltip`) is provided to assist with the migration.

## Consequences

- **Easier**: The API is consistent with the rest of the library — no special cases to remember.
- **Cleaner**: Type names are shorter and more readable in consumer code.
- **Breaking**: Any codebase importing `RingFeatureTooltip`, `RingFeatureTooltipProps`, or `RingFeatureTooltipAction` must update those imports. JSX usages must be updated accordingly.
- **localStorage side-effect**: Tooltip state persisted under the old key (`RingFeatureTooltips`) will no longer be read after upgrading. Affected users may see a previously dismissed tooltip appear one additional time. This is considered an acceptable trade-off given the cosmetic nature of the impact.
- **Migration path**: See [BreakingMigrations](../../stories/migrations/BreakingMigrations.mdx#100---ringfeaturetooltip-renamed-to-featuretooltip) and the automated codemod:
  ```bash
  npx @ringpublishing/mui-components@latest run-migration ring-feature-tooltip-to-feature-tooltip .
  ```

## Affected components

- `FeatureTooltip` (`src/components/Molecules/FeatureTooltip/FeatureTooltip.tsx`)
