import React, { cloneElement, useEffect, useRef } from 'react';
import classNames from 'classnames';
import { isEqual, isNil, omit } from 'lodash';

import { MoreVert } from '@mui/icons-material';
import {
    Autocomplete as MuiAutocomplete,
    AutocompleteRenderInputParams,
    Box,
    CircularProgress,
    IconButton,
    Theme,
    Tooltip,
    Chip,
} from '@mui/material';

import { CommonComponentProps } from '../../../helpers/commonTypes.js';
import { useRingDataTestId } from '../../../helpers/hooks/useRingDataTestId.js';
import { Action } from '../../../types.js';

import { Typography } from '../../Atoms/Typography/Typography.js';
import { ActionBox } from '../ActionBox/ActionBox.js';
import { TextField, TextFieldProps } from '../../index.js';

export interface AutocompleteChangeDetails<Value = string> {
    option: Value;
}

export type AutocompleteChangeReason = 'createOption' | 'selectOption' | 'removeOption' | 'clear' | 'blur';

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

export type MuiOption = MuiAutocompleteProps['options'][0] & { groupBy: string; sortBy: number; caption?: string };

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
        renderOption,
        dataTestIdSuffix,
        ...otherProps
    } = props;

    const dataTestId = useRingDataTestId('Autocomplete', dataTestIdSuffix);

    const refAnchor = useRef<HTMLButtonElement>(null);

    const [recentlyUsedItems, setRecentlyUsedItems] = React.useState<MuiOption[]>(
        JSON.parse(localStorage.getItem(recentlyLocalStorageKey as string) || '[]'),
    );

    let parsedOptions = options as Array<MuiOption>;

    if (showRecentlyUsed) {
        if (!recentlyLocalStorageKey) {
            throw new Error('recentlyLocalStorageKey is required when showRecentlyUsed is true');
        }

        otherProps.groupBy = (o: unknown): string => (o as MuiOption).groupBy;

        parsedOptions = (
            options.map((p) => {
                // Find the item in recently used items (remove groupBy and sortBy)
                const foundItemIndex = recentlyUsedItems.findIndex((r: MuiOption) =>
                    isEqual(omit(r, 'groupBy', 'sortBy'), p),
                );

                if (foundItemIndex >= 0) {
                    const sortBy = recentlyUsedItems.length - foundItemIndex;

                    // @ts-expect-error For spread operator
                    return { ...p, groupBy: labels.recentlyUsed, sortBy };
                }

                // @ts-expect-error We don't know what type is in options
                return { ...p, groupBy: labels.recentlyUsedResults, sortBy: 0 };
            }) || []
        ).sort((a, b) => b.sortBy - a.sortBy);
    }

    const handleOnChange = (
        event: React.SyntheticEvent,
        value: unknown,
        reason: AutocompleteChangeReason,
        details?: AutocompleteChangeDetails<unknown> | undefined,
    ): void => {
        if (showRecentlyUsed) {
            const newRecentlyUsedItems = [...recentlyUsedItems]
                .filter((r: unknown) => {
                    return !isEqual(omit(r as object, 'groupBy', 'sortBy'), omit(value as object, 'groupBy', 'sortBy'));
                })
                .slice(0, recentlyUsedLimit - 1);

            setRecentlyUsedItems([value as MuiOption, ...newRecentlyUsedItems]);
        }

        onChange?.(event, value, reason, details);
    };

    const customGetOptionLabel = (option: unknown): string => {
        if (getOptionLabel) {
            return getOptionLabel(option);
        }

        const { label } = option as { label: string };

        return label;
    };

    useEffect(() => {
        localStorage.setItem(recentlyLocalStorageKey as string, JSON.stringify(recentlyUsedItems));
    }, [recentlyLocalStorageKey, recentlyUsedItems]);

    const renderOptionWithCustomLabelAndCaption = (
        props: React.HTMLAttributes<HTMLLIElement>,
        option: unknown,
    ): React.ReactNode => {
        const { caption, id } = option as { caption: string; id: string };

        return (
            <li {...props} key={id}>
                <Box
                    sx={(t: Theme) => ({
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

    return (
        <MuiAutocomplete
            className={classNames('ring-autocomplete', className)}
            data-testid={dataTestId}
            {...otherProps}
            options={parsedOptions}
            onChange={handleOnChange}
            loading={loading}
            ref={ref}
            loadingText={loadingText}
            renderOption={renderOption || renderOptionWithCustomLabelAndCaption}
            sx={{
                ...otherProps.sx,
                '&.MuiAutocomplete-hasPopupIcon.MuiAutocomplete-hasClearIcon': {
                    '.MuiAutocomplete-inputRoot': {
                        paddingRight: actions || loading ? '56px' : '28px',
                    },
                },
            }}
            componentsProps={{
                clearIndicator: {
                    sx: {
                        margin: 0,
                    },
                },
            }}
            renderTags={(value, getTagProps) => {
                return value.map((option, index) => {
                    const tagProps = getTagProps({ index });
                    const { key, ...chipPropsFromTag } = tagProps;
                    const chipProps: any = {
                        ...chipPropsFromTag,
                        ...slotProps?.chip,
                    };

                    return (
                        <Tooltip key={key} title={customGetOptionLabel(option)}>
                            <Chip label={customGetOptionLabel(option)} {...chipProps} />
                        </Tooltip>
                    );
                });
            }}
            slotProps={slotProps}
            renderInput={(inputParams: AutocompleteRenderInputParams): React.ReactNode => {
                const actionButton =
                    actions && actions?.length === 1 ? (
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
                    actions && actions?.length > 1 ? (
                        <IconButton
                            ref={refAnchor}
                            sx={{ p: '2px' }}
                            data-testid={`${dataTestId}-actions`}
                            onClick={(e): void => e.stopPropagation()}
                        >
                            <MoreVert />
                            {/* zIndex of Autocomplete Popper is 1300 */}
                            <ActionBox
                                actions={actions}
                                anchorEl={refAnchor}
                                zIndex={1400}
                                dataTestIdSuffix={dataTestIdSuffix}
                            />
                        </IconButton>
                    ) : null;
                const circularProgress = loading ? (
                    <IconButton disableFocusRipple={true} disableRipple={true}>
                        <CircularProgress
                            size={'1.5rem'}
                            sx={{ cursor: 'default' }}
                            data-testid={`${dataTestId}-circular-progress`}
                        />
                    </IconButton>
                ) : null;

                const endAdornment = inputParams.InputProps.endAdornment;

                if (React.isValidElement(endAdornment)) {
                    const typedEndAdornment = endAdornment as React.ReactElement<{
                        style?: React.CSSProperties;
                        children?: React.ReactNode[];
                    }>;
                    const adornmentProps = typedEndAdornment.props;
                    inputParams.InputProps.endAdornment = cloneElement(
                        typedEndAdornment,
                        {
                            ...adornmentProps,
                            style: {
                                alignItems: 'center',
                                ...adornmentProps.style,
                            },
                        },
                        circularProgress,
                        adornmentProps.children?.[0],
                        actionButton,
                        moreVertButton,
                    );
                }

                return (
                    <TextField
                        {...slotProps?.textField}
                        {...inputParams}
                        data-testid={dataTestId}
                        slotProps={{
                            input: {
                                ...inputParams.InputProps,
                                endAdornment: inputParams.InputProps.endAdornment,
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
            }}
        />
    );
}

export const Autocomplete = React.forwardRef(AutocompleteWithoutRef);
