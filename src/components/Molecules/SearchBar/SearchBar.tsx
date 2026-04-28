import React from 'react';
import { Stack } from '@mui/material';
import classNames from 'classnames';

import { basicGrey100 } from '../../../theme/index.js';
import { SearchBox, ControlledSearchBoxProps, UncontrolledSearchBoxProps } from '../SearchBox/SearchBox.js';
import { useRingDataTestId } from '../../../helpers/hooks/useRingDataTestId.js';

type SearchBarChildrenProps = {
    /**
     * Children elements to be displayed on the right side of the SearchBar
     */
    children?: React.ReactNode;
};

export type SearchBarProps =
    | (ControlledSearchBoxProps & SearchBarChildrenProps)
    | (UncontrolledSearchBoxProps & SearchBarChildrenProps);

export function SearchBar(props: ControlledSearchBoxProps & SearchBarChildrenProps): React.JSX.Element;
export function SearchBar(props: UncontrolledSearchBoxProps & SearchBarChildrenProps): React.JSX.Element;

export function SearchBar(props: SearchBarProps): React.JSX.Element {
    const { sx, className, dataTestIdSuffix, children, ...otherProps } = props;
    const dataTestId = useRingDataTestId(SearchBar.name, dataTestIdSuffix);

    return (
        <Stack
            data-testid={dataTestId}
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            className={classNames('ring-search-bar', className)}
            sx={{
                borderBottom: `1px solid ${basicGrey100}`,
                padding: '8px 8px 8px 16px',
                ...sx,
            }}
        >
            <SearchBox
                {...(otherProps as ControlledSearchBoxProps)}
                dataTestIdSuffix={dataTestIdSuffix}
                sx={{ flexGrow: 1, paddingRight: 4, border: 'none', paddingY: 0, paddingLeft: 0 }}
            />
            <Stack direction="row" alignItems="center" spacing={2} className="ring-search-bar-children-stack">
                {children}
            </Stack>
        </Stack>
    );
}
