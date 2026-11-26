import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import type { RingSideRailDrawerVariant } from '@ringpublishing/mui-theme';

import { CommonComponentProps } from '../../../helpers/commonTypes.js';
import { WithItemDataTestId } from '../../../helpers/dataTestId.js';

/**
 * How the drawer takes its room: `push` sits beside the rail and narrows the content next to it, `overlay` floats over
 * that content. As it covers the content, an `overlay` drawer also closes on Escape and on a press outside the rail
 * other than in a modal (unless `isAlwaysOpen`), and takes the focus into the panel an item opens.
 */
export type SideRailDrawerVariant = RingSideRailDrawerVariant;

/**
 * When a panel is in the DOM: `active` only while its drawer is open, `firstOpen` from the first time it is opened,
 * `always` from the first render of the rail. A panel kept in the DOM while another one is open is hidden, so its
 * state, subscriptions and frames survive.
 */
export type SideRailPanelMount = 'active' | 'firstOpen' | 'always';

/** One button of the rail. */
export interface SideRailItem extends WithItemDataTestId {
    /** Identifies the item; it is `activeItemId` while the item's drawer is open. */
    id: string;
    /** Text of the tooltip and accessible name of the button. */
    label: string;
    /** Lucide icon drawn on the button. Without it the button shows `initials`. */
    icon?: LucideIcon;
    /**
     * Up to two letters drawn on the button when it has no `icon`. They follow `label` in the button's accessible
     * name, so a user of speech input can say what is on the screen.
     */
    initials?: string;
    /**
     * Runs instead of opening the item's drawer — for an item that opens an application of its own. The item never
     * becomes active and the open drawer stays as it is.
     */
    onClick?: () => void;
    /**
     * What the `onClick` of the item opens, announced by screen readers as the button's popup — `dialog` for an
     * application in a modal dialog. Leave it out when `onClick` opens no popup, for example when it navigates; an
     * item without `onClick` ignores it.
     */
    ariaHasPopup?: 'dialog' | 'menu' | 'listbox' | 'tree' | 'grid';
    /**
     * The item cannot be opened. It keeps its tooltip and stays reachable with the arrow keys; `disabledReason` tells
     * why.
     * @default false
     */
    disabled?: boolean;
    /**
     * Why a `disabled` item cannot be opened, already translated — for example who else is editing it. The tooltip
     * shows it instead of the label, and screen readers announce it as the item's description. Ignored while the item
     * is enabled.
     */
    disabledReason?: string;
    /**
     * Leaves the item out of the rail, without a gap. Its panel can still be opened through `activeItemId`.
     * @default false
     */
    isHidden?: boolean;
    /**
     * Marks the item with a dot: its drawer has content that is new to the user. Turn it off once the drawer has been
     * opened.
     * @default false
     */
    hasBadge?: boolean;
    /** CSS colour of the badge dot. Without it the dot takes the primary colour of the theme. */
    badgeColor?: string;
    /**
     * Draws a ring around the item — for example in the colour of another user who is editing it. The ring alone is
     * not announced: say what it means in `disabledReason` of a `disabled` item.
     * @default false
     */
    hasHighlight?: boolean;
    /** CSS colour of the ring of `hasHighlight`. Without it the ring takes the primary colour of the theme. */
    highlightColor?: string;
}

/** Content of the drawer for one id. */
export interface SideRailPanel {
    /** The `id` of the item that opens the panel. A panel without an item opens only through `activeItemId`. */
    id: string;
    /** What the drawer shows while the panel is open. It brings its own title, padding and actions. */
    content: ReactNode;
    /**
     * Accessible name of the panel, already translated. Without it the panel takes the `label` of its item, so a
     * panel without an item needs it.
     */
    label?: string;
    /**
     * When the panel is in the DOM.
     * @default 'active'
     */
    mount?: SideRailPanelMount;
}

export interface SideRailBaseProps extends Omit<CommonComponentProps, 'children'> {
    /** Buttons of the scrolling list at the top of the rail, in order. */
    items: SideRailItem[];
    /** Buttons pinned to the bottom of the rail under a divider; they never scroll. */
    bottomItems?: SideRailItem[];
    /** Contents of the drawer, one per id. An active id without a panel opens an empty drawer. */
    panels?: SideRailPanel[];
    /**
     * Width of the open drawer, in pixels.
     * @default 380
     */
    drawerWidth?: number;
    /**
     * How the drawer takes its room: `push` beside the rail, `overlay` over the content, closing on Escape and on a
     * press outside the rail other than in a modal, unless `isAlwaysOpen`. Without it the drawer is `overlay` on a
     * screen narrower than the theme's `lg` breakpoint, where `DataView` switches to its small-screen layout, and
     * `push` on a wider one.
     */
    drawerVariant?: SideRailDrawerVariant;
    /**
     * The drawer cannot be closed: one item is always active and clicking it does nothing. Without an active id the
     * rail opens the first visible item that is enabled and has no `onClick`, and reports it to `onActiveItemChange`.
     * @default false
     */
    isAlwaysOpen?: boolean;
    /**
     * The drawer opens and closes at once instead of sliding. It never slides for a user who asks the system to
     * reduce motion. Content next to the rail that animates with the drawer should drop its own transition too.
     * @default false
     */
    disableDrawerAnimation?: boolean;
    /**
     * Accessible texts: `rail` names the rail, `list` the list of `items`, `bottomList` the list of `bottomItems`, and
     * `badge` is announced after the label of an item with `hasBadge`. Defaults are English placeholders.
     */
    ariaLabels?: Partial<{
        rail: string;
        list: string;
        bottomList: string;
        badge: string;
    }>;
}

/** The active item is held by the application. */
export interface ControlledSideRailProps extends SideRailBaseProps {
    /** Id whose drawer is open, `null` when the drawer is closed. It may name a panel that has no item in the rail. */
    activeItemId: string | null;
    /** Called with the id to open, or `null` to close the drawer. */
    onActiveItemChange: (id: string | null) => void;
    defaultActiveItemId?: never;
}

/** The rail holds the active item itself. */
export interface UncontrolledSideRailProps extends SideRailBaseProps {
    /**
     * Id whose drawer is open on the first render.
     * @default null
     */
    defaultActiveItemId?: string | null;
    /** Called with the id that was opened, or `null` when the drawer was closed. */
    onActiveItemChange?: (id: string | null) => void;
    activeItemId?: never;
}

export type SideRailProps = ControlledSideRailProps | UncontrolledSideRailProps;
