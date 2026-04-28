# ADR-003: Dual Typography Mode (rem / legacy-px)

## Status

Accepted (March 2026)

## Context

The library defined typography using `px` values or `rem` calibrated to a non-standard base via `html { font-size: 62.5% }` (making 1rem = 10px). Consumers were required to set this global override for correct rendering. An internal `pxToRem` helper in the MUI theme (`@ringpublishing/mui-theme`) applied an arbitrary 1.5 multiplier with no documented rationale.

This approach caused three categories of problems:

1. **External library incompatibility** — Modern UI libraries (e.g. Ring UI Inbox) assume the browser default `1rem = 16px`. With our `62.5%` override active, these libraries rendered at ~60% of their intended size. This is not an edge case — every third-party MUI-compatible library assumes the standard base.

2. **Rendering artefacts** — The `pxToRem` multiplier of 1.5 produced fractional pixel values that caused visible misalignment (e.g. text in `Chip` components not vertically centred).

3. **Accessibility violation** — Users who change their browser's base font size for readability expect `rem` values to scale accordingly. The `62.5%` hack overrides this preference, breaking the accessibility contract of `rem` units.

## Decision

### Dual mode via `tv()` helper

All component-internal typography values (`fontSize`, `lineHeight`) that were previously hardcoded in `px` or used the old `rem` scale are now expressed in browser-standard `rem` (1rem = 16px) and wrapped in the `tv()` helper function.

**`tv()` helper** (`src/helpers/typographyMode.ts`) is an internal (not exported) function that:
- Accepts a rem string value (e.g. `'0.75rem'`)
- Returns a per-property `sx` function `(theme: Theme) => string`
- In `'rem'` mode (default): returns the rem value unchanged
- In `'legacy-px'` mode: converts rem to absolute px (`0.75rem` → `12px`)

### Theme integration

`ThemeConfig` accepts a new `typographyMode` prop:
- `'rem'` (default) — browser-standard, no global font-size override needed
- `'legacy-px'` — temporary bridge for apps still using `html { font-size: 62.5% }`

### Usage patterns

```tsx
// Top-level sx property — MUI calls the function:
sx={{ fontSize: tv('0.75rem') }}

// Nested CSS selector — immediate invocation required:
sx={(theme) => ({ '& p': { fontSize: tv('1.25rem')(theme) } })}
```

### What `tv()` does NOT cover

- MUI icon sizing props (`fontSize="small"`, `fontSize="medium"`, etc.)
- Theme spacing multipliers used for icon dimensions
- Layout-specific pixel values (margins, paddings, widths, borders)
- MUI picker internal overrides (e.g. `slotProps.openPickerIcon.sx`)

### Removed

- `html { font-size: 62.5% }` from `.storybook/preview-body.html`
- Requirement for consumers to set `html { font-size: 62.5% }` (documented in `Setup.mdx`)
- `pxToRem` helper with 1.5 multiplier (removed in `@ringpublishing/mui-theme` v4.3.0)

## Consequences

### Breaking change

Apps upgrading to v1.0.0 must either:
1. Remove `html { font-size: 62.5% }` (recommended), or
2. Use `typographyMode="legacy-px"` as a temporary bridge

Without either action, component typography will appear ~60% larger than intended.

### Migration path

Full migration guide available in `stories/migrations/BreakingMigrations.mdx`:
1. Remove `html { font-size: 62.5% }` from global CSS
2. Update library to v1.0.0 (no `ThemeConfig` change needed)
3. Adjust any custom CSS that assumed `1rem = 10px`

### Deprecation

`typographyMode="legacy-px"` is deprecated from introduction. It will be removed in a future major release.

### Coordinated release

Requires `@ringpublishing/mui-theme` >= 4.3.0 (which provides `TypographyMode` type and removes the old `pxToRem` multiplier). Both libraries must be released together.

## Affected components

### New files
- `src/helpers/typographyMode.ts` — `tv()` helper

### Modified theme
- `src/theme/theme.tsx` — `typographyMode` prop integration

### Components updated to use `tv()`
- `src/components/Atoms/EditableText/EditableText.tsx`
- `src/components/Molecules/Media/Media.tsx`
- `src/components/Molecules/ChipsGroup/ChipsGroup.tsx`
- `src/components/Organisms/DataGrid/renderComboCell.tsx`
- `src/components/Organisms/Detail/Detail.tsx`
- `src/components/Organisms/FileUploader/FileUploader.tsx`
- `src/components/Organisms/FileUploader/components/FileItem.tsx`
- `src/components/Organisms/FileUploader/components/FileStatusSlot.tsx`
- `src/components/Organisms/LightBox/LightBox.tsx`
- `src/components/Organisms/MediaCard/MediaCard.tsx`
- `src/components/internal/BottomBar/ImageBoxItem.tsx`
- `src/components/internal/EditableSelect.tsx`

### Documentation
- `stories/migrations/BreakingMigrations.mdx` — v1.0.0 migration guide
- `stories/introduction/Setup.mdx` — removed 62.5% hack requirement
- `.storybook/preview-body.html` — removed font-size override
