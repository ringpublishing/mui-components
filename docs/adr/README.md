# Architecture Decision Records (ADR)

This directory contains Architecture Decision Records for the ring-ui-components library.

## Index

| ADR | Title | Status | Date |
|-----|-------|--------|------|
| [001](001-date-picker-placeholder-and-accessible-dom.md) | Date Picker: Placeholder and Accessible DOM | Accepted | 2026-03-10 |
| [002](002-placeholder-labels-flat-structure.md) | Placeholder – Flat Labels Structure | Accepted | 2026-03-12 |
| [003](003-dual-typography-mode-rem-legacy-px.md) | Dual Typography Mode (rem / legacy-px) | Accepted | 2026-03 |
| [004](004-ring-feature-tooltip-rename.md) | `RingFeatureTooltip` renamed to `FeatureTooltip` | Accepted | 2026-03-17 |
| [005](005-treeview-split-and-tanstack-query.md) | TreeView split into SimpleTree / DataTree with TanStack Query | Pending | 2026-04-01 |
| [006](006-pluggable-migrator-architecture.md) | Pluggable migrator architecture + package-rename codemod | Accepted | 2026-05-07 |

## Template

When creating a new ADR, use the following structure:

```markdown
# ADR-NNN: Title

## Status
Accepted | Deprecated | Superseded by [ADR-NNN](NNN-title.md)

## Context
What is the issue that we're seeing that is motivating this decision?

## Decision
What is the change that we're proposing and/or doing?

## Consequences
What becomes easier or more difficult to do because of this change?

## Affected components
Which components or areas of the codebase are affected?
```
