import { Clear, Search } from '@mui/icons-material';
import { Input, Stack, Tooltip } from '@mui/material';
import classNames from 'classnames';
import { debounce } from 'lodash';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { CommonComponentProps } from '../../../helpers/commonTypes.js';
import { basicGrey100, basicGrey200 } from '../../../theme/index.js';
import { useRingDataTestId } from '../../../helpers/hooks/useRingDataTestId.js';

export interface SearchBoxBaseProps extends CommonComponentProps {
    /**
     * Show/hide clear button
     */
    withClearButton?: boolean;
    /**
     * Labels
     * ` {
     *         placeholder?: string;
     *         clear?: string;
     *     }`
     */
    labels?: {
        placeholder?: string;
        clear?: string;
    };
}

export interface ControlledSearchBoxProps extends SearchBoxBaseProps {
    /**
     * The value of the input element, required for a controlled component.
     */
    value: string;
    /**
     * Callback fired when the value is changed, required for a controlled component.
     */
    onChange: (value: string) => void;
}

export interface UncontrolledSearchBoxProps extends SearchBoxBaseProps {
    /**
     * The default value, required for an uncontrolled component.
     */
    defaultValue: string;
    /**
     * Search function called after input change, required for an uncontrolled component.
     */
    searchFunc: (query: string) => void;
    /**
     * Delay of calling searchFunc, only for uncontrolled component.
     */
    debounceTime?: number;
}

export type SearchBoxProps =
    | (ControlledSearchBoxProps & { defaultValue?: never; searchFunc?: never; debounceTime?: never })
    | (UncontrolledSearchBoxProps & { value?: never; onChange?: never });

export function SearchBox(props: ControlledSearchBoxProps): React.JSX.Element;
export function SearchBox(props: UncontrolledSearchBoxProps): React.JSX.Element;

export function SearchBox(props: SearchBoxProps): React.JSX.Element {
    const {
        value,
        onChange,
        defaultValue,
        searchFunc,
        debounceTime = 500,
        withClearButton = false,
        labels = {},
        className,
        sx,
        dataTestIdSuffix,
    } = props;
    const dataTestId = useRingDataTestId(SearchBox.name, dataTestIdSuffix);
    const inputRef = useRef<HTMLInputElement>(null);

    const controlled = value !== undefined;

    const [valueInternal, setValueInternal] = useState<string>(defaultValue ?? '');
    const [isIconHighlighted, setIsIconHighlighted] = useState(false);

    const searchFuncDebounced = useMemo(
        () => (searchFunc ? debounce(searchFunc, debounceTime) : undefined),
        [searchFunc, debounceTime],
    );

    function handleIconClick(): void {
        if (inputRef.current) {
            inputRef.current.focus();
        }
    }

    useEffect(() => {
        if (!controlled && searchFuncDebounced) {
            searchFuncDebounced(valueInternal);
        }

        return () => {
            if (searchFuncDebounced) {
                searchFuncDebounced.cancel();
            }
        };
    }, [valueInternal, searchFuncDebounced, controlled]);

    return (
        <Stack
            data-testid={dataTestId}
            direction="row"
            alignItems="center"
            spacing={1}
            className={classNames('ring-search-box', className)}
            sx={{
                border: `1px solid ${basicGrey100}`,
                paddingY: 2,
                paddingX: 2,
                ...sx,
            }}
        >
            <Search
                onClick={handleIconClick}
                data-testid={`${dataTestId}-search`}
                sx={{
                    fill: isIconHighlighted ? (theme): string => theme.palette.secondary.main : basicGrey200,
                    cursor: 'pointer',
                    ':hover': { fill: (theme): string => theme.palette.secondary.main },
                }}
            />
            <Input
                disableUnderline={true}
                fullWidth={true}
                inputRef={inputRef}
                onFocus={(): void => setIsIconHighlighted(true)}
                onBlur={(): void => {
                    if ((controlled && value?.length === 0) || (!controlled && valueInternal.length === 0)) {
                        setIsIconHighlighted(false);
                    }
                }}
                inputProps={{ 'data-testid': `${dataTestId}-input` }}
                value={controlled ? value : valueInternal}
                onChange={(e): void => {
                    if (controlled) {
                        onChange?.(e.target.value);
                    } else {
                        setValueInternal(e.target.value);
                    }
                }}
                placeholder={labels.placeholder || ''}
                sx={{ '& input': { paddingY: 1, height: '24px', lineHeight: '24px' } }}
            />
            {withClearButton &&
                ((controlled && (value?.length ?? 0) > 0) || (!controlled && valueInternal.length > 0)) && (
                    <Tooltip
                        title={labels.clear || ''}
                        placement="bottom"
                        slotProps={{
                            popper: {
                                modifiers: [
                                    {
                                        name: 'offset',
                                        options: {
                                            offset: [0, -8],
                                        },
                                    },
                                ],
                            },
                        }}
                    >
                        <Clear
                            onClick={(): void => {
                                if (controlled) {
                                    onChange?.('');
                                } else {
                                    setValueInternal('');
                                }

                                setIsIconHighlighted(false);
                            }}
                            sx={{ cursor: 'pointer', fill: basicGrey200, ':hover': { fill: '#262626' } }}
                            data-testid={`${dataTestId}-clear`}
                        />
                    </Tooltip>
                )}
        </Stack>
    );
}
