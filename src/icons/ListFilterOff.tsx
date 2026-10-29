import React from 'react';
import type { LucideIcon, LucideProps } from 'lucide-react';
import { Icon } from './Icon.js';

// The struck-through partner for lucide's `list-filter`, which lucide does not ship: the same three
// rules at the same y positions, cut by the diagonal. No `strokeWidth` default, so it takes the same
// thickness from the lucide context that `ListFilter` does.
export const ListFilterOff: LucideIcon = React.forwardRef<SVGSVGElement, LucideProps>((props, ref) => {
    return (
        <Icon ref={ref} iconName="list-filter-off" {...props}>
            <path d="M10 5H22" />
            <path d="M6 12H11" />
            <path d="M16.6543 12H18.5873" />
            <path d="M9 19H14" />
            <path d="M2 2L22 22" />
        </Icon>
    );
});

ListFilterOff.displayName = 'ListFilterOff';
