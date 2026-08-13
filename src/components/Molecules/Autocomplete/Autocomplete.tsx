import { KeyboardArrowDown as KeyboardArrowDownIcon, MoreVert } from '@mui/icons-material';
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
    ListItemAvatar,
    Theme,
    Tooltip,
} from '@mui/material';
import classNames from 'classnames';
import { isEqual, isNil, omit } from 'lodash';
import React, { useRef } from 'react';

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

export interface AutocompleteProps<Value = unknown>
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

export type MuiOption = AutocompleteOptionWithMeta;

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

    const { label } = option as { label: string };

    return label;
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

function AutocompleteWithoutRef<Value>(
    props: AutocompleteProps<Value>,
    ref: React.ForwardedRef<unknown>,
): React.JSX.Element {
    const {
        actions,
        className,
        labels,
        options,
        recentlyLocalStorageKey,
        onChange,
        slotProps,
        getOptionLabel,
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
        ...otherProps
    } = props as AutocompleteProps<Value>;

    const dataTestId = useRingDataTestId('Autocomplete', dataTestIdSuffix);

    const refAnchor = useRef<HTMLButtonElement>(null);

    const { textField: textFieldSlotProps, avatar: avatarSlotProps, ...autocompleteSlotProps } = slotProps || {};

    const [recentlyUsedItems, setRecentlyUsedItems] = React.useState<MuiOption[]>(() =>
        getStoredRecentlyUsedItems(showRecentlyUsed, recentlyLocalStorageKey),
    );

    let parsedOptions: AutocompleteMuiProps<Value>['options'] = options;

    if (showRecentlyUsed) {
        if (!recentlyLocalStorageKey) {
            throw new Error('recentlyLocalStorageKey is required when showRecentlyUsed is true');
        }

        otherProps.groupBy = (option: unknown): string => {
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
    }

    const handleOnChange = (
        event: React.SyntheticEvent,
        value: unknown,
        reason: AutocompleteChangeReason,
        details?: AutocompleteChangeDetails<unknown> | undefined,
    ): void => {
        if (showRecentlyUsed && recentlyLocalStorageKey && reason === 'selectOption') {
            const rawOption = otherProps.multiple ? details?.option : value;

            if (isAutocompleteOptionObject(rawOption)) {
                const selectedOption = stripRecentlyUsedMeta(rawOption);

                const newRecentlyUsedItems = [...recentlyUsedItems]
                    .filter((r: unknown) => {
                        return !isEqual(stripRecentlyUsedMeta(r as object), selectedOption);
                    })
                    .slice(0, recentlyUsedLimit - 1);

                const nextRecentlyUsedItems = [selectedOption, ...newRecentlyUsedItems];

                setRecentlyUsedItems(nextRecentlyUsedItems);
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

    return (
        <TypedMuiAutocomplete
            className={classNames('ring-autocomplete', className)}
            data-testid={dataTestId}
            {...otherProps}
            options={parsedOptions}
            onChange={handleOnChange}
            loading={loading}
            forcePopupIcon={hasActions ? false : forcePopupIcon}
            popupIcon={popupIcon ?? <KeyboardArrowDownIcon />}
            getOptionLabel={customGetOptionLabel}
            ref={ref}
            loadingText={loadingText}
            renderOption={renderOption || (defaultRenderOption as AutocompleteMuiProps<Value>['renderOption'])}
            renderValue={
                renderValue ||
                (otherProps.multiple && !hasCustomRenderTags
                    ? (renderSelectedValue as AutocompleteMuiProps<Value>['renderValue'])
                    : undefined)
            }
            sx={{
                ...otherProps.sx,
            }}
            slotProps={autocompleteSlotProps}
            renderInput={renderAutocompleteInput}
        />
    );
}

export const Autocomplete = React.forwardRef(AutocompleteWithoutRef) as <Value = unknown>(
    props: AutocompleteProps<Value> & {
        ref?: React.ForwardedRef<unknown>;
    },
) => React.JSX.Element;
