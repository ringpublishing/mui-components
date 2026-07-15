import { KeyboardArrowDown as KeyboardArrowDownIcon, MoreVert } from '@mui/icons-material';
import {
    Autocomplete as MuiAutocomplete,
    AutocompleteChangeDetails,
    AutocompleteChangeReason,
    AutocompleteRenderInputParams,
    Box,
    Chip,
    CircularProgress,
    IconButton,
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

type MuiAutocompleteProps = React.ComponentProps<typeof MuiAutocomplete>;
type AutocompleteOptionWithMeta = Record<string, unknown> & {
    caption?: string;
    groupBy?: string;
    id?: React.Key;
    label?: string;
    sortBy?: number;
};

export interface AutocompleteProps extends CommonComponentProps, Omit<MuiAutocompleteProps, 'renderInput'> {
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
    } & MuiAutocompleteProps['slotProps'];
}

export type MuiOption = AutocompleteOptionWithMeta;

const isAutocompleteOptionObject = (option: unknown): option is AutocompleteOptionWithMeta => {
    return option !== null && typeof option === 'object' && !Array.isArray(option);
};

const stripRecentlyUsedMeta = (option: object): MuiOption => {
    return omit(option, 'groupBy', 'sortBy') as MuiOption;
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
): React.ReactNode => {
    const { key, ...optionProps } = props;
    const caption = isAutocompleteOptionObject(option) ? option.caption : undefined;
    const id = isAutocompleteOptionObject(option) ? option.id : undefined;

    return (
        <li {...optionProps} key={id || key}>
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

const createRenderSelectedValue = (
    customGetOptionLabel: (option: unknown) => string,
    chipSlotProps: Partial<React.ComponentProps<typeof Chip>> | undefined,
): NonNullable<MuiAutocompleteProps['renderValue']> => {
    return (value, getItemProps): React.ReactNode => {
        if (!Array.isArray(value)) {
            return null;
        }

        return value.map((option, index) => {
            const { key, ...chipPropsFromItem } = getItemProps({ index }) as ReturnType<typeof getItemProps> & {
                key?: React.Key;
            };

            return (
                <Tooltip key={key || index} title={customGetOptionLabel(option)}>
                    <Chip label={customGetOptionLabel(option)} {...chipPropsFromItem} {...chipSlotProps} />
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

function AutocompleteWithoutRef(props: AutocompleteProps, ref: React.ForwardedRef<unknown>): React.JSX.Element {
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
        dataTestIdSuffix,
        ...otherProps
    } = props;

    const dataTestId = useRingDataTestId('Autocomplete', dataTestIdSuffix);

    const refAnchor = useRef<HTMLButtonElement>(null);

    const { textField: textFieldSlotProps, ...autocompleteSlotProps } = slotProps || {};

    const [recentlyUsedItems, setRecentlyUsedItems] = React.useState<MuiOption[]>(() =>
        getStoredRecentlyUsedItems(showRecentlyUsed, recentlyLocalStorageKey),
    );

    let parsedOptions: MuiAutocompleteProps['options'] = options;

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
                return originalIsOptionEqualToValue(cleanOption, cleanValue);
            }

            return isEqual(cleanOption, cleanValue);
        };

        parsedOptions = options
            .map((option) => {
                if (!isAutocompleteOptionObject(option)) {
                    return option;
                }

                const foundItemIndex = recentlyUsedItems.findIndex((r: MuiOption) =>
                    isEqual(stripRecentlyUsedMeta(r), option),
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

        onChange?.(event, value, reason, details);
    };

    const customGetOptionLabel = (option: unknown): string => {
        if (getOptionLabel) {
            return getOptionLabel(option);
        }

        return getOptionLabelFallback(option);
    };

    const defaultRenderOption: NonNullable<MuiAutocompleteProps['renderOption']> = (
        optionProps,
        option,
    ): React.ReactNode => {
        return renderOptionWithCustomLabelAndCaption(optionProps, option, customGetOptionLabel);
    };

    const chipSlotProps =
        typeof autocompleteSlotProps.chip === 'function'
            ? undefined
            : (autocompleteSlotProps.chip as Partial<React.ComponentProps<typeof Chip>> | undefined);
    const renderSelectedValue = createRenderSelectedValue(customGetOptionLabel, chipSlotProps);

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
        <MuiAutocomplete
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
            renderOption={renderOption || defaultRenderOption}
            renderValue={
                renderValue || (otherProps.multiple && !otherProps.renderTags ? renderSelectedValue : undefined)
            }
            sx={{
                ...otherProps.sx,
            }}
            slotProps={autocompleteSlotProps}
            renderInput={renderAutocompleteInput}
        />
    );
}

export const Autocomplete = React.forwardRef(AutocompleteWithoutRef);
