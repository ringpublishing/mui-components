import React, { useId } from 'react';
import { Badge, Tooltip, type TabProps } from '@mui/material';
import type { RingSideRailOwnerState } from '@ringpublishing/mui-theme';

import { RingLucideIcon } from '../../../../helpers/RingLucideIcon.js';
import type { SideRailItem } from '../SideRail.types.js';
import { SideRailItemRoot } from './slots.js';

export interface SideRailTabProps extends Omit<TabProps, 'onClick' | 'children'> {
    item: SideRailItem;
    ownerState: RingSideRailOwnerState;
    /** DOM id of the item's panel, when it has one. */
    panelId?: string;
    /** Announced after the label of an item with a badge. */
    badgeLabel: string;
    dataTestId: string;
    onActivate: (item: SideRailItem) => void;
    /** Set by `Tabs` on the tab of the open drawer; `TabProps` leaves it out. Passed on to the `Tab`. */
    selected?: boolean;
}

/** Where each key moves the focus in a list of `count` items, from the item at `index`; wraps at both ends. */
const FOCUS_TARGETS: Record<string, (index: number, count: number) => number> = {
    ArrowUp: (index, count) => (index - 1 + count) % count,
    ArrowDown: (index, count) => (index + 1) % count,
    Home: () => 0,
    End: (index, count) => count - 1,
};

/*
 * Moves the focus between the items of one list in place of `Tabs`, which skips the items with `aria-disabled`: a
 * disabled item stays reachable, so that its tooltip and `disabledReason` can be read. The event stops here, so
 * `Tabs` does not move the focus a second time.
 */
function moveFocus(event: React.KeyboardEvent<HTMLElement>): void {
    const target = FOCUS_TARGETS[event.key];
    const list = event.currentTarget.closest('[role="tablist"]');

    if (!target || !list) {
        return;
    }

    const tabs = Array.from(list.querySelectorAll<HTMLElement>('[role="tab"]'));

    event.preventDefault();
    event.stopPropagation();
    tabs[target(tabs.indexOf(event.currentTarget), tabs.length)]?.focus();
}

/*
 * One button of the rail. `Tabs` clones it with `value`, `selected`, `onChange` and the other props of its tabs, which
 * go straight to the `Tab`. The tooltip wraps the `Tab` itself, without a wrapping element, so the tabs stay siblings
 * in their list.
 */
export function SideRailTab(props: SideRailTabProps): React.JSX.Element {
    const { item, ownerState, panelId, badgeLabel, dataTestId, onActivate, ...tabProps } = props;
    const {
        label,
        icon,
        initials,
        onClick,
        ariaHasPopup,
        disabled = false,
        disabledReason,
        hasBadge = false,
        badgeColor,
        hasHighlight = false,
        highlightColor,
    } = item;

    const descriptionId = useId();
    // Why the item is disabled: shown in the tooltip instead of the label, and read out after it.
    const description = (disabled && disabledReason) || undefined;

    const glyph = icon ? <RingLucideIcon icon={icon} fontSize="medium" /> : <span>{initials}</span>;
    // Initials drawn on the button are visible text, so the name carries them too: a user of speech input says
    // what is on the screen.
    const name = !icon && initials ? `${label}, ${initials}` : label;

    return (
        <Tooltip title={description ?? label} placement="left" arrow={true}>
            <SideRailItemRoot
                {...tabProps}
                ownerState={{
                    ...ownerState,
                    // `Tabs` passes `selected` to the tab of the open drawer.
                    active: Boolean(tabProps.selected),
                    disabled,
                    highlighted: hasHighlight,
                    highlightColor: hasHighlight ? highlightColor : undefined,
                    badgeColor: hasBadge ? badgeColor : undefined,
                }}
                // A focus-visible item is drawn with the theme's focus ring, not with MUI's pulsating ripple.
                disableFocusRipple={true}
                disableRipple={disabled}
                // Not the native `disabled`: a disabled button gets no hover, and the item keeps its tooltip.
                aria-disabled={disabled || undefined}
                aria-label={hasBadge ? `${name}, ${badgeLabel}` : name}
                aria-describedby={description ? descriptionId : undefined}
                aria-controls={onClick ? undefined : panelId}
                aria-haspopup={onClick ? ariaHasPopup : undefined}
                data-testid={dataTestId}
                // `aria-label` names the button, so the glyph and the dot are not read out.
                label={
                    <>
                        {hasBadge ? (
                            <Badge variant="dot" color="primary">
                                {glyph}
                            </Badge>
                        ) : (
                            glyph
                        )}
                        {description && (
                            <span id={descriptionId} hidden={true}>
                                {description}
                            </span>
                        )}
                    </>
                }
                onClick={(): void => {
                    if (!disabled) {
                        onActivate(item);
                    }
                }}
                onKeyDown={moveFocus}
            />
        </Tooltip>
    );
}
