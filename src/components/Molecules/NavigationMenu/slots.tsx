import type { StyledComponent } from '@emotion/styled';
import {
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Typography,
    type ListItemButtonProps,
    type ListItemIconProps,
    type ListItemTextProps,
    type TypographyProps,
} from '@mui/material';
import { styled, type Theme } from '@mui/material/styles';
import type { RingNavigationMenuClassKey, RingNavigationMenuOwnerState } from '@ringpublishing/mui-theme';

const name = 'RingNavigationMenu';

interface OwnerStateProps {
    ownerState: RingNavigationMenuOwnerState;
}

type Slot<P> = StyledComponent<P & OwnerStateProps>;

const fromTheme =
    (slot: RingNavigationMenuClassKey) =>
    ({ theme, ownerState }: OwnerStateProps & { theme: Theme }): object => {
        const style = theme.ringComponents?.RingNavigationMenu?.[slot];

        return (typeof style === 'function' ? style({ theme, ownerState }) : style) ?? {};
    };

export const NavigationMenuRoot = styled('nav', { name, slot: 'Root' })<OwnerStateProps>(fromTheme('root'));
export const NavigationMenuList = styled('ul', { name, slot: 'List' })<OwnerStateProps>(fromTheme('list'));

export const NavigationMenuGroupRoot = styled('li', { name, slot: 'Group' })<OwnerStateProps>(fromTheme('group'));
export const NavigationMenuGroupLabel: Slot<TypographyProps> = styled(Typography, {
    name,
    slot: 'GroupLabel',
})<OwnerStateProps>(fromTheme('groupLabel'));
export const NavigationMenuGroupList = styled('ul', { name, slot: 'GroupList' })<OwnerStateProps>(
    fromTheme('groupList'),
);

export const NavigationMenuItemButton: Slot<ListItemButtonProps> = styled(ListItemButton, {
    name,
    slot: 'Item',
})<OwnerStateProps>(fromTheme('item'));
export const NavigationMenuItemStartIcon: Slot<ListItemIconProps> = styled(ListItemIcon, {
    name,
    slot: 'ItemStartIcon',
})<OwnerStateProps>(fromTheme('itemStartIcon'));
export const NavigationMenuItemText: Slot<ListItemTextProps> = styled(ListItemText, {
    name,
    slot: 'ItemText',
})<OwnerStateProps>(fromTheme('itemText'));
export const NavigationMenuItemEndAdornment = styled('span', { name, slot: 'ItemEndAdornment' })<OwnerStateProps>(
    fromTheme('itemEndAdornment'),
);
