# CHANGELOG

The format is based on [Keep a Changelog](https://keepachangelog.com/), and this project adheres to [Semantic Versioning](https://semver.org/).

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
