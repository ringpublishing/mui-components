import {
    Collapse,
    Divider,
    Tab,
    Tabs,
    type CollapseProps,
    type DividerProps,
    type TabProps,
    type TabsProps,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import type { RingSideRailClassKey, RingSideRailOwnerState } from '@ringpublishing/mui-theme';

import {
    createRingSlotStyle,
    type RingSlot,
    type RingSlotOwnerStateProps,
} from '../../../../helpers/ringComponentSlots.js';

/*
 * Every part of the SideRail is a slot of `RingSideRail`. Its base style is the theme's
 * `theme.ringComponents.RingSideRail[slot]`; what an application sets in
 * `theme.components.RingSideRail.styleOverrides[slot]` is layered on top by MUI.
 */
const name = 'RingSideRail';

export type SideRailOwnerStateProps = RingSlotOwnerStateProps<RingSideRailOwnerState>;
type Slot<P> = RingSlot<P, RingSideRailOwnerState>;

const fromTheme = createRingSlotStyle<RingSideRailClassKey, RingSideRailOwnerState>(name);

export const SideRailRoot = styled('div', { name, slot: 'Root' })<SideRailOwnerStateProps>(fromTheme('root'));
export const SideRailDrawer: Slot<CollapseProps> = styled(Collapse, { name, slot: 'Drawer' })<SideRailOwnerStateProps>(
    fromTheme('drawer'),
);
export const SideRailDrawerContent = styled('div', { name, slot: 'DrawerContent' })<SideRailOwnerStateProps>(
    fromTheme('drawerContent'),
);
export const SideRailPanelRoot = styled('div', { name, slot: 'Panel' })<SideRailOwnerStateProps>(fromTheme('panel'));
export const SideRailRail = styled('div', { name, slot: 'Rail' })<SideRailOwnerStateProps>(fromTheme('rail'));
export const SideRailList: Slot<TabsProps> = styled(Tabs, { name, slot: 'List' })<SideRailOwnerStateProps>(
    fromTheme('list'),
);
export const SideRailBottomGroup = styled('div', { name, slot: 'BottomGroup' })<SideRailOwnerStateProps>(
    fromTheme('bottomGroup'),
);
export const SideRailDivider: Slot<DividerProps> = styled(Divider, { name, slot: 'Divider' })<SideRailOwnerStateProps>(
    fromTheme('divider'),
);
export const SideRailItemRoot: Slot<TabProps> = styled(Tab, { name, slot: 'Item' })<SideRailOwnerStateProps>(
    fromTheme('item'),
);
