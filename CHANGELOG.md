# CHANGELOG

The format is based on [Keep a Changelog](https://keepachangelog.com/), and this project adheres to [Semantic Versioning](https://semver.org/).

## [2.0.1] - 2026-10-30

### Changed

- [@wniemiec]: Storybook — a version select under the sidebar search links to the 1.19 documentation, served under `/v1/`. No change to the published package.
- [@wniemiec]: Storybook — files whose names stay the same between builds are revalidated on every load and hashed assets are cached for a year, so a page opened after a new deployment no longer needs a hard reload. No change to the published package.

### Removed

- [@wniemiec]: The npm package no longer contains `AGENTS.md`, `CLAUDE.md` and `.claude/` — no change is needed in consumer code.

## [2.0.0] - 2026-10-29

**Breaking release — see [Migration FAQ → Breaking version upgrades → 2.0.0](https://design.ringpublishing.com/?path=/docs/migration-faq-breaking-version-upgrades-2-0-0--docs).** Components render the redesigned Ring design system by default. Every entry marked **BREAKING** has a section in that guide; the section says where to look, what to change and shows a before/after example.

### Added

- [@wniemiec]: `CopyIconButton` — writes `value` to the clipboard and confirms with a check glyph, a tooltip and a live region; `labels`, `ariaLabels` and `copiedForMs` customise it.
- [@wniemiec]: `FeaturedIcon` — a glyph on a circular plate for missing content; `size` is `small`, `medium`, `large` (plates of 40, 60, 80px) or `inherit`, `color` is `default`, `primary`, `info`, `success`, `warning` or `error`.
- [@wniemiec]: `RingIconDefaults` — gives plain `lucide-react` icons the design system's 20px size and 1.5px stroke, MUI palette names in `color` and the `SvgIcon` sizes in `fontSize`; `ThemeConfig` mounts it, explicit props win.
- [@wniemiec]: `AIPencilIcon`, `EarthOffIcon`, `ListFilterOffIcon` — Ring glyphs wrapped in `RingLucideIcon` (`color`, `fontSize`, `sx`), the bare glyphs and `createRingIcon(glyph, name)`, exported from the root and from `@ringpublishing/mui-components/icons`.
- [@wniemiec]: `Switch` — wraps MUI `Switch` with Ring test ids and `primary` / `error` colours.
- [@wniemiec]: `Media` — `actionsAriaLabel` names the actions button (default `More actions`), and `fullScreenPreviewAriaLabel` names the image when it opens the full-screen preview.
- [@wniemiec]: `Autocomplete` — `duplicateEntryMessage` and `onDuplicateEntry` for `multiple` + `freeSolo` fields report an entry that is already selected instead of dropping it silently.
- [@psulich]: `Autocomplete` — `variant="chipsInput"` with `createChipsOnPaste` / `pasteSeparators`, `validateEntry`, `chipMaxWidth` and duplicate feedback for pasted entries.
- [@wniemiec]: `Autocomplete` — `sortableChips` reorders selected chips by pointer drag and reports the order through `onChange` with the `reorder` reason; `renderChip` receives `isDragActive`; `limitTags` is ignored (with a console warning) while it is on.
- [@wniemiec]: `Autocomplete` with `sortableChips` — while a chip is dragged, and for the 180ms drop animation, its ghost repeats the chip's `data-testid`; an e2e assertion made mid-drag needs `.first()`.
- [@wniemiec]: `SortableList` — `orientation` (`vertical` | `horizontal` | `wrap`) and `labels.dragHandle`.
- [@wniemiec]: `createActionCellRenderer(labels)` — a `renderActionCell` factory that localises the row actions button name; `Autocomplete` takes `labels.moreActions` for the same purpose.
- [@omaziarz]: Lists, grids, trees and `Autocomplete` chips carry `ring-<component>[-<suffix>]` on the root and a test id on every item; items of `SortableList`, `ContentList`, `MultimediaGrid`, `RingDataGrid` and the trees take `dataTestId` or `itemDataTestIdSuffix`, and `SortableList`, `ContentList` and `MultimediaGrid` take `getItemDataTestId`, `RingDataGrid` `getRowDataTestId`.
- [@omaziarz]: `RingDataGrid` and `MultimediaGrid` toolbars, also inside `DataView` — every control is tagged (`ring-datatoolbar[-<suffix>]-refresh`, `-sort`, `-sort-select`, `-auto-refresh`, `-toggle-left-slot`, `-bulk-item-<index>`, `-bulk-close`).
- [@omaziarz]: `renderActionCell`, `renderLinkCell` and `renderComboCell` tag their contents `ring-datagrid[-<suffix>]-item-<rowId>-<field>`.
- [@omaziarz]: `DataView`, `FiltersWrapper`, `TextEditor` (root, content and heading select), the `DatePicker` and `DateTimePicker` clear and actions buttons, `EditableText` and `FeatureTooltip` carry root `data-testid` attributes.
- [@omaziarz]: `TextField`, `ActionBox`, `MediaCard` and `FeaturedIcon` accept a verbatim root override as `dataTestId` or `data-testid`; on `TextField` it also prefixes the input, action and menu ids.
- [@wniemiec]: `FilterChip`, `BottomBarSlotProps`, `BottomBarApiRef`, `MediaGridApi`, `RingDrawerProps`, `RingLucideIconProps` and `RingLucideIconColor` are exported from the package root.
- [@wniemiec]: the types a consumer builds for public props are exported from the package root: `CommonComponentProps`, `WithItemDataTestId`, `GetItemDataTestId`, `AlertAction`, `AlertButtonAction`, `AlertLinkAction`, `AlertContentProps`, `MediaCardFieldsItem`, `FileUploaderLabels`, `CommentProps`, `CommentsActionsLabels`, `CommentIdProp`, `OnAddApi`, `OnUpdateApi`, `OnDeleteApi`, `DataToolbarLabels`, `DataToolbarSortableFields`, `DataToolbarBaseProps`, `ResponsiveValue`, `BreakpointValue`, `SelectionModelChangeHandler`, `InfiniteScrollOptions`, `ActiveCardChangeParams`, `MediaGridApiInstance`, `RingGridInitialState`, `MediaSlots`, `MediaSlotProps`, `MediaSlotMediaProps`, `MediaSlotPropsBackgroundColor`, `MediaBottomTooltipProps`, `DetailMediaProps`, `DetailMediaBaseProps`, `DetailMediaBottomIcon` (with `…Base`, `…WithIcon`, `…WithChip`), `FeatureTooltipActions`, `FeatureTooltipPropsBase`, `AutocompleteOption`, `AutocompleteBaseProps`, `AutocompleteMuiProps`, `AutocompleteValueFor`, `AspectRatioOwnerStateProps`, `BottomBarContextState`, `RangesOption` and `RangesRange`.
- [@wniemiec]: `SearchBox` and `SearchBar` take `size`: `small` (32px) or `medium` (40px, the default), the heights of `TextField`, `Select` and `Autocomplete`.

### Changed

- [@wniemiec]: **BREAKING** — `@ringpublishing/mui-theme` 5, `@emotion/react` and `@emotion/styled` are peer dependencies instead of dependencies; with npm upgrade the theme before the components, with pnpm install both in one command, with yarn 1 add all three yourself.
- [@wniemiec]: **BREAKING** — components render the redesigned Ring design system by default: a new palette, typography, spacing, border radius and shadows. Load the Inter font (`@fontsource/inter`, weights 300–700) or text falls back to the system font; `ThemeConfig` renders its children once the Inter files have loaded, at most 2s later, unless `waitForFonts={false}`.
- [@wniemiec]: **BREAKING** — `ThemeConfigProps` and `GetCreatedThemeOptions` have no `version`, so `<ThemeConfig version=…>` and `getCreatedTheme(mode, { version })` no longer compile; remove `version`.
- [@wniemiec]: **BREAKING** — `Detail` field names and the `Placeholder` footer render `caption`, `Detail` section titles and the `FileUploader` heading `subtitle2`, the `FiltersWrapper` heading `subtitle1` instead of the `headline*` / `label` variants; the uppercase is gone.
- [@pjarolewski]: **BREAKING** — icons come from `lucide-react` (peer dependency, `^1.42.0`) instead of `@mui/icons-material`; install `lucide-react`, swap Material icons passed as props for lucide ones, and drop `@mui/icons-material` if nothing else needs it.
- [@pjarolewski]: **BREAKING** — the components' icons no longer carry MUI's `data-testid="<Name>Icon"` (`MoreVertIcon`, `ExpandMoreIcon`, `CloseIcon`, `DragHandleIcon`, …); select the control by its role and accessible name.
- [@wniemiec]: **BREAKING** — under `ThemeConfig` a plain `lucide-react` icon renders 20px with a 1.5px stroke at every size instead of 24px with a 2px stroke that scales with the icon; wrap a subtree in `lucide-react`'s `<LucideProvider>` to keep lucide's defaults.
- [@wniemiec]: **BREAKING** — a plain `lucide-react` icon with `absoluteStrokeWidth` renders a thinner stroke than before (`<Save absoluteStrokeWidth size={32} />`: 2px → 1.125px); drop the prop, the stroke stays 1.5px at every size without it.
- [@wniemiec]: **BREAKING** — `AutocompleteChangeReason` is declared locally as MUI's union plus `'reorder'`; import it from `@ringpublishing/mui-components` and handle `reorder` in exhaustive switches; a handler typed with MUI's reason no longer compiles.
- [@psulich]: **BREAKING** — `AutocompleteProps<T>` also includes `ChipsInputAutocompleteProps<T>`, so reading `actions`, `recentlyLocalStorageKey` or `options` from it no longer compiles; type the wrapper as `DefaultAutocompleteProps<T> | FilterAutocompleteProps<T>` or narrow on `variant`.
- [@rmusial2]: **BREAKING** — `AutocompleteLabels.title` is `React.ReactNode` instead of `string`; check `typeof labels.title === 'string'` where a string is required.
- [@wniemiec]: **BREAKING** — chips delete with the lucide `X` instead of MUI's `CancelIcon`; key tests and CSS on `.MuiChip-deleteIcon` instead of `data-testid="CancelIcon"`.
- [@wniemiec]: **BREAKING** — `MediaCard` and `Media` status labels render as `variant="tag"` chips (`MuiChip-tag*` classes), and a `MediaCard` label with `tip` shows the library `Tooltip` instead of a native `title`.
- [@wniemiec]: **BREAKING** — `Accordion` string `label` renders `body1` in a `span` instead of `headline2`, losing the semibold weight and uppercase; pass a `Typography` node to keep them.
- [@wniemiec]: **BREAKING** — `Accordion` summary is a three-column grid; with `buttonLabel` the label takes the first column, about a third of the width, and wraps there.
- [@wniemiec]: **BREAKING** — `FiltersWrapper` inputs default to `variant="outlined"` instead of `standard`; pass `variant={VariantEnum.STANDARD}` to keep standard inputs.
- [@wniemiec]: **BREAKING** — `DatePicker`, `TimePicker` and `DateTimePicker` fields default to `variant="outlined"` instead of `standard`; pass `slotProps={{ textField: { variant: 'standard' } }}` to keep a standard field.
- [@jpalis]: **BREAKING** — `ActionBox` renders a MUI `Menu` instead of a `Popper`: Popper-only props are gone, the default placement changed, and the open menu locks page scrolling.
- [@wniemiec]: **BREAKING** — `Detail` field `icon` — a bare icon takes the field's 20px, an icon wrapped in another element keeps its own size, and the value wraps beside the icon.
- [@wniemiec]: **BREAKING** — the package declares `exports`: only `@ringpublishing/mui-components`, `/icons`, `/tree-dynamic-loading` and `/package.json` resolve, so imports from `dist/…` fail; import from the package root.
- [@wniemiec]: **BREAKING** — internal helpers are no longer exported: `globalDynamicItemsCache`, `getExpandedItemIds`, `filterItems`, `getAllItemIdsFromFilteredItems`, `getAllExpandedItemsFromCache`, `DataViewComponent`, `defaultValues`, `filterDataTreeItems`, `DescriptionField`, `EditableField`, `useSpacer`, `CustomGridRow`, `SEPARATOR_ROW_HEIGHT`, `UseSpacerProps` and `filtersWrapperComponents`; copy the helper into the application if it used one. See Breaking version upgrades.
- [@wniemiec]: the type declarations keep their JSDoc, so prop descriptions and `@deprecated` tags show in the editor.
- [@omaziarz]: **BREAKING** — `SimpleTree` and `DataTree` items with `loadItems` need `enableTreeDynamicLoading()` from `@ringpublishing/mui-components/tree-dynamic-loading`, called once in the app.
- [@omaziarz]: **BREAKING** — `ActionBox` action `data-testid`s are keyed by index instead of the localized label (`-item-move to trash` → `-item-<index>`).
- [@omaziarz]: **BREAKING** — an `ActionBox` rendered by another component is namespaced to its owner (`ring-actionbox[-<suffix>]-item-<label>` → `<owner-id>[-<control>]-menu-item-<index>`, e.g. `ring-textfield[-<suffix>]-menu-item-0`, `ring-datatoolbar[-<suffix>]-sort-menu-item-0`).
- [@omaziarz]: **BREAKING** — `Autocomplete` root and inner text field no longer share one `data-testid`; the field is `ring-autocomplete[-<suffix>]-textfield`, its input `-input`.
- [@omaziarz]: **BREAKING** — `Comments` item attributes gained an `item` segment (`ring-comments[-<suffix>]-<id>-…` → `-item-<id>-…`); create-panel selectors are unchanged.
- [@omaziarz]: **BREAKING** — `Ranges` rows follow the list convention (`ring-ranges-item-<code>[-<suffix>]-…` → `ring-ranges[-<suffix>]-item-<code>-…`); the nested range picker is `ring-autocomplete[-<suffix>][-<code>]-range-select`.
- [@omaziarz]: **BREAKING** — `Placeholder` puts the suffix before the variant (`ring-placeholder-<variant>[-<suffix>]` → `ring-placeholder[-<suffix>]-<variant>`); unsuffixed usage is unchanged.
- [@omaziarz]: **BREAKING** — `Detail` child field ids always carry the `detail` marker, also when a suffix is set.
- [@omaziarz]: **BREAKING** — the toolbar filters toggle is `ring-datatoolbar[-<suffix>]-toggle-left-slot` instead of `toggle-left-slot-button`.
- [@omaziarz]: **BREAKING** — `FileUploader` URL field is `ring-fileuploader[-<suffix>]-url` (input `-url-input`) instead of `ring-textfield-ring-fileuploader[-<suffix>]-url-input`; `ring-fileuploader[-<suffix>]` moved from the dropzone (now `-dropzone`) to the root.
- [@omaziarz]: **BREAKING** — `LightBox` image is `ring-lightbox[-<suffix>]-image` instead of `image`; the root carries `ring-lightbox[-<suffix>]`.
- [@omaziarz]: **BREAKING** — `Ranges` and `Media` pass `dataTestIdSuffix` to the empty range row and the icon placeholder (`ring-media-icon-placeholder` → `ring-media[-<suffix>]-icon-placeholder`).
- [@omaziarz]: **BREAKING** — `SplitButton` root carries `ring-splitbutton[-<suffix>]`; the main button is `-main`.
- [@omaziarz]: **BREAKING** — `MultimediaGrid` cards are keyed by item (`ring-mediacard[-<suffix>]-item-<row>-<column>` → `ring-multimediagrid[-<suffix>]-item-<id>`), and a `slotProps.mediaCard` test id no longer overwrites every card.
- [@wniemiec]: The package declares `sideEffects`; a bundler rule marking `dist/components/` as side-effect free can be removed.
- [@wniemiec]: **BREAKING** — `@ringpublishing/mui-theme` 5 has breaking changes of its own: scrollbar styling, withdrawn palette slots, `MuiCheckbox` and `MuiDataGrid` overrides and `Autocomplete` `slotProps.paper`.
- [@wniemiec]: `Autocomplete` takes its popup and clear icons from the theme.
- [@wniemiec]: `DatePicker`, `TimePicker`, `DateTimePicker`, `Alert` and `Accordion` take their icons from the theme instead of passing their own.
- [@wniemiec]: `DatePicker`, `TimePicker` and `DateTimePicker` clear with the lucide `x` instead of MUI's filled `ClearIcon`, and an `openPickerIcon` passed in `slots` is no longer replaced by the calendar or clock.
- [@wniemiec]: `ChipsGroup` — a `deleteIcon` passed in a chip's props replaces the lucide `x`.
- [@wniemiec]: `DataGrid` — the sort arrows and the column menu button are lucide's, from the theme.
- [@wniemiec]: `Accordion` — `label` accepts `React.ReactNode`.
- [@wniemiec]: `Accordion` — with `buttonLabel` the summary is a `<div role="button">` instead of a button nested in a button; keyboard behaviour is unchanged and a `disabled` accordion hides the action.
- [@wniemiec]: `Accordion` — expanded content padding comes from the theme (8px top, 16px sides and bottom) and can be overridden.
- [@wniemiec]: `FiltersWrapper` — the Accordion card is neutralised inside the filter sidebar, and `variant` / `size` also reach MUI X date and time fields.
- [@wniemiec]: `SortableList` — the dragged item follows the pointer as a lifted ghost and its slot becomes a dashed placeholder, in every orientation; a drag released more than 32px outside the list is cancelled and fires no `onChange`.
- [@wniemiec]: `SortableList` — items sit in a flex container, so adjacent item margins no longer collapse; move item spacing to `sx={{ gap }}` on the list and regenerate DOM snapshots.
- [@wniemiec]: `SortableList` — reorders are announced by position ("position 2 of 4") instead of dnd-kit's internal ids, and `SortableList.DragHandle` renders the lucide `GripVertical` instead of MUI's `DragHandle`.
- [@wniemiec]: `Detail` chips field — chip glyphs take the chip's own size instead of a forced 20px with an 8px margin.
- [@rsarata]: Icon buttons inside `TextField`, `Autocomplete` and the date/time pickers are 28px (24px in a small field) and no longer change the field height; `TextField` medium is 40px tall.
- [@wniemiec]: `DataView` bottom bar — the image tile's remove control is the lucide `X` on the overlay plate instead of a red outlined circle.
- [@wniemiec]: `Media`, `MediaCard` and the `DataGrid` combo cell draw a missing or failed image as a `FeaturedIcon`, the `DataView` bottom bar a missing one; `iconPlaceholder={null}` leaves a `MediaCard` without an image empty. Regenerate DOM snapshots of these components.
- [@wniemiec]: `FileUploader` — the upload icon is a `FeaturedIcon` with plates of 40, 60 and 80px in `small`, `medium` and `large` (was 24, 64 and 88px), so the dropzone is 16px taller in `small`, 4px shorter in `medium` and 8px shorter in `large`. At rest the plate is the `FeaturedIcon` default fill instead of `grey[100]`. The icon carries `ring-fileuploader[-<suffix>]-placeholder-icon`.
- [@wniemiec]: `FileUploader` takes its look from the theme (`theme.ringComponents.RingFileUploader` in `@ringpublishing/mui-theme`), so the drop area draws its border and fill per state from `palette.components.fileUploader` instead of the fixed `theme.colors` `RingGrey`, `RingBlue` and `RingBrandRed` shades, and its plate is the `FeaturedIcon` `primary` or `error` plate while a file is dragged over it or it shows an error. Restyle any part in the app theme with `components.RingFileUploader.styleOverrides` (slots `dropzone`, `fileItem`, `urlRow`, …), which is layered on top.
- [@wniemiec]: `FileUploader` switches to a compact layout when it is narrower than 400px (its own width, not the viewport): the upload button and `action` stack at full width, the URL submit moves under its field, and file rows draw a 24px icon with the percentage next to the size.
- [@wniemiec]: `FileUploader` renders `labels.uploadButton` and `slotProps.urlUploadSection.submitButton` as given instead of upper-casing them, and the URL submit is a small button.
- [@wniemiec]: `FileUploader` `small` — the link is a button reachable with the keyboard, the last word of `labels.dropzone` wraps together with it, the hint icon is focusable and shows its tooltip on focus, the `action` sits beside the text instead of between the link and the hint, and the horizontal padding is 16px (was 24px).
- [@wniemiec]: `FileUploader` — a file that is not uploading shows its size alone instead of `<uploaded> / <size>` (`0 Bytes / <size>` without `progress`), and without `headline` and `labels.description` no empty header space is left above the drop area.
- [@wniemiec]: `FileUploader` — a file without a `status` counts as uploaded in the files counter.
- [@wniemiec]: `FileUploader` — the file name in a row is a paragraph instead of an `h6` heading; a test that finds it by the `heading` role finds it by its text instead.
- [@wniemiec]: **BREAKING** — `FileUploader` passes to `onFilesSelected` only the files it takes: `accept` now applies to picked and dropped files and to a file row's replacement, and with `multiple` off only the first acceptable file is taken. The rest go to the new `onFilesRejected`, each with a `FileUploaderRejectionReason` (`FileTooLarge`, `FileInvalidType`, `TooManyFiles`) — move type and size messages from `onFilesSelected` there, and list extensions next to MIME types in `accept`. Previously files over `maxFileSize` were dropped without notice and a drop could pass any type or several files. See Breaking version upgrades.
- [@wniemiec]: `FileUploader` accessibility — remove and retry buttons are named after their file (`labels.removeFile`, `labels.retryFile`, `{name}` placeholder), the URL clear button is `labels.clearUrl` (default `Clear URL`, was `Clear`), the URL field is named by its section `title` when one is set, the submit is `aria-busy` while loading, the files counter reports `aria-expanded`, and error messages and the files counter are read out from a polite live region.
- [@wniemiec]: `Media` — an `onLoad` or `onError` in `slotProps.media` runs alongside the component's handler, so a failed source still falls back to the placeholder; call `event.preventDefault()` in your `onError` to swap in a fallback `src` yourself.
- [@wniemiec]: `DataGrid` combo cell — the thumbnail frame uses `palette.components.media.backgroundFill` instead of `palette.common.grey`.
- [@wniemiec]: `ContentList`, `SimpleTree`, `DataTree`, `TreeView` and `TextEditor` take selection, hover and border tints from the palette instead of fixed Material blues.
- [@wniemiec]: `MediaCard` and `Media` — the active tint is `primary.main` at the selected opacity, the selection checkbox and the media action button render `color="overlay"`, and the hover scrim follows the colour mode.
- [@wniemiec]: `SearchBox`, `SearchBar`, grid filter-chip prefixes and the `DataView` bottom bar use the text and icon palette tokens instead of `secondary`.
- [@wniemiec]: `SearchBar`, the `RingDataGrid` and `MultimediaGrid` toolbars and the grid filter chips draw their borders and divider in `palette.divider` instead of a fixed `#D9D9D9`, and the separator rows of `RingDataGrid` take the grid's row-line colour; the `SearchBox` icons rest in `palette.text.secondary` and turn `palette.text.primary` on hover and focus.
- [@wniemiec]: **BREAKING** — `SearchBox` is an outlined field like `TextField`: 40px tall (32px with `size="small"`), with the field border, fill and 8px corners, and its clear X is a 28px icon button (24px in a small field) named by `labels.clear`, default `Clear`; `sx` now styles the field root, so replace `height` with `size` and hide the frame through `.MuiOutlinedInput-notchedOutline` instead of `border`.
- [@wniemiec]: `TreeView`, `SimpleTree`, `DataTree`, `DataView` and its bottom bar draw their lines in `palette.divider` instead of `palette.components.datagrid.border` and `palette.components.dataview.border`.
- [@wniemiec]: **BREAKING** — `basicGrey100` and `basicGrey200` are no longer exported; use `palette.divider` for borders and dividers and `palette.text.secondary` for grey icons and text.
- [@wniemiec]: `Detail` bottom actions and the `Comments` cancel button render `color="inherit"`.
- [@wniemiec]: `ChipsGroup` — `+N` and `Show less` are outlined chips without a forced black border, and the `+N` label is a `+` element followed by the count, so `getByText('+3')` no longer finds it; query the chip and assert its `textContent`.
- [@wniemiec]: `RingDataGrid` and `MultimediaGrid` toolbars — auto-refresh is one toggle button with `aria-pressed`, separated from refresh by a divider; the filters toggle uses the `ListFilter` / `ListFilterOff` pair.
- [@wniemiec]: Retry after a failed load in `SimpleTree`, `DataTree`, `TreeView` and `FileUploader` uses `RotateCw`.
- [@wniemiec]: `renderComboCell` — the label is a `<div>` instead of a `<p>` and chips wrap flush left with an 8px gap; regenerate combo-cell DOM snapshots.
- [@rmusial2]: `LightBox` — scrollbars inside it (thumbnail strip, embedded `Detail`) use the dark palette's thumb on a transparent track through `scrollbar-color`; the strip's `::-webkit-scrollbar` rules are gone.
- [@wniemiec]: `ActionBox` — `onClose` fires before the action's `onClick` instead of after it.
- [@wniemiec]: `Autocomplete` — `componentsProps.paper` and `slotProps.paper` are merged key by key; `slotProps.paper` wins on keys both set.

### Deprecated

- [@wniemiec]: `Option` and `Range` of `Ranges` and `MuiOption` of `Autocomplete` are aliases of `RangesOption`, `RangesRange` and `AutocompleteOption`; use the new names, the old ones go away in 3.0.

### Removed

- [@psulich]: **BREAKING** — `ChipsInput` is removed, with `ChipsInputProps`, `ChipsInputLabels`, `AutocompleteChip`, `ChipColor` and `ChipsColorsType`; use `Autocomplete` with `variant="chipsInput"` (Migration FAQ → Breaking Version Upgrades → 2.0.0 → ChipsInput Migration).
- [@pjarolewski]: **BREAKING** — `@mui/icons-material` is no longer a peer dependency; see the `lucide-react` entry above.
- [@jpalis]: **BREAKING** — `determineTransformOriginFromPopperPlacement` is no longer exported.

### Fixed

- [@wniemiec]: `ActionBox` and every component that opens one — the menu is keyboard-operable, disabled actions are announced, and a button trigger carries `aria-haspopup`; regenerate DOM snapshots that contain a trigger.
- [@wniemiec]: `ActionBox` — the menu is at most 320px wide; a longer label ends with an ellipsis and shows in full in a tooltip; `sx={{ maxWidth }}` changes the limit.
- [@wniemiec]: `ActionBox` — a click beside an open menu only closes it and no longer reaches the card, row or list item the menu belongs to.
- [@wniemiec]: `ActionBox` — an action's tooltip moves below or above the item when there is no room beside the menu.
- [@wniemiec]: `Detail` — the warning about mixing chip and icon `bottomIcons` fires only for a mixed array.
- [@wniemiec]: `Detail` — description fields no longer mutate `descriptionItems` while rendering, so re-rendering with the same object no longer shows `Invalid Date`.
- [@wniemiec]: `Detail` — chip `badgeColor` and bottom-chip `color` accept `rgb()` / `rgba()` values and get a computed label colour; a translucent or unparseable value gets the default label colour.
- [@rsarata]: `Detail` — URL field values render `variant="caption"` like the other values, and the root `sx` accepts arrays and functions.
- [@wniemiec]: `EditableText` and `Detail` editable fields — the edit pencil is the same 26px icon button in the text and select variants.
- [@wniemiec]: `rename-package` migration — an import from a path the package does not export is rewritten to the package root and printed for review.
- [@wniemiec]: `renderComboCell` — the thumbnail has an empty `alt`.
- [@wniemiec]: `DataView` stays as wide as its container when the grid's columns do not fit.
- [@wniemiec]: `Autocomplete` with `variant="filter"` — the dropdown takes the theme's elevation instead of a pinned elevation 1.
- [@wniemiec]: `Autocomplete` — `slotProps.textField.slotProps` (`input`, `htmlInput`, `inputLabel`) and `InputLabelProps` are merged into the inner field instead of replaced.
- [@wniemiec]: `Autocomplete` — the actions menu button has an accessible name (`labels.moreActions`), a disabled single action is named by its label, and the loading spinner is no longer a button.
- [@omaziarz]: `TextField` — caller-supplied `slotProps` no longer remove the input's `data-testid`.
- [@wniemiec]: `Typography` with `enableOverflow` — an `sx` callback or array is applied; the generated class name of a truncating `Typography` changes, so regenerate DOM snapshots containing one.
- [@wniemiec]: Date and time picker icons are 20px like every other icon in a field.
- [@wniemiec]: `ContentList` — a wrapped navigation label is left-aligned, the selected-item marker covers a wrapped label, and the hover tint follows the colour mode.
- [@wniemiec]: `ChipsGroup` — the `+N` counter no longer flashes when the chips are re-measured, the clear-all button is not counted as a chip, and clicks on `+N`, `Show less` and the overflow anchor do not reach parent click handlers.
- [@wniemiec]: `Tooltip` — the subtitle and hint take their colour from the dark palette.
- [@wniemiec]: `SortableList.DragHandle` has an accessible name (`labels.dragHandle`, default `Drag to reorder`).
- [@wniemiec]: `SortableList` — a drag whose item the host removes before the drop ends without `onChange` instead of moving the last item.
- [@wniemiec]: `SortableList` — a press with the right or middle mouse button no longer picks an item up.
- [@wniemiec]: `renderActionCell` — the row actions button has an accessible name (default `More actions`).
- [@jpalis]: `ActionBox` — the menu's maximum height allows for MUI's 48px menu items on small screens, so the menu is no longer clipped.
- [@wniemiec]: `TreeView`, `DataTree`, `TextField`, `MediaCard`, the date pickers and `DataView` — the actions button is named `More actions` by default and takes a label prop (`rowActionsAriaLabel`, `actionsAriaLabel`, `slotProps.top.menuActionsAriaLabel`).
- [@wniemiec]: `SimpleTree` and `DataTree` with `queryClient` and `persistence` save and restore only the tree's own queries; the app's other queries in that client are no longer written to localStorage or overwritten on mount.
- [@wniemiec]: Tree rows — the expand button is no longer a tab stop (find it by its `-expand` test id), row checkboxes are named after the row label, and a `TreeView` row with `loadItems` loads when expanded from the keyboard.
- [@wniemiec]: `TreeView` — a row with `loadItems` no longer shows the children another `TreeView` loaded for the same `itemId` while its own `loadItems` runs.
- [@wniemiec]: `TreeView` — a child that `loadItems` returns with the `itemId` of its own row or of a row above it is left out instead of freezing the page.
- [@wniemiec]: `SimpleTree` and `DataTree` with `withSearch` — a row can be collapsed while a query is active; clearing the query restores the rows expanded before the search, and `persistence.restoreExpandedItems` saves those rather than the rows toggled during it.
- [@wniemiec]: `DatePicker` and `DateTimePicker` with `actions` — the clear button works from the keyboard and across the whole button, is disabled on a disabled or read-only picker and is named by the `fieldClearLabel` translation; an empty `actions` array shows neither button.
- [@wniemiec]: `Media` with `height` shows its placeholder when there is no image or it fails to load; a video or audio whose `slotProps.media.src` changes after a failed load plays the new source.
- [@wniemiec]: `Media` with `component: 'audio'` — the player takes the frame's `slotProps.media.sx.backgroundColor`, with controls that contrast with it.
- [@wniemiec]: `renderComboCell` — a row whose `imageUrl` changes after a failed load shows the new image, or the placeholder once the url is removed.
- [@wniemiec]: `Media` — the image takes its `alt` from `image.title`, then `title`, and with the full-screen preview enabled it is a keyboard-operable button named by `fullScreenPreviewAriaLabel`.
- [@wniemiec]: `TextEditor` — an image in the content takes its `alt` from the content, else from its `title`.
- [@rsarata]: `Autocomplete` with `menuListActions` — the heading next to the actions looks like a group heading and sticks to the top of the list, and the options under it are indented 24px, also without `groupBy`.
- [@wniemiec]: `MultimediaGrid` — the toolbar applies `sortField`, `refreshCallback`, the auto-refresh props (`autoRefresh`, `refreshRate`, `autoRefreshCallback`, `initialState`, `disableAutoRefreshOnUserInteraction`, `userInteractionDebounceDelay`) and the bulk-action props (`enableBulkActions`, `bulkActions`, `onBulkActionsClose`, `maxRowsCount`) instead of ignoring them; `enableBulkActions` turns on checkbox selection, and the bulk actions receive the selected ids.
- [@wniemiec]: `DataView` bottom bar — removing a `MultimediaGrid` item calls `onSelectionModelChange` with the remaining selection, like a checkbox click; a controlled `selectionModel` no longer keeps the removed item.

## [1.19.0] - 2026-09-14

### Added

- [@psulich]: `Autocomplete` — added `filter` variant.
- [@psulich]: `DataView` - added story with filter autocompletes.

## [1.18.0] - 2026-09-09

### Added

- [@rmusial2]: `CommonLanguages` — re-exported from `@ringpublishing/mui-components`, so the locale passed to `ThemeConfig` can be imported without depending on `@ringpublishing/mui-theme` directly.

### Changed

- [@rmusial2]: `ThemeConfig` — documented the optional `language` prop and its default English locale.

## [1.17.0] - 2026-08-31

### Added

- [@rsarata]: `Autocomplete` — added the `menuListActions` prop for rendering icon actions in options popup.

## [1.16.6] - 2026-08-20

### Fixed

- [@rmusial2]: `Autocomplete` — fixed recently-used option ordering and prevented focus when recently-used options are available.
- [@rmusial2]: `ActionBox` and `SortableList` — added open/close callbacks and prevented dragging a list item while its action menu is open.

## [1.16.5] - 2026-08-20

### Removed

- [@wniemiec]: `@mui/lab` is no longer a peer dependency — consumers do not need to install it.

## [1.16.4] - 2026-08-18

### Changed

- [@wniemiec]: CI — storybook deploy runs are labeled with their target (prod / beta / preview) and source branch. No change to the published package.

## [1.16.3] - 2026-08-18

### Changed

- [@wniemiec]: CI — a pull request targeting a `release/*` branch deploys its build to its own preview variant, marked as non-production. No change to the published package.

## [1.16.2] - 2026-08-17

### Changed

- [@wniemiec]: CI — storybook builds from `release/*` branches deploy to the BETA documentation variant; the production documentation deploys from `master` only. No change to the published package.

## [1.16.1] - 2026-08-17

### Fixed

- [@wniemiec]: `FeatureTooltip` — Storybook examples derive `endDate` from the current date instead of a fixed one, so they no longer stop displaying once that date passes.

## [1.16.0] - 2026-08-10

### Added

- [@rmusial2]: `Autocomplete` — added the `renderChip` prop for custom rendering of selected values in multiple mode, including access to the original option, resolved label, index, and MUI chip props such as `onDelete`.
- [@rmusial2]: `Autocomplete` — added Storybook examples for chip actions and additional selected-option details.

## [1.15.3] - 2026-08-06

### Fixed

- [@wniemiec]: `useRingDataTestId` call sites — replaced runtime `Component.name` with hardcoded string literals (24 call sites). `Function.name` is mangled by consumers' production minifiers (e.g. Vite's default esbuild), which turned stable `data-testid` values like `ring-searchbox-input` into non-deterministic ones like `ring-kh-input`. No change to rendered `data-testid` values.
- [@wniemiec]: `TreeView`, `MultimediaGrid` — `data-testid` no longer contains a literal `undefined` segment (e.g. `ring-treeview-undefined-item-0-expand`) when `dataTestIdSuffix` is not provided.
- [@wniemiec]: Storybook "Writing E2E tests" docs — `Autocomplete` section wrongly claimed the component has no `data-testid` attributes (it exposes the root, `-action`, `-actions`, and `-circular-progress`); documented the previously missing `Alert`, `EditableText`, and `Tooltip` attributes.

## [1.15.2] - 2026-07-31

### Changed

- [@rmusial2]: `@ringpublishing/mui-components-mcp` — documented MCP server setup and available tools in Storybook, and aligned its build and package-publishing configuration.

## [1.15.1] - 2026-07-27

### Fixed

- [@rsarata]: `Detail` — added `placeholderLabels.empty` support for custom empty-state placeholder labels.

## [1.15.0] - 2026-07-22

### Added

- [@omaziarz]: `Autocomplete` — options accept an `avatar` field (image URL or `ReactNode`) to show a leading avatar/image before the label in the default renderer, without overriding `renderOption`.

## [1.14.0] - 2026-07-16

### Added

- [@rmusial2]: `Alert` component.

## [1.13.2] - 2026-07-09

### Changed

- [@rmusial2]: `Autocomplete` - change popupIcon, clearIndicator and loadingIcon behavior.

## [1.13.1] - 2026-07-08

### Changed

- [@psulich]: Updated copilot-instructions.

## [1.13.0] - 2026-07-08

### Added

- [@omaziarz]: `Detail` — `mediaProps.enableFullScreenIcon`.
- [@omaziarz]: `Detail` — `mediaProps.handleFullScreenPreview`.
- [@omaziarz]: `Detail` — `mediaProps.slotProps.lightBox` (mutually exclusive with `handleFullScreenPreview`).

### Fixed

- [@omaziarz]: `Detail` — hides its download/zoom buttons when rendered inside a `LightBox`.
- [@omaziarz]: Filter chips (`RingDataGrid` / `MultimediaGrid`) — top/horizontal padding and divider color matched to the grid border.

## [1.12.0] - 2026-07-03

### Added

- [@omaziarz]: `Detail` — `mediaProps.enableDownloadIcon` and `mediaProps.handleImageDownload`.
- [@omaziarz]: `MultimediaGrid` — `filterChips` prop.
- [@omaziarz]: `Typography` / `MediaCard` — `alwaysShowTooltip` and `tooltipTitle`; MediaCard title via `alwaysShowTitleTooltip` / `titleTooltip`; also on `Detail` fields and `SimpleTree` / `DataTree` / `TreeView` nodes.
- [@omaziarz]: BottomBar (`RingDataGrid` / `MultimediaGrid`) — `getTooltip(row)` on the bottom-bar `slotProps`.

### Changed

- [@omaziarz]: Filter chips (`RingDataGrid` / `MultimediaGrid`) — key-only chips render without the `:` separator; clear-all shown only with more than one chip.

### Fixed

- [@omaziarz]: Filter chips (`RingDataGrid` / `MultimediaGrid`) — clearing all no longer leaves residual height.
- [@omaziarz]: `LightBox` — dark surround theme preserves custom palette extensions (fixes `reading 'tooltip'` crash).

## [1.11.0] - 2026-06-30

### Added

- [@psulich]: `Tooltip` component.

### Changed

- [@psulich]: Updated sync to public repository workflow to use `ring-action-sync-to-public`.

## [1.10.0] - 2026-06-29

### Added

- [@agorzanowska]: `TextEditor` — added `disableListInputRules` prop that disables auto-conversion of markdown-style list markers (e.g. `- `, `* `, `+ ` or `1. `) at paragraph start into bullet/ordered lists.

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
