import React, { useId } from 'react';
import { ListItem, type ListItemButtonProps } from '@mui/material';
import type { RingNavigationMenuOwnerState } from '@ringpublishing/mui-theme';
import classNames from 'classnames';

import { CommonComponentProps } from '../../../helpers/commonTypes.js';
import { WithRootDataTestIdOverride, resolveRootDataTestId } from '../../../helpers/dataTestId.js';
import { useRingDataTestId } from '../../../helpers/hooks/useRingDataTestId.js';
import {
    NavigationMenuGroupLabel,
    NavigationMenuGroupList,
    NavigationMenuGroupRoot,
    NavigationMenuItemButton,
    NavigationMenuItemEndAdornment,
    NavigationMenuItemStartIcon,
    NavigationMenuItemText,
    NavigationMenuList,
    NavigationMenuRoot,
} from './slots.js';

export interface NavigationMenuProps extends CommonComponentProps, WithRootDataTestIdOverride {
    /**
     * Accessible name of the navigation landmark. Name it when the page has more than one navigation.
     */
    ariaLabel?: string;
}

export interface NavigationMenuGroupProps extends CommonComponentProps, WithRootDataTestIdOverride {
    /**
     * Label of the group, shown above its items and used as the accessible name of their list. It is rendered as
     * text, not as a heading element.
     */
    label?: React.ReactNode;
}

interface NavigationMenuItemOwnProps extends CommonComponentProps, WithRootDataTestIdOverride {
    /**
     * Icon before the label.
     */
    startIcon?: React.ReactNode;
    /**
     * Content after the label, such as an icon or a counter. It is part of the item, not a separate action.
     */
    endAdornment?: React.ReactNode;
    /**
     * Marks the item as the current one. Sets `aria-current="page"` unless `aria-current` is given.
     * @default false
     */
    selected?: boolean;
}

/**
 * Props of `NavigationMenuItem`: its own props and those of MUI `ListItemButton`. `component` (for example a router
 * link) and `href` make the item a link; the props of that component, such as `to`, are accepted as well.
 */
export type NavigationMenuItemProps<C extends React.ElementType = 'div'> = Omit<
    ListItemButtonProps<C, { component?: C }>,
    keyof NavigationMenuItemOwnProps
> &
    NavigationMenuItemOwnProps;

const NO_OWNER_STATE: RingNavigationMenuOwnerState = {};

function isRendered(node: React.ReactNode): boolean {
    return node !== undefined && node !== null && node !== false && node !== '';
}

/**
 * A navigation landmark with a list of `NavigationMenuItem`s, optionally in `NavigationMenuGroup`s.
 */
export function NavigationMenu(props: NavigationMenuProps): React.JSX.Element {
    const {
        ariaLabel,
        children,
        className,
        sx,
        dataTestIdSuffix,
        dataTestId,
        'data-testid': dataTestIdAttribute,
    } = props;
    const generatedDataTestId = useRingDataTestId('NavigationMenu', dataTestIdSuffix);

    return (
        <NavigationMenuRoot
            ownerState={NO_OWNER_STATE}
            aria-label={ariaLabel}
            className={classNames('ring-navigationmenu', className)}
            sx={sx}
            data-testid={resolveRootDataTestId({ dataTestId, 'data-testid': dataTestIdAttribute }, generatedDataTestId)}
        >
            <NavigationMenuList ownerState={NO_OWNER_STATE}>{children}</NavigationMenuList>
        </NavigationMenuRoot>
    );
}

/**
 * A titled group of `NavigationMenuItem`s inside a `NavigationMenu`.
 */
export function NavigationMenuGroup(props: NavigationMenuGroupProps): React.JSX.Element {
    const { label, children, className, sx, dataTestIdSuffix, dataTestId, 'data-testid': dataTestIdAttribute } = props;
    const labelId = useId();
    const generatedDataTestId = useRingDataTestId('NavigationMenuGroup', dataTestIdSuffix);
    const hasLabel = isRendered(label);

    return (
        <NavigationMenuGroupRoot
            ownerState={NO_OWNER_STATE}
            className={classNames('ring-navigationmenugroup', className)}
            sx={sx}
            data-testid={resolveRootDataTestId({ dataTestId, 'data-testid': dataTestIdAttribute }, generatedDataTestId)}
        >
            {hasLabel && (
                <NavigationMenuGroupLabel ownerState={NO_OWNER_STATE} id={labelId} variant="caption" component="div">
                    {label}
                </NavigationMenuGroupLabel>
            )}
            <NavigationMenuGroupList ownerState={NO_OWNER_STATE} aria-labelledby={hasLabel ? labelId : undefined}>
                {children}
            </NavigationMenuGroupList>
        </NavigationMenuGroupRoot>
    );
}

/**
 * One entry of a `NavigationMenu`: a `ListItemButton` with an optional icon before the label and content after it.
 */
export function NavigationMenuItem(props: { href: string } & NavigationMenuItemProps<'a'>): React.JSX.Element;
export function NavigationMenuItem<C extends React.ElementType = 'div'>(
    props: NavigationMenuItemProps<C>,
): React.JSX.Element;

export function NavigationMenuItem<C extends React.ElementType = 'div'>(
    props: NavigationMenuItemProps<C>,
): React.JSX.Element {
    const {
        startIcon,
        endAdornment,
        selected = false,
        children,
        className,
        dataTestIdSuffix,
        dataTestId,
        'data-testid': dataTestIdAttribute,
        'aria-current': ariaCurrent,
        ...buttonProps
    } = props as NavigationMenuItemProps;
    const generatedDataTestId = useRingDataTestId('NavigationMenuItem', dataTestIdSuffix);
    const ownerState = { selected };

    return (
        <ListItem disablePadding={true}>
            <NavigationMenuItemButton
                {...buttonProps}
                ownerState={ownerState}
                selected={selected}
                aria-current={ariaCurrent ?? (selected ? 'page' : undefined)}
                className={classNames('ring-navigationmenuitem', className)}
                data-testid={resolveRootDataTestId(
                    { dataTestId, 'data-testid': dataTestIdAttribute },
                    generatedDataTestId,
                )}
            >
                {isRendered(startIcon) && (
                    <NavigationMenuItemStartIcon ownerState={ownerState}>{startIcon}</NavigationMenuItemStartIcon>
                )}
                <NavigationMenuItemText ownerState={ownerState} primary={children} />
                {isRendered(endAdornment) && (
                    <NavigationMenuItemEndAdornment ownerState={ownerState}>
                        {endAdornment}
                    </NavigationMenuItemEndAdornment>
                )}
            </NavigationMenuItemButton>
        </ListItem>
    );
}
