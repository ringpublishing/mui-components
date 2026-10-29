import { EllipsisVertical, Search as SearchIcon, X } from 'lucide-react';
import {
    Autocomplete as MuiAutocomplete,
    AutocompleteChangeDetails,
    AutocompleteChangeReason as MuiAutocompleteChangeReason,
    AutocompleteInputChangeReason,
    AutocompleteProps as MuiAutocompleteProps,
    AutocompleteRenderInputParams,
    AutocompleteValue,
    Avatar,
    AvatarProps,
    Box,
    Chip,
    ChipProps,
    CircularProgress,
    IconButton,
    InputBase,
    InputAdornment,
    ListItemAvatar,
    ListSubheader,
    Paper,
    PaperProps,
    SxProps,
    Theme,
    Tooltip,
} from '@mui/material';
import { UniqueIdentifier } from '@dnd-kit/core';
import useForkRef from '@mui/utils/useForkRef';
import classNames from 'classnames';
import { castArray, isEqual, isNil, omit } from 'lodash';
import React, { createContext, useContext, useEffect, useLayoutEffect, useRef, useState } from 'react';

import { CommonComponentProps } from '../../../helpers/commonTypes.js';
import { useNonDraggableRef } from '../../../helpers/hooks/useNonDraggableRef.js';
import { useRingDataTestId } from '../../../helpers/hooks/useRingDataTestId.js';
import { DEFAULT_LUCIDE_ICON_SIZE } from '../../../helpers/lucideSize.js';
import { resolveMoreActionsAriaLabel } from '../../../helpers/moreActionsAriaLabel.js';
import { Action } from '../../../types.js';
import { DEFAULT_PASTE_SEPARATORS, splitPastedText } from './pasteEntries.js';

import { TextField, TextFieldProps } from '../TextField/TextField.js';
import { Typography } from '../../Atoms/Typography/Typography.js';
import { ActionBox } from '../ActionBox/ActionBox.js';
import { SortableChips } from '../../internal/SortableChips.js';
import { WithOwnerDataTestId } from '../../../helpers/dataTestId.js';

export type { AutocompleteChangeDetails } from '@mui/material';

/**
 * MUI's change reasons plus `reorder`, reported when `sortableChips` chips are drag-reordered.
 */
export type AutocompleteChangeReason = MuiAutocompleteChangeReason | 'reorder';

export interface AutocompleteLabels {
    /**
     * The title of the autocomplete
     */
    title: React.ReactNode;
    /**
     * The placeholder of the input
     */
    inputPlaceholder?: string;

    /**
     * The label of the recently used
     */
    recentlyUsed?: string;

    /**
     * The label of the results when, `showRecentlyUsed` is `true`
     */
    recentlyUsedResults?: string;

    /**
     * Accessible name of the actions menu button shown when more than one
     * action is provided.
     * @defaultValue 'More actions'
     */
    moreActions?: string;
}

export interface FilterAutocompleteLabels extends AutocompleteLabels {
    /** Placeholder displayed in the search field within the options panel. */
    searchPlaceholder?: string;
}

export type AutocompleteOption = Record<string, unknown> & {
    /**
     * Leading avatar shown before the option label in the default renderer: a string is an image
     * URL rendered in a circular `Avatar`, a `ReactNode` is rendered as-is. With `showRecentlyUsed`
     * only string avatars are persisted; a `ReactNode` is re-applied from the live option.
     */
    avatar?: string | React.ReactNode;
    caption?: string;
    groupBy?: string;
    id?: React.Key;
    label?: string;
    sortBy?: number;
};

export type AutocompleteMuiProps<Value> = MuiAutocompleteProps<Value, boolean, boolean, boolean>;

export type AutocompleteValueFor<Value> = AutocompleteValue<Value, boolean, boolean, boolean>;

const TypedMuiAutocomplete = MuiAutocomplete as unknown as <Value>(
    props: AutocompleteMuiProps<Value>,
) => React.JSX.Element;

export interface AutocompleteChipRenderContext<Value> {
    /** The original selected option. */
    option: Value;
    /** The label resolved by `getOptionLabel`. */
    label: string;
    /** The index of the selected option. */
    index: number;
    /** Props required by MUI Autocomplete, including the delete handler. */
    chipProps: React.ComponentProps<typeof Chip>;
    /** `true` when `validateEntry` rejected this entry; always `false` without it. */
    invalid: boolean;
    /**
     * True for every chip while a `sortableChips` drag is in progress — use it to suppress hover
     * affordances (e.g. tooltips) that would otherwise fire under the moving pointer. Always
     * `false` when `sortableChips` is not enabled.
     */
    isDragActive?: boolean;
}

export interface AutocompleteMenuListAction {
    /** Accessible label of the action button. */
    label: string;
    /** Accessible label of the action button when it differs from `label`. */
    ariaLabel?: string;
    /** Icon displayed in the action button. */
    icon: React.ReactNode;
    /** Ref forwarded to the action button, for example to use it as an external menu anchor. */
    anchorRef?: React.Ref<HTMLButtonElement>;
    /** Called when the action button is clicked. */
    onClick?: React.MouseEventHandler<HTMLButtonElement>;
    /** Disables the action button. @default false */
    disabled?: boolean;
    /** Tooltip text displayed when the action button is disabled. */
    disabledReason?: string;
}

export interface AutocompleteMenuListActions {
    /** Optional heading displayed at the start of the menu list header. Defaults to an empty string. */
    label?: string;
    /** Action buttons displayed after the heading. */
    actions: ReadonlyArray<AutocompleteMenuListAction>;
}

export interface AutocompleteBaseProps<Value = unknown>
    extends
        CommonComponentProps,
        Omit<
            AutocompleteMuiProps<Value>,
            'renderInput' | 'options' | 'value' | 'defaultValue' | 'onChange' | 'getOptionLabel'
        > {
    /** Options available for selection. */
    options: ReadonlyArray<Value>;
    /** Selected value. Strings are also accepted when `freeSolo` is enabled. */
    value?: AutocompleteValueFor<Value>;
    /** Initially selected value. Strings are also accepted when `freeSolo` is enabled. */
    defaultValue?: AutocompleteValueFor<Value>;
    /** Called when the selected value changes. */
    onChange?: (
        event: React.SyntheticEvent,
        value: AutocompleteValueFor<Value>,
        reason: AutocompleteChangeReason,
        details?: AutocompleteChangeDetails<Value>,
    ) => void;
    /** Resolves the text displayed for an option. */
    getOptionLabel?: (option: Value | string) => string;
    /**
     * Array of actions.
     * `[{
     *     label: string;
     *     onClick: () => void;
     *     disabled?: boolean;
     *     disabledReason?: string;
     *     icon?: React.JSX.Element;
     * }]`
     */
    actions?: Action[];

    /**
     * Icon actions displayed in the options popup: under a `label` heading, or next to the first
     * group heading when `groupBy` is set; ignored when `renderGroup` is provided. An action's
     * `anchorRef` exposes its button as an anchor for a separately rendered menu or popper.
     */
    menuListActions?: AutocompleteMenuListActions;

    /**
     * Renders each selected value in multiple mode, receiving the option, its resolved label, its
     * index and the merged chip props (`{ ...muiChipProps, ...slotProps.chip, label }`, including
     * the default delete handler). Used only when neither `renderValue` nor `renderTags` is set;
     * a custom renderer owns the tooltip and the chip actions.
     */
    renderChip?: (context: AutocompleteChipRenderContext<Value>) => React.ReactNode;

    /**
     * Message rendered under the field, in the error state, when a `freeSolo` entry is rejected for
     * being already selected (MUI drops it without calling `onChange`); a callback receives the
     * rejected text, after a paste the first rejected fragment. Requires `multiple` and `freeSolo`,
     * which `chipsInput` implies, and clears on the next input or value change.
     */
    duplicateEntryMessage?: React.ReactNode | ((entry: string) => React.ReactNode);

    /**
     * Called with the rejected text when a `freeSolo` entry is already selected: once per Enter, or
     * once per rejected fragment of a paste in the `chipsInput` variant. Requires `multiple` and
     * `freeSolo`, which `chipsInput` implies.
     */
    onDuplicateEntry?: (
        event: React.KeyboardEvent<HTMLDivElement> | React.ClipboardEvent<HTMLDivElement>,
        entry: string,
    ) => void;

    /**
     * If true (with `multiple`), the selected chips can be reordered by pointer drag&drop: on drop
     * `onChange` receives the reordered value with the `reorder` reason, and with a controlled `value`
     * the new order shows once the consumer stores it. Options need a stable identity (`getOptionKey`,
     * an `id` field or a unique label); the prop is ignored, with a console warning, under `renderValue`,
     * `renderTags`, `disabled` or `readOnly`, and while it applies, `limitTags` is ignored.
     * @defaultValue false
     */
    sortableChips?: boolean;

    /**
     * The labels of the autocomplete
     @example
     * `{ title: 'Tags', inputPlaceholder: 'Add a tag' }`
     */
    labels: AutocompleteLabels;

    /**
     * Show recently used items
     * @defaultValue false
     */
    showRecentlyUsed?: boolean;

    /**
     * The key for recently used local storage
     */
    recentlyLocalStorageKey?: string;
    /**
     * The limit of the recently used items
     * Default: `3`
     */
    recentlyUsedLimit?: number;
    /**
     * Proprietary props for the slot components.
     * This allows for customization of the underlying components used in the Autocomplete.
     */
    slotProps?: {
        /**
         * Props applied to the TextField element.
         */
        textField?: TextFieldProps;
        /**
         * Props applied to the option's `Avatar` when `avatar` is a string URL; `sx` is merged on
         * top of the default sizing. Ignored when `avatar` is a `ReactNode`.
         */
        avatar?: Partial<AvatarProps>;
    } & AutocompleteMuiProps<Value>['slotProps'];
}

export interface DefaultAutocompleteProps<Value = unknown> extends AutocompleteBaseProps<Value> {
    /** Input presentation used by default. */
    variant?: 'default';
}

export interface FilterAutocompleteProps<Value = unknown> extends Omit<
    AutocompleteBaseProps<Value>,
    'labels' | 'renderChip' | 'renderTags' | 'renderValue' | 'slotProps' | 'actions'
> {
    /** Uses a compact trigger with a selected-value count and a popup search field. */
    variant: 'filter';
    /** Labels for the filter trigger and popup search field. */
    labels: FilterAutocompleteLabels;
    /** Props applied to the search text field shown above the options. */
    searchTextFieldProps?: TextFieldProps;
    /** Not available in filter mode. */
    actions?: never;
    /** Props for MUI slots. Chip props are unavailable because filter mode does not render chips. */
    slotProps?: Omit<NonNullable<AutocompleteBaseProps<Value>['slotProps']>, 'chip' | 'textField'>;
}

export interface ChipsInputAutocompleteProps<Value = unknown> extends Omit<
    AutocompleteBaseProps<Value>,
    | 'multiple'
    | 'freeSolo'
    | 'options'
    | 'value'
    | 'defaultValue'
    | 'onChange'
    | 'renderValue'
    | 'renderTags'
    | 'actions'
    | 'menuListActions'
    | 'showRecentlyUsed'
    | 'recentlyLocalStorageKey'
    | 'recentlyUsedLimit'
    | 'sortableChips'
> {
    /** Multi-value free-text input that renders each entry as a chip. Implies `multiple` and `freeSolo`. */
    variant: 'chipsInput';
    /** Always `true` in this variant; do not pass it. */
    multiple?: never;
    /** Always `true` in this variant; do not pass it. */
    freeSolo?: never;
    /** Suggestions shown while typing. Without them the field has no popup. @default [] */
    options?: ReadonlyArray<Value>;
    /** Entries, as chips. Typed or pasted entries are strings. */
    value?: ReadonlyArray<Value | string>;
    /** Initially present entries when `value` is not passed. */
    defaultValue?: ReadonlyArray<Value | string>;
    /** Called when an entry is added or removed. */
    onChange?: (
        event: React.SyntheticEvent,
        value: Array<Value | string>,
        reason: AutocompleteChangeReason,
        details?: AutocompleteChangeDetails<Value | string>,
    ) => void;
    /**
     * Splits pasted text into chips instead of pasting it into the input. The text typed in the
     * input is replaced: it is discarded and the input is cleared.
     * @default false
     */
    createChipsOnPaste?: boolean;
    /**
     * Separators used to split pasted text when `createChipsOnPaste` is on. Fragments are trimmed
     * and empty ones are dropped.
     * @default [',', ';', '\n', '\t']
     */
    pasteSeparators?: ReadonlyArray<string>;
    /**
     * Marks an entry as invalid: its chip renders in the error color, but the entry is still added.
     * Checked at render, so chips passed through `value` are covered too; `slotProps.chip.color`
     * and `renderChip` take precedence.
     */
    validateEntry?: (entry: Value | string) => boolean;
    /**
     * Maximum width of a chip; a longer label is truncated with an ellipsis and shown in full in
     * the tooltip. A `maxWidth` in `slotProps.chip.sx` does not override it.
     * @default 150
     */
    chipMaxWidth?: number | string;
}

export type AutocompleteProps<Value = unknown> =
    DefaultAutocompleteProps<Value> | FilterAutocompleteProps<Value> | ChipsInputAutocompleteProps<Value>;

/** @deprecated Use `AutocompleteOption`. */
export type MuiOption = AutocompleteOption;

interface AutocompleteMenuListActionButtonProps extends WithOwnerDataTestId {
    action: AutocompleteMenuListAction;
}

function AutocompleteMenuListActionButton({
    action,
    dataTestId,
}: AutocompleteMenuListActionButtonProps): React.JSX.Element {
    return (
        <Tooltip title={action.disabledReason || action.label}>
            <Box sx={{ display: 'flex' }}>
                <IconButton
                    ref={action.anchorRef}
                    aria-label={action.ariaLabel || action.label}
                    data-testid={dataTestId}
                    disabled={action.disabled}
                    onMouseDown={(event): void => {
                        event.preventDefault();
                        event.stopPropagation();
                    }}
                    onClick={(event): void => {
                        event.stopPropagation();
                        action.onClick?.(event);
                    }}
                    size="small"
                >
                    <Box
                        sx={(theme): Record<string, unknown> => ({
                            display: 'flex',
                            '& > svg': { fontSize: theme.typography.pxToRem(20) },
                        })}
                    >
                        {action.icon}
                    </Box>
                </IconButton>
            </Box>
        </Tooltip>
    );
}

const isAutocompleteOptionObject = (option: unknown): option is AutocompleteOption => {
    return option !== null && typeof option === 'object' && !Array.isArray(option);
};

const stripRecentlyUsedMeta = (option: object): AutocompleteOption => {
    // A non-string `avatar` (React node) does not survive JSON serialization for
    // recently-used persistence and would break equality matching on reload, so it
    // is excluded from the persisted/compared shape. String (URL) avatars are kept.
    const { avatar } = option as AutocompleteOption;
    const keysToOmit = typeof avatar === 'string' ? ['groupBy', 'sortBy'] : ['groupBy', 'sortBy', 'avatar'];

    return omit(option, keysToOmit) as AutocompleteOption;
};

const getStoredRecentlyUsedItems = (
    showRecentlyUsed: boolean,
    recentlyLocalStorageKey?: string,
): AutocompleteOption[] => {
    if (!showRecentlyUsed || !recentlyLocalStorageKey) {
        return [];
    }

    try {
        const parsed: unknown = JSON.parse(localStorage.getItem(recentlyLocalStorageKey) || '[]');
        const stored: unknown[] = Array.isArray(parsed) ? parsed : [];
        const recentlyUsedItems: AutocompleteOption[] = [];

        for (const item of stored) {
            const flattenedItems = Array.isArray(item) ? item : [item];

            for (const flattenedItem of flattenedItems) {
                if (isAutocompleteOptionObject(flattenedItem)) {
                    recentlyUsedItems.push(stripRecentlyUsedMeta(flattenedItem));
                }
            }
        }

        return recentlyUsedItems;
    } catch {
        return [];
    }
};

const getOptionLabelFallback = (option: unknown): string => {
    if (typeof option === 'string') {
        return option;
    }

    if (isAutocompleteOptionObject(option) && typeof option.label === 'string') {
        return option.label;
    }

    return String(option);
};

const renderOptionWithCustomLabelAndCaption = (
    props: React.HTMLAttributes<HTMLLIElement> & { key?: React.Key },
    option: unknown,
    customGetOptionLabel: (option: unknown) => string,
    avatarSlotProps?: Partial<AvatarProps>,
): React.ReactNode => {
    const { key, ...optionProps } = props;
    const caption = isAutocompleteOptionObject(option) ? option.caption : undefined;
    const id = isAutocompleteOptionObject(option) ? option.id : undefined;
    const avatar = isAutocompleteOptionObject(option) ? option.avatar : undefined;

    const { sx: avatarSx, ...avatarRest } = avatarSlotProps ?? {};

    const avatarNode =
        typeof avatar === 'string' ? (
            <Avatar
                {...avatarRest}
                src={avatar}
                sx={[
                    (t: Theme): React.CSSProperties => ({ width: t.spacing(3), height: t.spacing(3) }),
                    ...(Array.isArray(avatarSx) ? avatarSx : avatarSx ? [avatarSx] : []),
                ]}
            />
        ) : (
            avatar
        );

    return (
        <li {...optionProps} key={id ?? key}>
            {avatarNode && (
                <ListItemAvatar sx={{ minWidth: 'auto', mr: 1.5, display: 'flex', alignItems: 'center' }}>
                    {avatarNode}
                </ListItemAvatar>
            )}
            <Box
                sx={(t: Theme): React.CSSProperties & Record<string, unknown> => ({
                    flexGrow: 1,
                    '& span': {
                        color: '#8b949e',
                        ...t.applyStyles('light', {
                            color: '#586069',
                        }),
                    },
                    overflow: 'hidden',
                })}
            >
                <Typography enableOverflow={true}>{customGetOptionLabel(option)}</Typography>
                {caption && (
                    <>
                        <Typography variant="caption" component="span">
                            {caption}
                        </Typography>
                    </>
                )}
            </Box>
        </li>
    );
};

/**
 * A selected option wrapped for `SortableChips`: a stable `id` plus the chip props resolved from
 * `getItemProps` at the option's position in the committed value, so they stay correct while the
 * working copy is reordered live during a drag.
 */
interface SortableChipItem<Value> {
    id: UniqueIdentifier;
    key: React.Key;
    option: Value;
    label: string;
    /** Index of the option in the committed (pre-drag) value — the index `renderChip` receives. */
    index: number;
    chipProps: ChipProps;
    /** `true` when `validateEntry` rejected this entry. */
    invalid: boolean;
}

/**
 * Stand-in event passed to `onChange` for a drag reorder, which no React event triggers; it has to
 * survive a consumer's `stopPropagation()`. `nativeEvent` is the pointer event that started the drag,
 * when dnd-kit surfaces one.
 */
const createReorderEvent = (activatorEvent?: Event): React.SyntheticEvent => {
    const target = activatorEvent?.target ?? null;
    const noop = (): void => undefined;

    return {
        type: 'reorder',
        nativeEvent: activatorEvent ?? { type: 'reorder' },
        target,
        currentTarget: target,
        bubbles: false,
        cancelable: false,
        defaultPrevented: false,
        eventPhase: 0,
        isTrusted: false,
        timeStamp: activatorEvent?.timeStamp ?? 0,
        preventDefault: noop,
        stopPropagation: noop,
        isDefaultPrevented: () => false,
        isPropagationStopped: () => false,
        persist: noop,
    } as unknown as React.SyntheticEvent;
};

/**
 * The delete glyph on a chip: a consumer icon from `slotProps.chip.deleteIcon`, otherwise the
 * lucide default at `size="1em"`, which follows the `.MuiChip-deleteIcon` font size.
 * `flexShrink: 0` keeps the glyph from being squeezed by a truncated label.
 */
const resolveChipDeleteIcon = (deleteIcon: React.ReactNode): React.ReactElement =>
    React.isValidElement(deleteIcon) ? deleteIcon : <X size="1em" style={{ flexShrink: 0 }} />;

type AutocompletePaperSlotProps = NonNullable<NonNullable<AutocompleteMuiProps<unknown>['slotProps']>['paper']>;

/**
 * Folds an object `componentsProps.paper` into `slotProps.paper`, which wins key by key; class names, `style`
 * and `sx` from both are combined. A `slotProps.paper` function is returned as is and replaces the other prop.
 */
function mergePaperSlotProps(
    componentsPaperProps: PaperProps | undefined,
    slotPaperProps: AutocompletePaperSlotProps | undefined,
): AutocompletePaperSlotProps | undefined {
    if (!componentsPaperProps || typeof componentsPaperProps !== 'object' || typeof slotPaperProps === 'function') {
        return slotPaperProps;
    }

    if (!slotPaperProps) {
        return componentsPaperProps;
    }

    // MUI types the slot's `ref` as a class-component ref, which a `div` ref does not satisfy.
    const slotPaper = slotPaperProps as PaperProps;
    const merged: PaperProps = { ...componentsPaperProps, ...slotPaper };

    if (componentsPaperProps.className && slotPaper.className) {
        merged.className = classNames(componentsPaperProps.className, slotPaper.className);
    }

    if (componentsPaperProps.style && slotPaper.style) {
        merged.style = { ...componentsPaperProps.style, ...slotPaper.style };
    }

    if (componentsPaperProps.sx && slotPaper.sx) {
        merged.sx = [componentsPaperProps.sx, slotPaper.sx].flat() as SxProps<Theme>;
    }

    return merged;
}

/**
 * A single draggable chip in the default (no `renderChip`) path. Its delete icon is non-draggable
 * so a click removes the option, and its tooltip is suppressed while any chip is being dragged.
 */
function SortableChipTag<Value>(props: { item: SortableChipItem<Value>; isDragActive: boolean }): React.JSX.Element {
    const { item, isDragActive } = props;
    const deleteIconRef = useNonDraggableRef<SVGSVGElement>();
    const { deleteIcon, ...chipProps } = item.chipProps;
    // The resolved icon only gains the ref that keeps a click on it from starting a drag.
    const resolvedDeleteIcon = resolveChipDeleteIcon(deleteIcon);

    return (
        <Tooltip title={isDragActive ? '' : item.label}>
            <Chip
                {...chipProps}
                deleteIcon={React.cloneElement(resolvedDeleteIcon as React.ReactElement<{ ref?: React.Ref<unknown> }>, {
                    ref: deleteIconRef.setRef,
                })}
            />
        </Tooltip>
    );
}

/**
 * `ChipProps` plus the per-chip `data-testid` the component always emits, declared so the
 * attribute survives the cast and reaches a `renderChip` consumer spreading `chipProps`.
 */
type ChipPropsWithTestId = ChipProps & { 'data-testid': string };

/** Chip rules of the `chipsInput` variant, applied on both chip render paths. */
interface ChipRules {
    validateEntry?: (entry: unknown) => boolean;
    chipMaxWidth?: number | string;
}

/**
 * The props both chip render paths hand to MUI: MUI's `getItemProps` result for the index, overlaid
 * with `slotProps.chip`, plus the resolved label and the per-chip `data-testid`. Shared by both
 * paths because the test-id format, the precedence and the `chipProps` shape are public API.
 */
function buildChipProps<G extends (state: { index: number }) => object>(params: {
    option: unknown;
    index: number;
    getItemProps: G;
    customGetOptionLabel: (option: unknown) => string;
    chipSlotProps: Partial<React.ComponentProps<typeof Chip>> | undefined;
    dataTestId: string;
    chipRules?: ChipRules;
}): { key: React.Key; label: string; chipProps: ChipPropsWithTestId; invalid: boolean } {
    const { option, index, getItemProps, customGetOptionLabel, chipSlotProps, dataTestId, chipRules } = params;
    const { key, ...chipPropsFromItem } = getItemProps({ index }) as ReturnType<G> & { key?: React.Key };
    const label = customGetOptionLabel(option);
    const invalid = chipRules?.validateEntry ? !chipRules.validateEntry(option) : false;
    const chipMaxWidth = chipRules?.chipMaxWidth;

    return {
        key: key ?? index,
        label,
        invalid,
        chipProps: {
            ...chipPropsFromItem,
            ...(invalid ? { color: 'error' } : {}),
            // Before `chipSlotProps`, so a consumer that sets its own `slotProps.chip['data-testid']`
            // still wins — the same precedence every other chip prop follows.
            'data-testid': `${dataTestId}-chip-${index}`,
            ...chipSlotProps,
            ...(chipMaxWidth === undefined
                ? {}
                : {
                      // MUI caps tags through `.MuiAutocomplete-root .MuiAutocomplete-tag`, which a rule on the
                      // chip's own class alone loses to. Three classes outrank it and the Chip's base rule.
                      sx: [
                          { '&.MuiChip-root.MuiAutocomplete-tag': { maxWidth: chipMaxWidth } },
                          ...castArray(chipSlotProps?.sx ?? []),
                      ],
                  }),
            label,
        } as ChipPropsWithTestId,
    };
}

const createRenderSelectedValue = <Value,>(
    customGetOptionLabel: (option: unknown) => string,
    chipSlotProps: Partial<React.ComponentProps<typeof Chip>> | undefined,
    dataTestId: string,
    renderChip?: (context: AutocompleteChipRenderContext<Value>) => React.ReactNode,
    chipRules?: ChipRules,
): NonNullable<AutocompleteMuiProps<Value>['renderValue']> => {
    return (value, getItemProps): React.ReactNode => {
        if (!Array.isArray(value)) {
            return null;
        }

        return value.map((option, index) => {
            const { key, label, chipProps, invalid } = buildChipProps({
                option,
                index,
                getItemProps,
                customGetOptionLabel,
                chipSlotProps,
                dataTestId,
                chipRules,
            });

            if (renderChip) {
                return (
                    <React.Fragment key={key}>
                        {renderChip({ option: option as Value, label, index, chipProps, invalid })}
                    </React.Fragment>
                );
            }

            // Destructured only here, AFTER the `renderChip` early return above, so the `chipProps`
            // object handed to a `renderChip` consumer keeps its documented shape.
            const { deleteIcon, ...chipPropsWithoutDeleteIcon } = chipProps;

            return (
                <Tooltip key={key} title={label}>
                    <Chip {...chipPropsWithoutDeleteIcon} deleteIcon={resolveChipDeleteIcon(deleteIcon)} />
                </Tooltip>
            );
        });
    };
};

interface AutocompleteInputProps extends WithOwnerDataTestId {
    actions?: Action[];
    /** Resolved duplicate message; when set it takes over `helperText` and forces the error state. */
    duplicateEntryMessage?: React.ReactNode;
    inputParams: AutocompleteRenderInputParams;
    labels: AutocompleteLabels;
    loading?: boolean;
    onKeyDown?: React.KeyboardEventHandler<HTMLDivElement>;
    onPaste?: React.ClipboardEventHandler<HTMLDivElement>;
    refAnchor: React.RefObject<HTMLButtonElement | null>;
    textFieldSlotProps?: TextFieldProps;
}

interface FilterAutocompletePaperContextValue {
    autocompleteInputRef: React.RefObject<HTMLInputElement | null>;
    dataTestId: string;
    paperRef: React.RefObject<HTMLDivElement | null>;
    searchInputRef: React.RefObject<HTMLInputElement | null>;
    searchPlaceholder: string;
    searchTextFieldProps?: TextFieldProps;
    searchValue: string;
    PaperComponent: React.ElementType<PaperProps>;
    onInputChange(event: React.ChangeEvent<HTMLInputElement>): void;
}

interface FilterAutocompleteInputProps extends Omit<
    AutocompleteInputProps,
    'actions' | 'labels' | 'refAnchor' | 'textFieldSlotProps'
> {
    autocompleteInputRef: React.RefObject<HTMLInputElement | null>;
    disabled: boolean;
    label: React.ReactNode;
    onTriggerClick(event: React.MouseEvent<HTMLElement>): void;
    selectedCount: number;
    triggerRef: React.RefObject<HTMLDivElement | null>;
}

type AutocompleteInternalProps<Value> = Omit<AutocompleteBaseProps<Value>, 'options'> & {
    options?: ReadonlyArray<Value>;
    variant?: 'default' | 'filter' | 'chipsInput';
    createChipsOnPaste?: boolean;
    pasteSeparators?: ReadonlyArray<string>;
    validateEntry?: (entry: unknown) => boolean;
    chipMaxWidth?: number | string;
    searchTextFieldProps?: TextFieldProps;
};

const FilterAutocompletePaperContext = createContext<FilterAutocompletePaperContextValue | null>(null);

const FilterAutocompletePaper = React.forwardRef<HTMLDivElement, PaperProps>(
    (props, forwardedRef): React.JSX.Element => {
        const context = useContext(FilterAutocompletePaperContext);
        const paperRef = useForkRef(context?.paperRef, forwardedRef);

        if (!context) {
            return <Paper {...props} ref={paperRef} />;
        }

        const { children, ...paperProps } = props;
        const { actions, dataTestIdSuffix, ...searchTextFieldProps } = context.searchTextFieldProps || {};
        void actions;
        void dataTestIdSuffix;
        const PaperComponent = context.PaperComponent;

        const handleSearchKeyDown = (event: React.KeyboardEvent<HTMLInputElement>): void => {
            if (!['ArrowDown', 'ArrowUp', 'Enter', 'Escape', 'PageDown', 'PageUp'].includes(event.key)) {
                return;
            }

            event.preventDefault();
            context.autocompleteInputRef.current?.dispatchEvent(
                new KeyboardEvent('keydown', { bubbles: true, cancelable: true, key: event.key }),
            );
        };

        return (
            <PaperComponent {...paperProps} ref={paperRef}>
                <Box sx={{ px: 1, pt: 1 }}>
                    <TextField
                        {...searchTextFieldProps}
                        autoFocus={true}
                        fullWidth={true}
                        variant="outlined"
                        size="small"
                        value={context.searchValue}
                        placeholder={context.searchPlaceholder}
                        onChange={context.onInputChange}
                        onKeyDown={handleSearchKeyDown}
                        inputRef={context.searchInputRef}
                        slotProps={{
                            ...searchTextFieldProps.slotProps,
                            htmlInput: {
                                ...searchTextFieldProps.slotProps?.htmlInput,
                                'data-testid': `${context.dataTestId}-search-input`,
                            },
                            input: {
                                ...searchTextFieldProps.slotProps?.input,
                                sx: { '& input': { paddingLeft: 0 } },
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <SearchIcon aria-hidden="true" size={DEFAULT_LUCIDE_ICON_SIZE} />
                                    </InputAdornment>
                                ),
                            },
                        }}
                    />
                </Box>
                {children}
            </PaperComponent>
        );
    },
);

FilterAutocompletePaper.displayName = 'FilterAutocompletePaper';

function AutocompleteInput({
    actions,
    dataTestId,
    duplicateEntryMessage,
    inputParams,
    labels,
    loading,
    onKeyDown,
    onPaste,
    refAnchor,
    textFieldSlotProps,
}: AutocompleteInputProps): React.JSX.Element {
    // Taken apart so the caller's slot props are merged below instead of being replaced by the ones this
    // component sets, and so MUI's own label wiring cannot be overwritten by the caller's `InputLabelProps`.
    const {
        slotProps: callerSlotProps,
        InputLabelProps: callerInputLabelProps,
        ...textFieldProps
    } = textFieldSlotProps ?? {};
    const objectSlot = (slot: unknown): object => (slot && typeof slot === 'object' ? slot : {});

    const actionButton =
        actions && actions.length === 1 ? (
            <Tooltip title={actions[0].disabledReason || actions[0].label}>
                <IconButton
                    aria-label={actions[0].label}
                    onClick={(event: React.MouseEvent<HTMLElement>): void => {
                        event.preventDefault();
                        event.stopPropagation();
                        actions[0].onClick?.(event);
                    }}
                    disabled={actions[0].disabled}
                    data-testid={`${dataTestId}-action`}
                >
                    {actions[0].icon}
                </IconButton>
            </Tooltip>
        ) : null;

    const moreVertButton =
        actions && actions.length > 1 ? (
            <IconButton
                ref={refAnchor}
                // A blank label would leave the button unnamed again, so it counts as "not provided".
                aria-label={resolveMoreActionsAriaLabel(labels.moreActions)}
                data-testid={`${dataTestId}-actions`}
                onClick={(event): void => event.stopPropagation()}
            >
                <EllipsisVertical size={DEFAULT_LUCIDE_ICON_SIZE} />
                {/* zIndex of Autocomplete Popper is 1300 */}
                <ActionBox actions={actions} anchorEl={refAnchor} zIndex={1400} dataTestId={`${dataTestId}-menu`} />
            </IconButton>
        ) : null;

    const circularProgress = loading ? (
        // Not a button: the spinner is a passive status indicator, so it must not be exposed as an
        // interactive (and unnamed) control. Laid out like the IconButtons beside it: the adornment
        // is not always a flex container, and there a block box takes a line of its own and a
        // baseline-aligned one pushes the buttons down.
        <Box sx={{ display: 'inline-flex', alignItems: 'center', verticalAlign: 'middle', p: '2px' }}>
            <CircularProgress size={'1.125rem'} data-testid={`${dataTestId}-circular-progress`} />
        </Box>
    ) : null;

    const endAdornment = inputParams.InputProps.endAdornment;
    let customEndAdornment = endAdornment;
    const hasCustomEndAdornment = Boolean(circularProgress || actionButton || moreVertButton);

    if (React.isValidElement(endAdornment)) {
        const typedEndAdornment = endAdornment as React.ReactElement<{
            children?: React.ReactNode;
            style?: React.CSSProperties;
        }>;
        const adornmentProps = typedEndAdornment.props;

        customEndAdornment = React.cloneElement(
            typedEndAdornment,
            {
                ...adornmentProps,
                style: {
                    alignItems: 'center',
                    ...adornmentProps.style,
                },
            },
            circularProgress,
            ...React.Children.toArray(adornmentProps.children),
            actionButton,
            moreVertButton,
        );
    } else if (hasCustomEndAdornment) {
        customEndAdornment = (
            <div className="MuiAutocomplete-endAdornment" style={{ alignItems: 'center' }}>
                {circularProgress}
                {actionButton}
                {moreVertButton}
            </div>
        );
    }

    return (
        <TextField
            {...textFieldProps}
            {...inputParams}
            /*
             * The plain `dataTestId` belongs to the Autocomplete root, which is this
             * TextField's ancestor — reusing it here would make `getByTestId` ambiguous.
             */
            data-testid={`${dataTestId}-textfield`}
            slotProps={{
                ...callerSlotProps,
                input: {
                    ...objectSlot(callerSlotProps?.input),
                    ...inputParams.InputProps,
                    endAdornment: customEndAdornment,
                },
                /*
                 * `inputParams.inputProps` carries MUI's input ref and a11y wiring, so it is merged
                 * into the `htmlInput` slot rather than replaced.
                 */
                htmlInput: {
                    ...objectSlot(callerSlotProps?.htmlInput),
                    ...inputParams.inputProps,
                    'data-testid': `${dataTestId}-input`,
                },
                // MUI's `slotProps.inputLabel` replaces `InputLabelProps` outright, so its `id`/`htmlFor`
                // are added last here — otherwise a caller's `shrink` would cut the label off its input.
                inputLabel: {
                    ...callerInputLabelProps,
                    ...objectSlot(callerSlotProps?.inputLabel),
                    ...inputParams.InputLabelProps,
                },
            }}
            label={labels.title}
            placeholder={isNil(inputParams.InputProps.startAdornment) ? labels.inputPlaceholder : undefined}
            /*
             * Both fall back to what `slotProps.textField` already spread in above; the duplicate
             * message only borrows the helper line for as long as it is showing.
             */
            error={isNil(duplicateEntryMessage) ? textFieldSlotProps?.error : true}
            helperText={isNil(duplicateEntryMessage) ? textFieldSlotProps?.helperText : duplicateEntryMessage}
            onKeyDown={onKeyDown}
            onPaste={onPaste}
        />
    );
}

function FilterAutocompleteInput(props: FilterAutocompleteInputProps): React.JSX.Element {
    const {
        autocompleteInputRef,
        dataTestId,
        disabled,
        inputParams,
        label,
        loading,
        onTriggerClick,
        selectedCount,
        triggerRef,
    } = props;
    const [isHovered, setIsHovered] = useState(false);
    const { ref: inputRootRef } = inputParams.InputProps;
    const { ref: muiAutocompleteInputRef, ...autocompleteInputProps } = inputParams.inputProps;

    const setAutocompleteInputRef = (element: HTMLInputElement | null): void => {
        autocompleteInputRef.current = element;

        if (typeof muiAutocompleteInputRef === 'function') {
            muiAutocompleteInputRef(element);
        } else if (muiAutocompleteInputRef) {
            muiAutocompleteInputRef.current = element;
        }
    };

    const handleTriggerClick = (event: React.MouseEvent<HTMLElement>): void => {
        if (
            disabled ||
            event.target === autocompleteInputRef.current ||
            (event.target as HTMLElement).closest('button')
        ) {
            return;
        }

        onTriggerClick(event);
    };

    const loadingIndicator = loading ? (
        <CircularProgress size="1.125rem" sx={{ cursor: 'default' }} data-testid={`${dataTestId}-circular-progress`} />
    ) : null;

    return (
        <InputBase
            className={classNames('ring-autocomplete-filter-trigger', {
                'ring-autocomplete-filter-trigger-hovered': isHovered,
            })}
            ref={(element): void => {
                triggerRef.current = element as HTMLDivElement | null;

                if (typeof inputRootRef === 'function') {
                    inputRootRef(element);
                } else if (inputRootRef) {
                    inputRootRef.current = element;
                }
            }}
            onClick={handleTriggerClick}
            onMouseEnter={(): void => setIsHovered(true)}
            onMouseLeave={(): void => setIsHovered(false)}
            inputProps={{
                ...autocompleteInputProps,
                // `labels.title` accepts a node; only a string can name the input.
                'aria-label': typeof label === 'string' ? label : undefined,
                className: 'ring-autocomplete-filter-input',
                'data-testid': `${dataTestId}-input`,
            }}
            inputRef={setAutocompleteInputRef}
            startAdornment={
                <>
                    <Typography variant="body2">{label}</Typography>
                    {selectedCount > 0 ? (
                        <Chip
                            color="primary"
                            label={selectedCount}
                            size="small"
                            sx={(theme): object => ({
                                flexShrink: 0,
                                marginLeft: 0,
                                visibility: isHovered ? 'hidden' : 'visible',
                                width: theme.getSpacing(3),
                            })}
                        />
                    ) : (
                        <Box
                            aria-hidden="true"
                            sx={(theme): object => ({ flexShrink: 0, marginLeft: 0, width: theme.getSpacing(3) })}
                        />
                    )}
                </>
            }
            endAdornment={
                <>
                    {loadingIndicator}
                    {inputParams.InputProps.endAdornment}
                </>
            }
            sx={(theme): object => ({
                alignItems: 'center',
                border: 1,
                borderColor: theme.palette.divider,
                borderRadius: 1,
                cursor: disabled ? 'default' : 'pointer',
                display: 'flex',
                minHeight: theme.getSpacing(5),
                padding: theme.getSpacing(0.5, 1),
                width: '100%',
                '&.ring-autocomplete-filter-trigger-hovered .MuiAutocomplete-clearIndicator': {
                    opacity: 1,
                    pointerEvents: 'auto',
                    visibility: 'visible',
                },
                '& .MuiAutocomplete-clearIndicator': {
                    marginRight: 0,
                    opacity: 0,
                    pointerEvents: 'none',
                    visibility: 'hidden',
                },
                '& .MuiAutocomplete-endAdornment': {
                    alignItems: 'center',
                    alignSelf: 'center',
                    display: 'flex',
                    flexGrow: 1,
                    marginLeft: `-${theme.getSpacing(3)}`,
                    position: 'static',
                    top: 'auto',
                    transform: 'none',
                },
                '& .MuiAutocomplete-clearIndicator, & .MuiAutocomplete-popupIndicator': { alignSelf: 'center' },
                '& .MuiAutocomplete-popupIndicator': { marginLeft: 'auto' },
                '& .MuiTypography-root': { marginRight: 1 },
                '& .ring-autocomplete-filter-input': {
                    border: 0,
                    height: theme.getSpacing(0.5),
                    margin: 0,
                    minWidth: 0,
                    opacity: 0,
                    overflow: 'hidden',
                    padding: 0,
                    position: 'absolute',
                    width: theme.getSpacing(0.5),
                },
            })}
        />
    );
}

function AutocompleteWithoutRef<Value>(
    props: AutocompleteProps<Value>,
    ref: React.ForwardedRef<unknown>,
): React.JSX.Element {
    const internalProps = props as AutocompleteInternalProps<Value>;
    const {
        actions,
        className,
        labels,
        menuListActions,
        options,
        recentlyLocalStorageKey,
        onChange,
        onOpen,
        onClose,
        slotProps,
        getOptionLabel,
        groupBy,
        renderGroup,
        loading,
        showRecentlyUsed = false,
        recentlyUsedLimit = 3,
        loadingText = '',
        forcePopupIcon,
        popupIcon,
        clearIcon,
        renderOption,
        renderValue,
        renderChip,
        duplicateEntryMessage,
        onDuplicateEntry,
        createChipsOnPaste = false,
        pasteSeparators = DEFAULT_PASTE_SEPARATORS,
        validateEntry,
        chipMaxWidth = 150,
        sortableChips = false,
        dataTestIdSuffix,
        defaultValue,
        variant = 'default',
        searchTextFieldProps,
        ...otherProps
    } = internalProps;

    const dataTestId = useRingDataTestId('Autocomplete', dataTestIdSuffix);

    const refAnchor = useRef<HTMLButtonElement>(null);
    const searchInputRef = useRef<HTMLInputElement>(null);
    const autocompleteInputRef = useRef<HTMLInputElement>(null);
    const triggerRef = useRef<HTMLDivElement>(null);
    const paperRef = useRef<HTMLDivElement>(null);
    const [uncontrolledSearchValue, setUncontrolledSearchValue] = useState('');
    const isFilterVariant = variant === 'filter';
    const isChipsInputVariant = variant === 'chipsInput';
    const isMultiple = isChipsInputVariant || Boolean(otherProps.multiple);
    const isFreeSolo = isChipsInputVariant || Boolean(otherProps.freeSolo);
    const ownsVariantValue = isFilterVariant || isChipsInputVariant;
    const [uncontrolledValue, setUncontrolledValue] = useState<unknown>(defaultValue ?? (isMultiple ? [] : null));
    const [chipsInputText, setChipsInputText] = useState('');
    const [uncontrolledFilterOpen, setUncontrolledFilterOpen] = useState(false);
    const filterLabels = labels as FilterAutocompleteLabels;
    const filterSearchTextFieldProps = isFilterVariant ? searchTextFieldProps : undefined;

    const {
        textField: textFieldSlotProps,
        avatar: avatarSlotProps,
        ...autocompleteSlotProps
    } = (slotProps || {}) as NonNullable<AutocompleteBaseProps<Value>['slotProps']>;
    const paperSlotProps = mergePaperSlotProps(otherProps.componentsProps?.paper, autocompleteSlotProps.paper);
    const listboxRef = React.useRef<HTMLElement | null>(null);

    const hasCustomRenderTags = Boolean((otherProps as AutocompleteMuiProps<Value>).renderTags);
    const isReadOnly = Boolean((otherProps as AutocompleteMuiProps<Value>).readOnly);
    const { limitTags } = otherProps as AutocompleteMuiProps<Value>;
    // Why `sortableChips` cannot apply, if it cannot: the single source of truth for both the render
    // decision below and the console warning further down, so the two cannot drift apart.
    const sortableIgnoredReason = !otherProps.multiple
        ? 'multiple is not enabled'
        : renderValue
          ? 'renderValue takes precedence'
          : hasCustomRenderTags
            ? 'renderTags takes precedence'
            : otherProps.disabled
              ? 'the component is disabled'
              : isReadOnly
                ? 'the component is read-only'
                : undefined;
    const isSortable = sortableChips && sortableIgnoredReason === undefined;
    const valueProp = otherProps.value;
    const isControlled = valueProp !== undefined;

    // Reordering needs write access to the value, so an uncontrolled `sortableChips` Autocomplete is
    // rendered controlled from this internal copy, seeded from `defaultValue`; a controlled `value`
    // is rendered as-is. Not gated on `isSortable`, which flips with `disabled` or `readOnly`, because MUI's
    // `useControlled` latches controlled-ness on the first render and a later switch would throw or stop dragging.
    const ownsValue = sortableChips && !isFilterVariant && !isControlled && Boolean(otherProps.multiple);
    const [sortableValue, setSortableValue] = useState<unknown[]>(() => (defaultValue ?? []) as unknown[]);

    const [recentlyUsedItems, setRecentlyUsedItems] = React.useState<AutocompleteOption[]>(() =>
        getStoredRecentlyUsedItems(showRecentlyUsed, recentlyLocalStorageKey).slice(0, recentlyUsedLimit),
    );
    const recentlyUsedItemsRef = React.useRef(recentlyUsedItems);
    const pendingRecentlyUsedItemsRef = React.useRef<AutocompleteOption[] | null>(null);

    // Off unless the consumer asked for the feedback, so nothing below runs for every other usage.
    const tracksDuplicateEntries =
        isMultiple && isFreeSolo && (!isNil(duplicateEntryMessage) || !isNil(onDuplicateEntry));
    const [rejectedEntry, setRejectedEntry] = useState<string | null>(null);
    const pendingEntryRef = React.useRef<string | null>(null);
    // An uncontrolled value that is not owned here lives in MUI's state, which only `onChange` reveals.
    const reportedValueRef = React.useRef<unknown>(defaultValue);

    const handleOnOpen = (event: React.SyntheticEvent): void => {
        if (isFilterVariant && otherProps.open === undefined) {
            setUncontrolledFilterOpen(true);
        }

        onOpen?.(event);

        if (showRecentlyUsed && recentlyUsedItems.length > 0) {
            requestAnimationFrame(() => listboxRef.current?.scrollTo({ top: 0 }));
        }
    };

    const handleOnClose = (
        event: React.SyntheticEvent,
        reason: Parameters<NonNullable<AutocompleteMuiProps<Value>['onClose']>>[1],
    ): void => {
        if (isFilterVariant && reason === 'blur') {
            return;
        }

        if (isFilterVariant && otherProps.open === undefined) {
            setUncontrolledFilterOpen(false);
        }

        if (pendingRecentlyUsedItemsRef.current) {
            setRecentlyUsedItems(pendingRecentlyUsedItemsRef.current);
            pendingRecentlyUsedItemsRef.current = null;
        }

        onClose?.(event, reason);
    };

    const controlledInputValue = otherProps.inputValue;
    const searchValue = controlledInputValue === undefined ? uncontrolledSearchValue : controlledInputValue;
    const filterOpen = otherProps.open === undefined ? uncontrolledFilterOpen : otherProps.open;
    const currentValue = otherProps.value === undefined ? uncontrolledValue : otherProps.value;
    // `undefined` leaves the value to MUI's own state.
    const muiValue = ownsValue ? sortableValue : ownsVariantValue ? currentValue : otherProps.value;

    useLayoutEffect(() => {
        if (isFilterVariant && filterOpen) {
            requestAnimationFrame(() => searchInputRef.current?.focus());
        }
    }, [filterOpen, isFilterVariant]);

    useEffect(() => {
        if (!isFilterVariant || !filterOpen) {
            return;
        }

        const handleClickAway = (event: MouseEvent): void => {
            const target = event.target as Node;

            if (triggerRef.current?.contains(target) || paperRef.current?.contains(target)) {
                return;
            }

            if (otherProps.open === undefined) {
                setUncontrolledFilterOpen(false);
            }

            onClose?.(event as unknown as React.SyntheticEvent, 'blur');
        };

        document.addEventListener('mousedown', handleClickAway);

        return (): void => document.removeEventListener('mousedown', handleClickAway);
    }, [filterOpen, isFilterVariant, onClose, otherProps.open]);

    const mergeListboxRef = (externalRef?: React.Ref<HTMLElement>): React.RefCallback<HTMLElement> => {
        return (node): void => {
            listboxRef.current = node;

            if (typeof externalRef === 'function') {
                externalRef(node);
            } else if (externalRef) {
                (externalRef as React.RefObject<HTMLElement | null>).current = node;
            }
        };
    };

    const listboxSlotProps = autocompleteSlotProps.listbox;
    const listboxProps =
        typeof listboxSlotProps === 'function'
            ? (ownerState: Parameters<typeof listboxSlotProps>[0]): ReturnType<typeof listboxSlotProps> => {
                  const props = listboxSlotProps(ownerState);

                  return { ...props, ref: mergeListboxRef(props.ref as React.Ref<HTMLElement>) };
              }
            : {
                  ...listboxSlotProps,
                  ref: mergeListboxRef(listboxSlotProps?.ref as React.Ref<HTMLElement>),
              };

    const resolvedOptions = options ?? [];
    let parsedOptions: AutocompleteMuiProps<Value>['options'] = resolvedOptions;
    let resolvedGroupBy = groupBy;
    const shouldRenderMenuListAction = Boolean(menuListActions && !renderGroup);

    if (showRecentlyUsed) {
        if (!recentlyLocalStorageKey) {
            throw new Error('recentlyLocalStorageKey is required when showRecentlyUsed is true');
        }

        resolvedGroupBy = (option: unknown): string => {
            return isAutocompleteOptionObject(option) ? option.groupBy || '' : '';
        };

        const originalIsOptionEqualToValue = otherProps.isOptionEqualToValue;

        otherProps.isOptionEqualToValue = (option: unknown, value: unknown): boolean => {
            const cleanOption = stripRecentlyUsedMeta(option as object);
            const cleanValue = stripRecentlyUsedMeta(value as object);

            if (originalIsOptionEqualToValue) {
                return originalIsOptionEqualToValue(cleanOption as Value, cleanValue as Value);
            }

            return isEqual(cleanOption, cleanValue);
        };

        parsedOptions = resolvedOptions
            .map((option) => {
                if (!isAutocompleteOptionObject(option)) {
                    return option;
                }

                const foundItemIndex = recentlyUsedItems.findIndex((r: AutocompleteOption) =>
                    isEqual(stripRecentlyUsedMeta(r), stripRecentlyUsedMeta(option)),
                );

                if (foundItemIndex >= 0) {
                    const sortBy = recentlyUsedItems.length - foundItemIndex;

                    return { ...option, groupBy: labels.recentlyUsed, sortBy };
                }

                return { ...option, groupBy: labels.recentlyUsedResults, sortBy: 0 };
            })
            .sort((a, b) => {
                const sortByA = isAutocompleteOptionObject(a) ? a.sortBy || 0 : 0;
                const sortByB = isAutocompleteOptionObject(b) ? b.sortBy || 0 : 0;

                return sortByB - sortByA;
            });
    } else if (menuListActions && shouldRenderMenuListAction && !groupBy) {
        // Create a technical group so the Listbox keeps MUI's native option state styles.
        resolvedGroupBy = (): string => menuListActions.label ?? '';
    }

    /**
     * Anything MUI does with an Enter shows up as a value or an input change. A rejected duplicate
     * does neither, so this is what tells the two apart — see `handleTextFieldKeyDown`.
     */
    const settleEntry = (): void => {
        // Nothing can be pending unless the feature is on, and every Autocomplete in the library
        // routes its input changes through here — so leave the other ones alone.
        if (!tracksDuplicateEntries) {
            return;
        }

        pendingEntryRef.current = null;
        setRejectedEntry(null);
    };

    /** The test MUI applies before adding a `freeSolo` entry: `isOptionEqualToValue`, `===` by default. */
    const isEntryTaken = (entry: string, selected: unknown[]): boolean => {
        const isSame =
            (otherProps as AutocompleteMuiProps<Value>).isOptionEqualToValue ??
            ((option: Value, value: Value): boolean => option === value);

        return selected.some((existing) => isSame(entry as Value, existing as Value));
    };

    /** One message per action: it quotes the first rejected entry; the callback hears about each. */
    const reportRejectedEntries = (
        event: React.KeyboardEvent<HTMLDivElement> | React.ClipboardEvent<HTMLDivElement>,
        entries: string[],
    ): void => {
        if (entries.length === 0) {
            return;
        }

        if (!isNil(duplicateEntryMessage)) {
            setRejectedEntry(entries[0]);
        }

        entries.forEach((entry) => onDuplicateEntry?.(event, entry));
    };

    /**
     * Detects the one rejection MUI keeps to itself: a `freeSolo` entry that is already selected is
     * dropped without `onChange` or `onInputChange`. Instead of re-deriving MUI's Enter branches, which would
     * drift with MUI, an already selected entry is noted here and settled in a microtask; still pending then
     * means nothing consumed it.
     */
    const handleTextFieldKeyDown = (
        event: React.KeyboardEvent<HTMLDivElement> & { defaultMuiPrevented?: boolean },
    ): void => {
        textFieldSlotProps?.onKeyDown?.(event);

        // MUI ignores an Enter that commits an IME composition, which it recognises by `which` 229.
        if (
            !tracksDuplicateEntries ||
            event.key !== 'Enter' ||
            event.defaultPrevented ||
            event.nativeEvent.isComposing ||
            event.which === 229
        ) {
            return;
        }

        const entry = (event.target as HTMLInputElement).value;
        const selected = muiValue === undefined ? reportedValueRef.current : muiValue;

        if (!entry || !isEntryTaken(entry, Array.isArray(selected) ? selected : [])) {
            return;
        }

        pendingEntryRef.current = entry;

        queueMicrotask(() => {
            if (pendingEntryRef.current !== entry) {
                return;
            }

            pendingEntryRef.current = null;

            // Read only now: the Autocomplete's own `onKeyDown` runs after this handler, and MUI then ignores the key.
            if (event.defaultMuiPrevented) {
                return;
            }

            reportRejectedEntries(event, [entry]);
        });
    };

    const handleOnInputChange = (
        event: React.SyntheticEvent,
        value: string,
        reason: AutocompleteInputChangeReason,
    ): void => {
        settleEntry();

        if (isChipsInputVariant) {
            setChipsInputText(value);
        }

        (otherProps as AutocompleteMuiProps<Value>).onInputChange?.(event, value, reason);
    };

    const handleOnChange = (
        event: React.SyntheticEvent,
        value: unknown,
        reason: AutocompleteChangeReason,
        details?: AutocompleteChangeDetails<unknown> | undefined,
    ): void => {
        settleEntry();
        reportedValueRef.current = value;

        if (ownsVariantValue && otherProps.value === undefined) {
            setUncontrolledValue(value);
        }

        if (ownsValue) {
            // Uncontrolled only: mirror MUI-originated changes (select/remove/clear) into the
            // internal copy that backs the value. When the consumer controls the value, its `value`
            // prop is the single source of truth — mirroring here would apply changes it rejects.
            setSortableValue((value as unknown[]) ?? []);
        }

        if (showRecentlyUsed && recentlyLocalStorageKey && reason === 'selectOption') {
            const rawOption = isMultiple ? details?.option : value;

            if (isAutocompleteOptionObject(rawOption)) {
                const selectedOption = stripRecentlyUsedMeta(rawOption);

                const newRecentlyUsedItems = recentlyUsedItemsRef.current
                    .filter((r: unknown) => {
                        return !isEqual(stripRecentlyUsedMeta(r as object), selectedOption);
                    })
                    .slice(0, recentlyUsedLimit - 1);

                const nextRecentlyUsedItems = [selectedOption, ...newRecentlyUsedItems];

                recentlyUsedItemsRef.current = nextRecentlyUsedItems;
                pendingRecentlyUsedItemsRef.current = nextRecentlyUsedItems;
                localStorage.setItem(recentlyLocalStorageKey, JSON.stringify(nextRecentlyUsedItems));
            }
        }

        onChange?.(
            event,
            value as AutocompleteValueFor<Value>,
            reason,
            details as AutocompleteChangeDetails<Value> | undefined,
        );
    };

    /**
     * Turns a paste into chips. The default is prevented only when there is something to add, so a
     * paste that holds nothing but separators still lands in the input as usual.
     */
    const handlePaste = (event: React.ClipboardEvent<HTMLDivElement>): void => {
        textFieldSlotProps?.onPaste?.(event);

        // A read-only input still fires `paste`, and this path bypasses MUI, which would otherwise block the edit.
        if (!isChipsInputVariant || !createChipsOnPaste || otherProps.readOnly || otherProps.disabled) {
            return;
        }

        const entries = splitPastedText(event.clipboardData.getData('text'), pasteSeparators);

        if (entries.length === 0) {
            return;
        }

        event.preventDefault();

        const current = Array.isArray(currentValue) ? (currentValue as unknown[]) : [];
        const accepted: string[] = [];
        const rejected: string[] = [];

        entries.forEach((entry) => {
            if (isEntryTaken(entry, [...current, ...accepted])) {
                rejected.push(entry);
            } else {
                accepted.push(entry);
            }
        });

        handleOnInputChange(event, '', 'clear');

        if (accepted.length > 0) {
            handleOnChange(event, [...current, ...accepted], 'createOption', {
                option: accepted[accepted.length - 1],
            });
        }

        reportRejectedEntries(event, rejected);
    };

    const customGetOptionLabel = (option: unknown): string => {
        if (getOptionLabel) {
            return getOptionLabel(option as Value | string);
        }

        return getOptionLabelFallback(option);
    };

    const defaultRenderOption: NonNullable<AutocompleteMuiProps<Value>['renderOption']> = (
        optionProps,
        option,
    ): React.ReactNode => {
        return renderOptionWithCustomLabelAndCaption(optionProps, option, customGetOptionLabel, avatarSlotProps);
    };

    const chipSlotProps =
        typeof autocompleteSlotProps.chip === 'function'
            ? undefined
            : (autocompleteSlotProps.chip as Partial<React.ComponentProps<typeof Chip>> | undefined);
    const chipRules: ChipRules | undefined = isChipsInputVariant ? { validateEntry, chipMaxWidth } : undefined;
    const renderSelectedValue = createRenderSelectedValue<Value>(
        customGetOptionLabel,
        chipSlotProps,
        dataTestId,
        renderChip,
        chipRules,
    );

    React.useEffect(() => {
        if (!renderChip) {
            return;
        }

        if (!isMultiple) {
            console.warn('Autocomplete: renderChip is ignored because multiple is not enabled.');
        } else if (renderValue) {
            console.warn('Autocomplete: renderChip is ignored because renderValue takes precedence.');
        } else if (hasCustomRenderTags) {
            console.warn('Autocomplete: renderChip is ignored because renderTags takes precedence.');
        }
    }, [hasCustomRenderTags, isMultiple, renderChip, renderValue]);

    const resolvedDuplicateEntryMessage =
        rejectedEntry === null
            ? undefined
            : typeof duplicateEntryMessage === 'function'
              ? duplicateEntryMessage(rejectedEntry)
              : duplicateEntryMessage;

    React.useEffect(() => {
        if (!sortableChips) {
            return;
        }

        if (sortableIgnoredReason !== undefined) {
            console.warn(`Autocomplete: sortableChips is ignored because ${sortableIgnoredReason}.`);
        } else if (limitTags !== undefined && limitTags > -1) {
            // `limitTags` is the one case that does NOT disable sorting: sortable chips render as
            // one element so they can share a drag context, and MUI only truncates when renderValue
            // returns an array — so limitTags cannot apply, but the reorder still works.
            console.warn('Autocomplete: limitTags is ignored because sortableChips renders all chips.');
        }
    }, [limitTags, sortableChips, sortableIgnoredReason]);

    /**
     * Stable drag identity of an option: `getOptionKey` if provided, then an `id` field, then the
     * label. Must be unique within the selected values for drag&drop to behave.
     */
    const getChipId = (option: unknown): UniqueIdentifier => {
        const key = (otherProps as AutocompleteMuiProps<Value>).getOptionKey?.(option as Value);

        if (key !== undefined) {
            return key;
        }

        const { id } = (option ?? {}) as { id?: string | number };

        return id ?? customGetOptionLabel(option);
    };

    const reorderChips = (reordered: SortableChipItem<Value>[], activatorEvent?: Event): void => {
        const newValue = reordered.map(({ option }) => option);

        if (!isControlled) {
            setSortableValue(newValue);
        }

        onChange?.(createReorderEvent(activatorEvent), newValue as AutocompleteValueFor<Value>, 'reorder');
    };

    const duplicateChipIdWarned = useRef(false);

    const renderSortableValue: NonNullable<AutocompleteMuiProps<Value>['renderValue']> = (
        value,
        getItemProps,
        ownerState,
    ) => {
        if (!Array.isArray(value)) {
            return null;
        }

        // Chip props are resolved from the committed value order up front, so they stay attached
        // to the right option (delete handler included) while `SortableChips` live-reorders its
        // working copy during a drag.
        const chips = value.map((option, index): SortableChipItem<Value> => {
            const { key, label, chipProps, invalid } = buildChipProps({
                option,
                index,
                getItemProps,
                customGetOptionLabel,
                chipSlotProps,
                dataTestId,
                chipRules,
            });

            return { id: getChipId(option), key, option: option as Value, label, index, chipProps, invalid };
        });

        // dnd-kit requires unique ids; duplicates (e.g. two equal freeSolo strings without
        // `getOptionKey`) would break the drag, so fall back to the static chip row.
        if (new Set(chips.map(({ id }) => id)).size !== chips.length) {
            if (!duplicateChipIdWarned.current) {
                duplicateChipIdWarned.current = true;
                console.warn(
                    'Autocomplete: sortableChips requires unique option identities ' +
                        '(getOptionKey, an id field, or unique labels); rendering non-sortable chips.',
                );
            }

            return renderSelectedValue(value, getItemProps, ownerState);
        }

        return (
            <SortableChips
                items={chips}
                onChange={reorderChips}
                getItemLabel={(item): string => item.label}
                renderChip={(item, position, isDragActive): React.ReactNode =>
                    renderChip ? (
                        renderChip({
                            option: item.option,
                            label: item.label,
                            index: item.index,
                            chipProps: item.chipProps,
                            invalid: item.invalid,
                            isDragActive,
                        })
                    ) : (
                        <SortableChipTag item={item} isDragActive={isDragActive} />
                    )
                }
            />
        );
    };

    const renderAutocompleteInput = (inputParams: AutocompleteRenderInputParams): React.ReactNode => {
        if (isFilterVariant) {
            const selectedCount = Array.isArray(currentValue) ? currentValue.length : currentValue === null ? 0 : 1;

            return (
                <FilterAutocompleteInput
                    autocompleteInputRef={autocompleteInputRef}
                    dataTestId={dataTestId}
                    disabled={otherProps.disabled ?? false}
                    inputParams={inputParams}
                    label={filterLabels.title}
                    loading={loading}
                    onTriggerClick={(event): void => {
                        if (filterOpen) {
                            handleOnClose(event, 'toggleInput');
                        } else {
                            handleOnOpen(event);
                        }
                    }}
                    selectedCount={selectedCount}
                    triggerRef={triggerRef}
                />
            );
        }

        return (
            <AutocompleteInput
                actions={actions}
                dataTestId={dataTestId}
                duplicateEntryMessage={resolvedDuplicateEntryMessage}
                inputParams={inputParams}
                labels={labels}
                loading={loading}
                onKeyDown={handleTextFieldKeyDown}
                onPaste={handlePaste}
                refAnchor={refAnchor}
                textFieldSlotProps={textFieldSlotProps}
            />
        );
    };

    const hasActions = Boolean(actions?.length);
    const filterPaperContext: FilterAutocompletePaperContextValue | null = isFilterVariant
        ? {
              autocompleteInputRef,
              dataTestId,
              paperRef,
              searchInputRef,
              searchPlaceholder: filterLabels.searchPlaceholder || '',
              searchTextFieldProps: filterSearchTextFieldProps,
              searchValue,
              PaperComponent: otherProps.slots?.paper || Paper,
              onInputChange: (event): void => {
                  setUncontrolledSearchValue(event.target.value);
                  otherProps.onInputChange?.(event, event.target.value, 'input');
              },
          }
        : null;

    const renderAutocompleteGroup: NonNullable<AutocompleteMuiProps<Value>['renderGroup']> = ({
        key,
        group,
        children,
    }): React.ReactNode => {
        const isFirstGroup = key === 0;

        return (
            <li key={key}>
                {/* The same sticky `ListSubheader` MUI's default `renderGroup` draws, `top` included: it offsets
                    the listbox's 8px top padding. The tighter right gutter lines the icon buttons up with the edge. */}
                <ListSubheader
                    className="MuiAutocomplete-groupLabel"
                    component="div"
                    sx={(theme): Record<string, unknown> => ({
                        alignItems: 'center',
                        display: 'flex',
                        pr: 1,
                        top: theme.spacing(-1),
                    })}
                >
                    {group}
                    {isFirstGroup && (
                        <Box sx={{ display: 'flex', gap: 0.5, ml: 'auto' }}>
                            {menuListActions?.actions.map((action, index) => (
                                <AutocompleteMenuListActionButton
                                    action={action}
                                    dataTestId={`${dataTestId}-menu-list-action-${index}`}
                                    key={`${action.label}-${index}`}
                                />
                            ))}
                        </Box>
                    )}
                </ListSubheader>
                {/* MUI's `groupUl` indent: options sit 24px in, under the heading, with or without `groupBy`. */}
                <Box
                    component="ul"
                    sx={{
                        padding: 0,
                        '& .MuiAutocomplete-option': { paddingLeft: 3 },
                    }}
                >
                    {children}
                </Box>
            </li>
        );
    };

    return (
        <FilterAutocompletePaperContext.Provider value={filterPaperContext}>
            <TypedMuiAutocomplete<Value>
                className={classNames('ring-autocomplete', className)}
                data-testid={dataTestId}
                {...otherProps}
                multiple={isChipsInputVariant ? true : otherProps.multiple}
                freeSolo={isChipsInputVariant ? true : otherProps.freeSolo}
                options={parsedOptions}
                defaultValue={
                    // Withheld exactly when `value` is supplied below: MUI warns when it gets both, and the
                    // owned copies were seeded from `defaultValue` anyway.
                    (ownsValue || ownsVariantValue
                        ? undefined
                        : defaultValue) as AutocompleteMuiProps<Value>['defaultValue']
                }
                open={isFilterVariant ? filterOpen : otherProps.open}
                value={muiValue as AutocompleteMuiProps<Value>['value']}
                inputValue={
                    isChipsInputVariant && controlledInputValue === undefined ? chipsInputText : otherProps.inputValue
                }
                disableCloseOnSelect={
                    isFilterVariant && isMultiple
                        ? (otherProps.disableCloseOnSelect ?? true)
                        : otherProps.disableCloseOnSelect
                }
                onChange={handleOnChange}
                onOpen={handleOnOpen}
                onClose={handleOnClose}
                onInputChange={
                    isFilterVariant
                        ? (event, nextInputValue, reason): void => {
                              if (reason !== 'reset' && otherProps.inputValue === undefined) {
                                  setUncontrolledSearchValue(nextInputValue);
                              }

                              if (reason !== 'reset') {
                                  otherProps.onInputChange?.(event, nextInputValue, reason);
                              }
                          }
                        : handleOnInputChange
                }
                loading={loading}
                groupBy={resolvedGroupBy}
                forcePopupIcon={hasActions && !isFilterVariant ? false : forcePopupIcon}
                // Undefined falls back to the theme's MuiAutocomplete defaults: lucide's chevron and X.
                popupIcon={popupIcon}
                clearIcon={clearIcon}
                getOptionLabel={customGetOptionLabel}
                ref={ref}
                loadingText={loadingText}
                renderGroup={
                    renderGroup ||
                    (menuListActions && shouldRenderMenuListAction
                        ? renderAutocompleteGroup
                        : (renderGroup as AutocompleteMuiProps<Value>['renderGroup']))
                }
                renderOption={renderOption || (defaultRenderOption as AutocompleteMuiProps<Value>['renderOption'])}
                renderValue={
                    isFilterVariant
                        ? (): null => null
                        : renderValue ||
                          (isMultiple && !hasCustomRenderTags
                              ? ((isSortable
                                    ? renderSortableValue
                                    : renderSelectedValue) as AutocompleteMuiProps<Value>['renderValue'])
                              : undefined)
                }
                sx={{
                    '& .MuiAutocomplete-clearIndicator': { padding: '2px' },
                    '& .MuiAutocomplete-inputRoot :has(.MuiAutocomplete-tag)': { maxWidth: '100%', minWidth: 0 },
                    ...otherProps.sx,
                }}
                slotProps={
                    {
                        ...autocompleteSlotProps,
                        // A theme default for `slotProps.paper` gives MUI a paper slot on every Autocomplete, and
                        // that slot replaces `componentsProps.paper` whole, so the deprecated prop is folded in here.
                        ...(paperSlotProps && { paper: paperSlotProps }),
                        listbox: listboxProps,
                        clearIndicator: isFilterVariant
                            ? { ...autocompleteSlotProps.clearIndicator, 'data-testid': `${dataTestId}-clear` }
                            : autocompleteSlotProps.clearIndicator,
                        popupIndicator: isFilterVariant
                            ? { ...autocompleteSlotProps.popupIndicator, 'data-testid': `${dataTestId}-popup` }
                            : autocompleteSlotProps.popupIndicator,
                    } as AutocompleteMuiProps<Value>['slotProps']
                }
                renderInput={renderAutocompleteInput}
                filterOptions={
                    isFilterVariant
                        ? (optionsToFilter, state): Value[] => {
                              const filterState = { ...state, inputValue: searchValue };
                              const customFilterOptions = otherProps.filterOptions;

                              if (customFilterOptions) {
                                  return customFilterOptions(optionsToFilter, filterState);
                              }

                              return optionsToFilter.filter((option) =>
                                  customGetOptionLabel(option)
                                      .toLocaleLowerCase()
                                      .includes(searchValue.toLocaleLowerCase()),
                              );
                          }
                        : otherProps.filterOptions
                }
                slots={isFilterVariant ? { ...otherProps.slots, paper: FilterAutocompletePaper } : otherProps.slots}
            />
        </FilterAutocompletePaperContext.Provider>
    );
}

type AutocompleteComponent = <Value = unknown>(
    props: AutocompleteProps<Value> & { ref?: React.ForwardedRef<unknown> },
) => React.JSX.Element;

export const Autocomplete = React.forwardRef(AutocompleteWithoutRef) as AutocompleteComponent;
