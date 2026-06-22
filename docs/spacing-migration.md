# Migration `theme.spacing()` → `theme.getSpacing()`

## Summary (TL;DR)

`@ringpublishing/mui-theme` (since the version introducing ADR-008) exposes a **strict** spacing API: `theme.getSpacing()`. It accepts only **Figma-defined steps** (`0.5 | 1 | 1.5 | 2 | 3 | ... | 12`), validates at compile-time + runtime, full parity with MUI's `theme.spacing()` for 1-4 args.

New code in ring-ui-components should use `theme.getSpacing()`. Old code migrates **gradually** — `theme.spacing()` still works (MUI internal use), but is marked `@deprecated` (IDE shows strikethrough).

Why — see [theme.lib ADR-008](https://github.com/Ringier-Axel-Springer-PL/ring-ui-mui-theme/blob/master/docs/adr/008-strict-getSpacing-api.md). This document is a **practical guide** for 22 use cases in `src/`.

## Cheat sheet — 1:1 mapping

| Old code | New code |
|---|---|
| `theme.spacing(1)` | `theme.getSpacing(1)` |
| `theme.spacing(2)` | `theme.getSpacing(2)` |
| `theme.spacing(0.5)` | `theme.getSpacing(0.5)` |
| `theme.spacing(1.5)` | `theme.getSpacing(1.5)` |
| `theme.spacing(0, 1, 0, 1)` | `theme.getSpacing(0, 1, 0, 1)` |
| `theme.spacing(1, 0, 1, 0)` | `theme.getSpacing(1, 0, 1, 0)` |
| `theme.spacing(top, leftRight)` | `theme.getSpacing(top, leftRight)` |
| `theme.spacing(top, leftRight, bottom)` | `theme.getSpacing(top, leftRight, bottom)` |
| `theme.spacing(top, right, bottom, left)` | `theme.getSpacing(top, right, bottom, left)` |

**Rule**: replace the function name `spacing` → `getSpacing`. Arguments stay the same.

⚠️ Exception — `theme.spacing(0)` as a single arg:

`SpacingFactor` does not include `0` (there is no such step in the Figma kit). If you use `theme.spacing(0)`, it means a magic number — **reconsider**. Often `0` is just a `'0px'` literal (CSS). You can:

```tsx
// BEFORE:
padding: theme.spacing(0),

// AFTER — two options:
padding: 0,                    // CSS literal expression (preferred)
padding: '0px',                // If MUI requires a string
```

Multi-arg `theme.spacing(0, 1, 0, 1)` is **valid** — MUI treats the first/third `0` as "no padding top/bottom". In getSpacing:

```tsx
// BEFORE:
padding: theme.spacing(0, 1, 0, 1),

// AFTER:
padding: `0 ${theme.getSpacing(1)} 0 ${theme.getSpacing(1)}`,
// or more readable (equivalent):
paddingTop: 0,
paddingRight: theme.getSpacing(1),
paddingBottom: 0,
paddingLeft: theme.getSpacing(1),
// or preserving shorthand with 2-arg variant:
padding: `0 ${theme.getSpacing(1)}`,
```

## Audit of all uses in `src/`

22 occurrences. Order: by file, least complex first.

### Trivial — single arg, integer factor

```tsx
// src/components/Molecules/ChipsGroup/ChipsGroup.tsx:15
gap: theme.spacing(1),
↓
gap: theme.getSpacing(1),

// src/components/Organisms/Filters/FiltersWrapper/FiltersWrapper.tsx:63
padding: theme.spacing(2),
↓
padding: theme.getSpacing(2),

// src/components/Organisms/ContentList/ContentList.tsx:213
width: `calc(100% - ${theme.spacing(4)})`,
↓
width: `calc(100% - ${theme.getSpacing(4)})`,

// src/components/Organisms/ContentList/ContentList.tsx:214
height: theme.spacing(6),
↓
height: theme.getSpacing(6),

// src/components/Organisms/MediaCard/MediaCard.tsx:301
height: (theme) => theme.spacing(4),
↓
height: (theme) => theme.getSpacing(4),

// src/components/Organisms/FileUploader/components/FileItemContainer.tsx:13,16
padding: theme.spacing(2),
gap: theme.spacing(2),
↓
padding: theme.getSpacing(2),
gap: theme.getSpacing(2),

// src/components/Organisms/FileUploader/components/DropzoneContainer.tsx:47
gap: theme.spacing(3),
↓
gap: theme.getSpacing(3),

// src/components/Organisms/FileUploader/components/ThumbnailBox.tsx:4,5
width: theme.spacing(7),
height: theme.spacing(7),
↓
width: theme.getSpacing(7),
height: theme.getSpacing(7),
```

### Multi-arg — direct migration

```tsx
// src/components/internal/DataToolbar.tsx:601
padding: theme.spacing(0, 1, 0, 1),
↓
// `0` is not in SpacingFactor — see exception above
padding: `0 ${theme.getSpacing(1)} 0 ${theme.getSpacing(1)}`,

// src/components/Organisms/DataGrid/RingDataGridToolbar.tsx:451
padding: theme.spacing(0, 1, 0, 1),
↓
padding: `0 ${theme.getSpacing(1)} 0 ${theme.getSpacing(1)}`,

// src/components/Organisms/Filters/FiltersWrapper/FiltersWrapper.tsx:77
sx={{ p: theme.spacing(1, 0, 1, 0) }}
↓
sx={{ p: `${theme.getSpacing(1)} 0 ${theme.getSpacing(1)} 0` }}
```

### Special: parseFloat / parseInt — getSpacing returns string identically

```tsx
// src/components/Organisms/ContentList/ContentList.tsx:81-82
const CONTAINER_PADDING = parseFloat(theme.spacing(2)); // Box padding (p: 2)
const HEADER_MARGIN_BOTTOM = parseFloat(theme.spacing(2));
↓
const CONTAINER_PADDING = parseFloat(theme.getSpacing(2));    // 16 (numeric)
const HEADER_MARGIN_BOTTOM = parseFloat(theme.getSpacing(2));

// src/components/Organisms/FileUploader/FileUploader.tsx:121
fontSize: (theme) => parseInt(theme.spacing(6))
↓
fontSize: (theme) => parseInt(theme.getSpacing(6))
```

`getSpacing(2)` and `spacing(2)` both return `'16px'` — `parseFloat`/`parseInt` behave identically.

### Edge case — dynamic arguments

Some places use variables (not literals) as arguments. Here **TS strict typing** helps or blocks, depending on the declaration:

```tsx
// src/components/Organisms/FileUploader/components/DropzoneContainer.tsx:42
padding: theme.spacing(config.padding.vertical, config.padding.horizontal),
```

If `config.padding.vertical/horizontal` are typed as `SpacingFactor`, migration is trivial:

```tsx
padding: theme.getSpacing(config.padding.vertical, config.padding.horizontal),
```

If typed as `number` — TS will throw an error. You need to narrow the type in the `config` definition:

```tsx
// BEFORE (somewhere in types):
interface DropzoneConfig {
    padding: { vertical: number; horizontal: number };
}

// AFTER:
import type { SpacingFactor } from '@ringpublishing/mui-theme';
interface DropzoneConfig {
    padding: { vertical: SpacingFactor; horizontal: SpacingFactor };
}
```

This is **desired** — it enforces compile-time validation that no one passes `vertical: 2.7` in the config.

```tsx
// src/components/Organisms/FileUploader/components/UploadIconContainer.tsx:29-30
width: theme.spacing(containerSize),
height: theme.spacing(containerSize),
```

Here `containerSize` should be `SpacingFactor`. Check the prop declaration and narrow it if needed.

```tsx
// src/components/Organisms/MultimediaGrid/useSpacing.ts:62-63
const themeRowSpacing = theme.spacing(resolved.row);
const themeColumnSpacing = theme.spacing(resolved.column);
```

`resolved.row` / `resolved.column` should be `SpacingFactor`. Consumer hook — documenting the type is part of the migration.

### Historical comment — no action needed

```tsx
// src/components/Organisms/MediaCard/MediaCard.tsx:431
// MUI v6 compatibility: using fixed px values instead of theme.spacing(0.25)
```

The comment points to a workaround (`theme.spacing(0.25)` does not exist in v6 scale). In v7.2 it doesn't exist either — `0.25` is not in `SpacingFactor`. **The comment is still valid**, the code is untouched. Optionally update the API name in the comment: `theme.getSpacing(0.25)`.

## Migration workflow per file

### Step 1 — run rg/grep for the file

```bash
grep -n "theme\.spacing" path/to/file.tsx
```

### Step 2 — check each occurrence

- Single arg with a literal (e.g. `theme.spacing(1)`): replace with `theme.getSpacing(1)`. If the arg is outside `SpacingFactor` (`0`, `0.25`, `13`, etc.) — reconsider, report as a bug
- Multi-arg with literals: if all are in `SpacingFactor`, map 1:1. If any is `0`, use a template literal (see above)
- Variable argument: check the type. If `number`, narrow it to `SpacingFactor` in the prop/config declaration

### Step 3 — typecheck

```bash
npm run typecheck
```

TypeScript will catch all magic numbers (like `theme.getSpacing(2.7)`). Each such error is **good news** — design system constraint working as intended. Replace the magic number with the correct step or report to design QA.

### Step 4 — runtime check

Storybook → relevant component → visually verify that spacing has not changed. If it previously gave e.g. `21.6px` (from `theme.spacing(2.7)`), and now gives `0px` (from `getSpacing(2.7)` invalid factor) — there was a magic number, fixing it requires a design decision.

## Common pitfalls

### 1. `theme.spacing(0)` — `0` is not a valid `SpacingFactor`

`SpacingFactor = 0.5 | 1 | 1.5 | 2 | 3 | ... | 12`. No `0`. If you see `theme.spacing(0)`, use the literal `0` or `'0px'`:

```tsx
// BEFORE:
margin: theme.spacing(0),
↓
margin: 0,
```

### 2. `theme.spacing()` with arity > 4

MUI's `theme.spacing()` (typically) accepts 1-4 args. If any legacy code passes 5+ args, getSpacing will return `0px` + console error. Practically never observed, but worth knowing.

### 3. CSS shorthand vs MUI `sx={{ p: ... }}` (numeric)

```tsx
sx={{ p: 2 }}    // ← MUI multiplier shorthand, NOT theme.spacing
```

This is **MUI-specific syntax** — `sx={{ p: 2 }}` is interpreted as `theme.spacing(2)` automatically by the MUI styling engine. **Do not touch** — this is not an explicit call to `theme.spacing()`. Migration applies only to **explicit** calls in code.

If you want strict design system constraints in `sx` props too, that would be a separate decision (ESLint rule or a wrapper on `sx`). Out of scope for this document.

### 4. `theme.spacing()` used in `theme.components.MuiX.styleOverrides`

In ring-ui-components we don't have anything like that (today), but if it appears — migrate analogously:

```tsx
// theme.components.MuiButton.styleOverrides:
root: ({ theme }) => ({
    padding: theme.spacing(1, 2),     // BEFORE
    padding: theme.getSpacing(1, 2),  // AFTER
})
```

## Migration order — proposal

Migration is **not urgent** — `theme.spacing()` works at runtime. But a good incremental plan:

1. **Phase 1** (now): new code **does not use** `theme.spacing()`. Code review catches it on PR.
2. **Phase 2** (sprint): go through the existing 22 occurrences, migrate trivial ones (single-arg, multi-arg, parseFloat).
3. **Phase 3** (later): narrow types `number → SpacingFactor` in configs (`DropzoneConfig`, `containerSize`, `useSpacing`). May catch a few magic numbers.
4. **Phase 4** (later): ESLint rule `no-restricted-properties` blocking `theme.spacing()` in consumer code (Ring components stay as-is for runtime, MUI's internal spacing untouched).

## Consumers of ring-ui-components

Migration in the **library** (ring-ui-components) is independent of consumers (apps using `<Button />`, `<DataGrid />`, etc.). After completing the migration in the lib:

- **Consumer apps** now have `theme.getSpacing()` available in their `sx` callbacks (via `useTheme()`).
- Consumers can migrate their own internal `theme.spacing()` uses analogously.
- The ESLint rule can also be distributed (if we want to enforce it).

## FAQ

**Q: Can I use `theme.getSpacing()` with a config from a consumer prop?**
A: Yes, but the prop type must be `SpacingFactor`:
```tsx
interface MyComponentProps {
    padding: SpacingFactor;   // ← not number
}
const MyComponent = ({ padding }: MyComponentProps) => (
    <Box sx={{ p: theme.getSpacing(padding) }} />
);
```

**Q: Does `getSpacing` have overhead vs `spacing`?**
A: Marginal. Single dispatch, switch case on version + array lookup. A micro-benchmark showed <0.1ms per 1000 calls. Not worth worrying about.

**Q: What if my custom Theme overrides in a consumer app change `spacing`?**
A: `theme.spacing` overrides are respected by MUI internal. `theme.getSpacing` uses the **Ring-defined `spacingScale`** (from theme.lib) — regardless of overrides. So the result of `theme.spacing(2)` may differ in an app with custom spacing overrides from `theme.getSpacing(2)`. **This is a feature** — the Ring DS strict scale does not change per-consumer.

**Q: Is the migration backward compatible?**
A: Yes — `theme.spacing()` still works. Migration is optional and incremental. `getSpacing()` is just a new API alongside the old one.

## Related documents

- [theme.lib ADR-008](https://github.com/Ringier-Axel-Springer-PL/ring-ui-mui-theme/blob/master/docs/adr/008-strict-getSpacing-api.md) — design rationale + full API spec
- [theme.lib ADR-006](https://github.com/Ringier-Axel-Springer-PL/ring-ui-mui-theme/blob/master/docs/adr/006-mui-module-augmentation-categories.md) — `getSpacing` is Category A augmentation (propagates cross-package automatically)
- [theme.lib spacing.generated.ts](https://github.com/Ringier-Axel-Springer-PL/ring-ui-mui-theme/blob/master/src/theme/config/v7.2/spacing.generated.ts) — definition of `spacingScale` and `SpacingFactor` for v7.2
