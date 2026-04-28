# ADR-001: Date Picker — Placeholder and Accessible DOM

## Status

Accepted (March 2026)

## Context

MUI X v8 date pickers introduce a new **accessible DOM structure** (`enableAccessibleFieldDOMStructure={true}`, the default). Instead of rendering a standard `<input>` element, pickers render date/time sections as individual `<span>` elements (e.g., `MM`, `DD`, `YYYY`) wrapped in `MuiPickersSectionList`.

This accessible DOM structure **does not support** the HTML `placeholder` attribute, because there is no single `<input>` element to display it on. The placeholder is replaced by the section labels themselves.

Our DatePicker, DateTimePicker, and TimePicker components expose a `placeholder` prop that users expect to work.

## Original Decision (March 10, 2026)

We conditionally set `enableAccessibleFieldDOMStructure` based on the `placeholder` prop:

```tsx
<MuiDatePicker
    enableAccessibleFieldDOMStructure={!placeholder}
    {...muiDatePickerProps}
/>
```

- **Without `placeholder`** (`enableAccessibleFieldDOMStructure={true}`): Uses MUI X v8 accessible DOM with section spans (MM/DD/YYYY). Better accessibility support.
- **With `placeholder`** (`enableAccessibleFieldDOMStructure={false}`): Falls back to legacy TextField mode with a standard `<input>` element that supports placeholder text.

### Problems discovered

1. **Tab navigation broken in legacy mode** — When `enableAccessibleFieldDOMStructure={false}`, the picker renders a single `<input>` element. Pressing Tab exits the picker entirely instead of navigating between date sections (MM → DD → YYYY). This is a fundamental architectural limitation of legacy mode, not a fixable bug.

2. **`enableAccessibleFieldDOMStructure={false}` is deprecated** — MUI X v8 marks it as deprecated. It will be removed in MUI X v9. Building on a deprecated API creates tech debt.

3. **Placeholder visibility fixed upstream** — [mui/mui-x#18996](https://github.com/mui/mui-x/issues/18996) was resolved (PR #19318, August 2025). Section placeholders (MM/DD/YYYY) are now visible in accessible DOM mode.

4. **Two DOM structures = maintenance burden** — Snapshot tests, CSS selectors, and accessibility tree all differed based on whether `placeholder` was provided.

## Intermediate Decision (March 11, 2026) — Overlay placeholder

We attempted to keep the `placeholder` prop by implementing it as a **visual overlay** — a `<span>` with `position: absolute` rendered above the date sections, hidden via `color: transparent`. This included:

- `usePlaceholderOverlay` hook for focus/value state management
- `PlaceholderOverlay` internal component with `useTheme()` for dark mode support
- Wrapper `<div>` with `onFocus`/`onBlur` event bubbling

The overlay was technically functional, but added unnecessary complexity (hook, internal component, wrapper div, conditional sx styling, onChange interception) when MUI already provides the same UX natively via the `label` prop.

## Final Decision (March 11, 2026)

**Remove the `placeholder` prop entirely** from DatePicker, DateTimePicker, and TimePicker. This is a **breaking change**.

### Rationale

MUI's `label` prop with `variant="standard"` provides identical behavior natively:

1. **Empty + unfocused** → label text displayed inside the field (like a placeholder)
2. **Click/focus** → label floats up above the field, date sections (MM/DD/YYYY) visible for editing
3. **Select value** → value displayed, label remains floated above
4. **Clear value + blur** → label returns to inside the field

This is the standard MUI floating label pattern. No custom code needed — it works out of the box.

### Migration path

Replace `placeholder` with `label`:

```tsx
// Before (removed)
<DatePicker placeholder="Select date" />

// After
<DatePicker label="Select date" />
```

### Removed files

- `src/helpers/hooks/usePlaceholderOverlay.ts`
- `src/components/internal/PlaceholderOverlay.tsx`

## Consequences

### Breaking change

Users who relied on the `placeholder` prop must migrate to `label`. The visual behavior is equivalent — text appears inside the field when empty and disappears (floats up) on focus.

### `sx={{ color }}` does not propagate to input text

MUI X v8 `PickersInputBaseRoot` has a **hardcoded** `color: palette.text.primary` from the theme. To override, target the internal element directly:

```tsx
<DatePicker
    sx={{
        '& .MuiPickersInputBase-root': { color: 'blue' },
    }}
/>
```

### Label vertical positioning in standard variant

When `openPickerButtonPosition: 'start'` (our default), MUI creates a `startAdornment` which shifts the label position. In the `standard` variant, the label appears too close to the picker icon vertically compared to the `outlined` variant.

We fix this by applying `InputLabelProps.sx.top: '-4px'` only when `resolvedVariant === 'standard'`. This is handled by a shared helper `mergePickerTextFieldProps` located in `src/components/Atoms/Dates/mergePickerTextFieldProps.ts`.

The helper performs a **deep merge** of `InputLabelProps.sx` — our default `top: '-4px'` is applied first, then the user's `InputLabelProps.sx` is spread on top. This means:
- Users can override `top` by passing their own `InputLabelProps.sx.top`
- Users can add additional styles (e.g. `color`) without losing the `top` fix
- When variant is not `'standard'` (e.g. `'outlined'`), the helper passes user props through without modification

### Variant override pattern

The `variant` prop defaults to `'standard'` but users can override it via `slotProps.textField.variant`. Because `textField` is a callback slot, the resolved variant must be computed before building the props object:

```tsx
const resolvedVariant = (otherProps?.slotProps?.textField as Record<string, unknown>)?.variant as string ?? 'standard';
```

The `variant` is placed **after** the user spread to ensure it always matches the resolved value (preventing TS union type errors).

## Affected components

- `src/components/Atoms/Dates/DatePicker/DatePicker.tsx`
- `src/components/Atoms/Dates/DateTimePicker/DateTimePicker.tsx`
- `src/components/Atoms/Dates/TimePicker/TimePicker.tsx`
- `src/components/Atoms/Dates/mergePickerTextFieldProps.ts` (shared helper)
