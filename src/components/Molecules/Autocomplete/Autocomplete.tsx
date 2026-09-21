import { KeyboardArrowDown as KeyboardArrowDownIcon, MoreVert, Search as SearchIcon } from '@mui/icons-material';
import {
    Autocomplete as MuiAutocomplete,
    AutocompleteChangeDetails,
    AutocompleteChangeReason,
    AutocompleteProps as MuiAutocompleteProps,
    AutocompleteRenderInputParams,
    AutocompleteValue,
    Avatar,
    AvatarProps,
    Box,
    Chip,
    CircularProgress,
    IconButton,
    InputBase,
    InputAdornment,
    ListItemAvatar,
    Paper,
    PaperProps,
    Theme,
    Tooltip,
} from '@mui/material';
import useForkRef from '@mui/utils/useForkRef';
import classNames from 'classnames';
import { isEqual, isNil, omit } from 'lodash';
import React, { createContext, useContext, useEffect, useLayoutEffect, useRef, useState } from 'react';

import { CommonComponentProps } from '../../../helpers/commonTypes.js';
import { useRingDataTestId } from '../../../helpers/hooks/useRingDataTestId.js';
import { Action } from '../../../types.js';

import { TextField, TextFieldProps } from '../../Atoms/TextField/TextField.js';
import { Typography } from '../../Atoms/Typography/Typography.js';
import { ActionBox } from '../ActionBox/ActionBox.js';

export type { AutocompleteChangeDetails, AutocompleteChangeReason } from '@mui/material';

export interface AutocompleteLabels {
    /**
     * The title of the autocomplete
     */
    title: string;
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
}

export interface FilterAutocompleteLabels extends AutocompleteLabels {
    /** Placeholder displayed in the search field within the options panel. */
    searchPlaceholder?: string;
}

type AutocompleteOptionWithMeta = Record<string, unknown> & {
    /**
     * Leading avatar shown before the option label in the default renderer.
     * A string is treated as an image URL and rendered inside a circular `Avatar`;
     * a `ReactNode` (e.g. a custom `Avatar`, icon or `img`) is rendered as-is.
     *
     * Note: with `showRecentlyUsed`, only string (URL) avatars are persisted to
     * local storage. A `ReactNode` avatar is dropped from the stored entry (it is
     * re-applied from the live option on render), so use a URL if the avatar must
     * survive a reload as part of the recently-used identity.
     */
    avatar?: string | React.ReactNode;
    caption?: string;
    groupBy?: string;
    id?: React.Key;
    label?: string;
    sortBy?: number;
};

type AutocompleteMuiProps<Value> = MuiAutocompleteProps<Value, boolean, boolean, boolean>;

type AutocompleteValueFor<Value> = AutocompleteValue<Value, boolean, boolean, boolean>;

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

interface AutocompleteBaseProps<Value = unknown>
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
     * Icon actions displayed in the autocomplete menu list. When `groupBy` is
     * not provided, `label` is used as the heading. When options are grouped,
     * the actions are displayed next to the first group heading. Ignored when
     * `renderGroup` is provided. Pass an action's `anchorRef` to use its button
     * as an anchor for a separately rendered menu or popper.
     */
    menuListActions?: AutocompleteMenuListActions;

    /**
     * Renders each selected value in multiple mode. The callback receives the
     * original option, the label resolved by `getOptionLabel`, its index, and
     * the merged MUI chip props, including the default delete handler.
     *
     * `renderValue` takes precedence over `renderTags`, which takes precedence
     * over `renderChip`; therefore this callback is used only when `multiple`
     * is true and neither of the other render callbacks is provided. Custom
     * rendering also takes responsibility for adding a tooltip and preserving
     * chip actions. `chipProps` is merged as `{ ...muiChipProps,
     * ...slotProps.chip, label }`. The computed `label` is applied last so it
     * stays consistent with `context.label`; other props such as `onDelete`
     * and `disabled` can still be overridden by `slotProps.chip`.
     */
    renderChip?: (context: AutocompleteChipRenderContext<Value>) => React.ReactNode;

    /**
     * The labels of the autocomplete
     @example
     * `{ title: string, inputPlaceholder?: string }`
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
         * Props applied to the option's `Avatar` when the option `avatar` is a string (URL).
         * Use this for a custom border, size, variant, etc. `sx` is merged on top of the
         * default sizing. Ignored when `avatar` is a `ReactNode` (style that node directly).
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

export type AutocompleteProps<Value = unknown> = DefaultAutocompleteProps<Value> | FilterAutocompleteProps<Value>;

export type MuiOption = AutocompleteOptionWithMeta;

interface AutocompleteMenuListActionButtonProps {
    action: AutocompleteMenuListAction;
    dataTestId: string;
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

const isAutocompleteOptionObject = (option: unknown): option is AutocompleteOptionWithMeta => {
    return option !== null && typeof option === 'object' && !Array.isArray(option);
};

const stripRecentlyUsedMeta = (option: object): MuiOption => {
    // A non-string `avatar` (React node) does not survive JSON serialization for
    // recently-used persistence and would break equality matching on reload, so it
    // is excluded from the persisted/compared shape. String (URL) avatars are kept.
    const { avatar } = option as AutocompleteOptionWithMeta;
    const keysToOmit = typeof avatar === 'string' ? ['groupBy', 'sortBy'] : ['groupBy', 'sortBy', 'avatar'];

    return omit(option, keysToOmit) as MuiOption;
};

const getStoredRecentlyUsedItems = (showRecentlyUsed: boolean, recentlyLocalStorageKey?: string): MuiOption[] => {
    if (!showRecentlyUsed || !recentlyLocalStorageKey) {
        return [];
    }

    try {
        const parsed: unknown = JSON.parse(localStorage.getItem(recentlyLocalStorageKey) || '[]');
        const stored: unknown[] = Array.isArray(parsed) ? parsed : [];
        const recentlyUsedItems: MuiOption[] = [];

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

const createRenderSelectedValue = <Value,>(
    customGetOptionLabel: (option: unknown) => string,
    chipSlotProps: Partial<React.ComponentProps<typeof Chip>> | undefined,
    renderChip?: (context: AutocompleteChipRenderContext<Value>) => React.ReactNode,
): NonNullable<AutocompleteMuiProps<Value>['renderValue']> => {
    return (value, getItemProps): React.ReactNode => {
        if (!Array.isArray(value)) {
            return null;
        }

        return value.map((option, index) => {
            const { key, ...chipPropsFromItem } = getItemProps({ index }) as ReturnType<typeof getItemProps> & {
                key?: React.Key;
            };
            const label = customGetOptionLabel(option);
            const chipProps = {
                ...chipPropsFromItem,
                ...chipSlotProps,
                label,
            } as React.ComponentProps<typeof Chip>;

            if (renderChip) {
                return (
                    <React.Fragment key={key ?? index}>
                        {renderChip({ option: option as Value, label, index, chipProps })}
                    </React.Fragment>
                );
            }

            return (
                <Tooltip key={key ?? index} title={label}>
                    <Chip {...chipProps} />
                </Tooltip>
            );
        });
    };
};

interface AutocompleteInputProps {
    actions?: Action[];
    dataTestId: string;
    dataTestIdSuffix?: string;
    inputParams: AutocompleteRenderInputParams;
    labels: AutocompleteLabels;
    loading?: boolean;
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
    label: string;
    onTriggerClick(event: React.MouseEvent<HTMLElement>): void;
    selectedCount: number;
    triggerRef: React.RefObject<HTMLDivElement | null>;
}

type AutocompleteInternalProps<Value> = AutocompleteBaseProps<Value> & {
    variant?: 'default' | 'filter';
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
            <PaperComponent elevation={1} {...paperProps} ref={paperRef}>
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
                                        <SearchIcon aria-hidden="true" fontSize="small" />
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
    dataTestIdSuffix,
    inputParams,
    labels,
    loading,
    refAnchor,
    textFieldSlotProps,
}: AutocompleteInputProps): React.JSX.Element {
    const actionButton =
        actions && actions.length === 1 ? (
            <Tooltip title={actions[0].disabledReason || actions[0].label}>
                <IconButton
                    sx={{ p: '2px' }}
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
                sx={{ p: '2px' }}
                data-testid={`${dataTestId}-actions`}
                onClick={(event): void => event.stopPropagation()}
            >
                <MoreVert />
                {/* zIndex of Autocomplete Popper is 1300 */}
                <ActionBox actions={actions} anchorEl={refAnchor} zIndex={1400} dataTestIdSuffix={dataTestIdSuffix} />
            </IconButton>
        ) : null;

    const circularProgress = loading ? (
        <IconButton disableFocusRipple={true} disableRipple={true}>
            <CircularProgress
                size={'1.125rem'}
                sx={{ cursor: 'default' }}
                data-testid={`${dataTestId}-circular-progress`}
            />
        </IconButton>
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
            {...textFieldSlotProps}
            {...inputParams}
            data-testid={dataTestId}
            slotProps={{
                input: {
                    ...inputParams.InputProps,
                    endAdornment: customEndAdornment,
                },
                /*
                 * DESCOMP253-9 FIXME:
                 *    There is a problem with adding data-testids to the TextField component directly, so we add it to the inputProps instead
                 */
                // htmlInput: { 'data-testid': `${dataTestId}-input` }
            }}
            label={labels.title}
            placeholder={isNil(inputParams.InputProps.startAdornment) ? labels.inputPlaceholder : undefined}
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
                'aria-label': label,
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
        renderOption,
        renderValue,
        renderChip,
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
    const [uncontrolledFilterValue, setUncontrolledFilterValue] = useState<unknown>(
        defaultValue ?? (otherProps.multiple ? [] : null),
    );
    const [uncontrolledFilterOpen, setUncontrolledFilterOpen] = useState(false);
    const isFilterVariant = variant === 'filter';
    const filterLabels = labels as FilterAutocompleteLabels;
    const filterSearchTextFieldProps = isFilterVariant ? searchTextFieldProps : undefined;

    const {
        textField: textFieldSlotProps,
        avatar: avatarSlotProps,
        ...autocompleteSlotProps
    } = (slotProps || {}) as NonNullable<AutocompleteBaseProps<Value>['slotProps']>;
    const listboxRef = React.useRef<HTMLElement | null>(null);

    const [recentlyUsedItems, setRecentlyUsedItems] = React.useState<MuiOption[]>(() =>
        getStoredRecentlyUsedItems(showRecentlyUsed, recentlyLocalStorageKey).slice(0, recentlyUsedLimit),
    );
    const recentlyUsedItemsRef = React.useRef(recentlyUsedItems);
    const pendingRecentlyUsedItemsRef = React.useRef<MuiOption[] | null>(null);

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
    const filterValue = otherProps.value === undefined ? uncontrolledFilterValue : otherProps.value;

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

    let parsedOptions: AutocompleteMuiProps<Value>['options'] = options;
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

        parsedOptions = options
            .map((option) => {
                if (!isAutocompleteOptionObject(option)) {
                    return option;
                }

                const foundItemIndex = recentlyUsedItems.findIndex((r: MuiOption) =>
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

    const isImplicitResultsGroup = Boolean(shouldRenderMenuListAction && !groupBy && !showRecentlyUsed);

    const handleOnChange = (
        event: React.SyntheticEvent,
        value: unknown,
        reason: AutocompleteChangeReason,
        details?: AutocompleteChangeDetails<unknown> | undefined,
    ): void => {
        if (isFilterVariant && otherProps.value === undefined) {
            setUncontrolledFilterValue(value);
        }

        if (showRecentlyUsed && recentlyLocalStorageKey && reason === 'selectOption') {
            const rawOption = otherProps.multiple ? details?.option : value;

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
    const renderSelectedValue = createRenderSelectedValue<Value>(customGetOptionLabel, chipSlotProps, renderChip);
    const hasCustomRenderTags = Boolean((otherProps as AutocompleteMuiProps<Value>).renderTags);

    React.useEffect(() => {
        if (!renderChip) {
            return;
        }

        if (!otherProps.multiple) {
            console.warn('Autocomplete: renderChip is ignored because multiple is not enabled.');
        } else if (renderValue) {
            console.warn('Autocomplete: renderChip is ignored because renderValue takes precedence.');
        } else if (hasCustomRenderTags) {
            console.warn('Autocomplete: renderChip is ignored because renderTags takes precedence.');
        }
    }, [hasCustomRenderTags, otherProps.multiple, renderChip, renderValue]);

    const renderAutocompleteInput = (inputParams: AutocompleteRenderInputParams): React.ReactNode => {
        if (isFilterVariant) {
            const selectedCount = Array.isArray(filterValue) ? filterValue.length : filterValue === null ? 0 : 1;

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
                dataTestIdSuffix={dataTestIdSuffix}
                inputParams={inputParams}
                labels={labels}
                loading={loading}
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
                <Box
                    sx={{
                        alignItems: 'center',
                        display: 'flex',
                        justifyContent: 'space-between',
                        pl: 1.5,
                        pr: 1,
                    }}
                >
                    <Typography className="MuiAutocomplete-groupLabel" color="text.secondary" component="div">
                        {group}
                    </Typography>
                    {isFirstGroup && (
                        <Box sx={{ display: 'flex', gap: 0.5 }}>
                            {menuListActions?.actions.map((action, index) => (
                                <AutocompleteMenuListActionButton
                                    action={action}
                                    dataTestId={`${dataTestId}-menu-list-action-${index}`}
                                    key={`${action.label}-${index}`}
                                />
                            ))}
                        </Box>
                    )}
                </Box>
                <Box
                    component="ul"
                    sx={{
                        padding: 0,
                        '& .MuiAutocomplete-option': { paddingLeft: isImplicitResultsGroup ? 2 : 3 },
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
                options={parsedOptions}
                defaultValue={isFilterVariant ? undefined : defaultValue}
                open={isFilterVariant ? filterOpen : otherProps.open}
                value={isFilterVariant ? (filterValue as AutocompleteValueFor<Value>) : otherProps.value}
                disableCloseOnSelect={
                    isFilterVariant && otherProps.multiple
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
                        : otherProps.onInputChange
                }
                loading={loading}
                groupBy={resolvedGroupBy}
                forcePopupIcon={hasActions && !isFilterVariant ? false : forcePopupIcon}
                popupIcon={popupIcon ?? <KeyboardArrowDownIcon />}
                getOptionLabel={customGetOptionLabel}
                ref={ref}
                loadingText={loadingText}
                renderGroup={
                    renderGroup ||
                    (menuListActions && shouldRenderMenuListAction
                        ? renderAutocompleteGroup
                        : (renderGroup as AutocompleteMuiProps<Value>['renderGroup']))
                }
                renderOption={renderOption || defaultRenderOption}
                renderValue={
                    isFilterVariant
                        ? (): null => null
                        : renderValue || (otherProps.multiple && !hasCustomRenderTags ? renderSelectedValue : undefined)
                }
                sx={{
                    ...otherProps.sx,
                }}
                slotProps={
                    {
                        ...autocompleteSlotProps,
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
