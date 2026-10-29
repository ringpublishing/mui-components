import { X, Search } from 'lucide-react';
import { IconButton, InputAdornment, OutlinedInput, Tooltip } from '@mui/material';
import classNames from 'classnames';
import { debounce } from 'lodash';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { CommonComponentProps } from '../../../helpers/commonTypes.js';
import { RingLucideIcon } from '../../../helpers/RingLucideIcon.js';
import { useRingDataTestId } from '../../../helpers/hooks/useRingDataTestId.js';

export interface SearchBoxBaseProps extends CommonComponentProps {
    /**
     * Show/hide clear button
     */
    withClearButton?: boolean;
    /**
     * Height of the field, the same as TextField, Select and Autocomplete of that size: `small` 32px, `medium` 40px.
     * @default 'medium'
     */
    size?: 'small' | 'medium';
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

/**
 * Not exported from the package. `isBorderless` draws the field without its outline and fill, for a
 * component that frames the search itself (SearchBar's bar, a tree's header).
 */
export type SearchBoxFieldProps = SearchBoxProps & { isBorderless?: boolean };

// A block-level flex box: the full width of a block parent and the width of its content in a row. `fullWidth`
// would take the whole row and squeeze the neighbours.
const FIELD_SX = { display: 'flex' };

const BORDERLESS_SX = {
    backgroundColor: 'transparent',
    '& .MuiOutlinedInput-notchedOutline': { border: 'none' },
};

export function SearchBox(props: ControlledSearchBoxProps): React.JSX.Element;
export function SearchBox(props: UncontrolledSearchBoxProps): React.JSX.Element;

export function SearchBox(props: SearchBoxProps): React.JSX.Element {
    return <SearchBoxField {...props} />;
}

export function SearchBoxField(props: SearchBoxFieldProps): React.JSX.Element {
    const {
        value,
        onChange,
        defaultValue,
        searchFunc,
        debounceTime = 500,
        withClearButton = false,
        size = 'medium',
        labels = {},
        isBorderless = false,
        className,
        sx,
        dataTestIdSuffix,
    } = props;
    const dataTestId = useRingDataTestId('SearchBox', dataTestIdSuffix);
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

    function handleClear(): void {
        if (controlled) {
            onChange?.('');
        } else {
            setValueInternal('');
        }

        // The clear button disappears with the value, so focus goes back to the input instead of the page.
        inputRef.current?.focus();
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

    const hasValue = controlled ? (value?.length ?? 0) > 0 : valueInternal.length > 0;

    return (
        <OutlinedInput
            data-testid={dataTestId}
            className={classNames('ring-search-box', className)}
            size={size}
            inputRef={inputRef}
            onFocus={(): void => setIsIconHighlighted(true)}
            onBlur={(): void => {
                if (!hasValue) {
                    setIsIconHighlighted(false);
                }
            }}
            inputProps={{
                'data-testid': `${dataTestId}-input`,
                'aria-label': labels.placeholder || 'Search',
            }}
            value={controlled ? value : valueInternal}
            onChange={(e): void => {
                if (controlled) {
                    onChange?.(e.target.value);
                } else {
                    setValueInternal(e.target.value);
                }
            }}
            placeholder={labels.placeholder || ''}
            startAdornment={
                <InputAdornment position="start">
                    <RingLucideIcon
                        icon={Search}
                        fontSize={'small'}
                        onClick={handleIconClick}
                        data-testid={`${dataTestId}-search`}
                        sx={{
                            color: isIconHighlighted ? 'text.primary' : 'text.secondary',
                            cursor: 'pointer',
                            ':hover': { color: 'text.primary' },
                        }}
                    />
                </InputAdornment>
            }
            endAdornment={
                withClearButton &&
                hasValue && (
                    <Tooltip title={labels.clear || ''} placement="bottom">
                        <IconButton
                            aria-label={labels.clear || 'Clear'}
                            onClick={handleClear}
                            data-testid={`${dataTestId}-clear`}
                        >
                            <RingLucideIcon
                                icon={X}
                                fontSize={'small'}
                                sx={{ color: 'text.secondary', ':hover': { color: 'text.primary' } }}
                            />
                        </IconButton>
                    </Tooltip>
                )
            }
            sx={[FIELD_SX, isBorderless && BORDERLESS_SX, ...(Array.isArray(sx) ? sx : [sx])]}
        />
    );
}
