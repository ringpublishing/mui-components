import React from 'react';
import classNames from 'classnames';
import { Switch as MuiSwitch, SwitchProps as MuiSwitchProps } from '@mui/material';

import { CommonComponentProps } from '../../../helpers/commonTypes.js';
import { useRingDataTestId } from '../../../helpers/hooks/useRingDataTestId.js';

export interface SwitchProps extends Omit<MuiSwitchProps, 'color'>, Omit<CommonComponentProps, 'children'> {
    /**
     * Switch color. The design defines the default (primary) and error variants.
     * @default 'primary'
     */
    color?: 'primary' | 'error';
}

// A slot's props may be the callback form MUI supports; it has to be resolved before
// spreading or the consumer's props are silently dropped.
function resolveSlotProps(slot: unknown, ownerState: unknown): Record<string, unknown> {
    const resolved = typeof slot === 'function' ? (slot as (state: unknown) => unknown)(ownerState) : slot;

    return (resolved as Record<string, unknown> | undefined) ?? {};
}

// Widened types: `data-*` attributes fail the excess-property check on a fresh literal.
function withRingTestId(dataTestId: string, slot: unknown, ownerState: unknown): Record<`data-${string}`, string> {
    const merged: Record<string, unknown> = {
        'data-testid': dataTestId,
        ...resolveSlotProps(slot, ownerState),
    };

    return merged as Record<`data-${string}`, string>;
}

// The look lives in the theme's MuiSwitch overrides; this wrapper only adds the Ring test ids
// and narrows `color` to the variants the design defines. The ref is forwarded explicitly:
// React 18 drops `ref` on a plain function component, and a wrapping Tooltip needs it.
function SwitchWithoutRef(props: SwitchProps, ref: React.ForwardedRef<HTMLButtonElement>): React.JSX.Element {
    const { className, dataTestIdSuffix, slotProps, ...otherProps } = props;

    const dataTestId = useRingDataTestId('Switch', dataTestIdSuffix);
    // The test ids go through slots because MUI forwards unknown root props to the inner
    // switch base, not to the root span. Both slots are merged with the consumer's own slot
    // props rather than replaced by them, so the ids survive; on conflict the consumer wins.
    const { root: rootSlot, input: inputSlot, ...otherSlotProps } = slotProps ?? {};

    return (
        <MuiSwitch
            ref={ref}
            className={classNames('ring-switch', className)}
            slotProps={{
                ...otherSlotProps,
                root: (ownerState) => withRingTestId(dataTestId, rootSlot, ownerState),
                input: (ownerState) => withRingTestId(`${dataTestId}-input`, inputSlot, ownerState),
            }}
            {...otherProps}
        />
    );
}

export const Switch = React.forwardRef<HTMLButtonElement, SwitchProps>(SwitchWithoutRef);

Switch.displayName = 'Switch';
