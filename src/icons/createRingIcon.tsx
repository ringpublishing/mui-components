import React from 'react';
import type { LucideIcon } from 'lucide-react';
import { RingLucideIcon, type RingLucideIconProps } from '../helpers/RingLucideIcon.js';

/** Props of an icon built with `createRingIcon`: the `RingLucideIcon` API minus the glyph. */
export type RingIconProps = Omit<RingLucideIconProps, 'icon'>;

export type RingIcon = React.ForwardRefExoticComponent<RingIconProps & React.RefAttributes<HTMLSpanElement>>;

/**
 * Wraps a lucide-compatible glyph into a component with the MUI `SvgIcon` prop surface (`color`
 * from the palette plus `ai`, `fontSize` variants and `sx`), so it drops into `startIcon`,
 * `ListItemIcon` or a `Stack` like an `@mui/icons-material` icon. The custom Ring glyphs ship
 * pre-wrapped; an application wraps its own glyphs, or any lucide icon, the same way.
 */
export function createRingIcon(icon: LucideIcon, displayName: string): RingIcon {
    const Component = React.forwardRef<HTMLSpanElement, RingIconProps>((props, ref) => (
        <RingLucideIcon ref={ref} icon={icon} {...props} />
    ));

    Component.displayName = displayName;

    return Component;
}
