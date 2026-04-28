# ADR-002: Placeholder – Flat Labels Structure

## Status
Accepted (March 2026)

## Context

The `Placeholder` component previously accepted a `labels` prop in a language-keyed format:

```ts
labels: {
    enUS: { header, description, footer },
    plPL: { header, description, footer },
}
```

Most applications using the library already manage translations through an i18n library (e.g. `i18next`, `react-intl`). These libraries resolve the correct string for the current locale and return a plain string — not an object keyed by locale. Requiring consumers to re-map those strings into a locale-keyed structure was unnecessary boilerplate and a poor fit for the common i18n workflow.

## Decision

Simplify the `labels` prop to a flat object:

```ts
labels: { header?, description?, footer? }
```

Consumers pass ready-to-display strings. Locale resolution stays in the application layer. Built-in defaults (selected via `variant` + `language` / `theme.locale`) remain unchanged for cases where no custom labels are needed.

## Consequences

- **Easier**: Integrating with any i18n library — pass `t('key')` directly, no wrapping required.
- **Simpler**: Smaller, more predictable prop type.
- **Breaking**: Existing usages with locale-keyed `labels` must be updated to pass a flat object. See [BreakingMigrations](../../stories/migrations/BreakingMigrations.mdx) for the migration guide.

## Affected components

- `Placeholder` (`src/components/Molecules/Placeholder/Placeholder.tsx`)

