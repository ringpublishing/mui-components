import { forwardRef } from 'react';
import { Box, Checkbox } from '@mui/material';

export interface DataTreeCheckboxSlotProps {
    hasCheckbox: boolean;
    checked: boolean;
    checkboxDisabled: boolean;
    itemId: string;
    /** The row's label as plain text — the checkbox's accessible name. */
    ariaLabel: string;
    onCheckboxChange?: (itemId: string, checked: boolean) => void;
    checkboxSetRef: (node: HTMLElement | null) => void;
}

/**
 * Module-scope checkbox slot for `DataTree` rows, static and dynamic alike. MUI compares slot
 * components by reference, so an inline component would remount the input on every toggle and lose
 * keyboard focus.
 */
export const DataTreeCheckboxSlot = forwardRef<HTMLButtonElement, DataTreeCheckboxSlotProps>((props, ref) => {
    const { hasCheckbox, checked, checkboxDisabled, itemId, ariaLabel, onCheckboxChange, checkboxSetRef } = props;

    if (!hasCheckbox) {
        return null;
    }

    return (
        <Box ref={checkboxSetRef} component="span" sx={{ display: 'inline-flex' }}>
            <Checkbox
                ref={ref}
                checked={checked}
                disabled={checkboxDisabled}
                // The tree item's own `aria-checked` follows MUI's selection, not `checked`, so the
                // checkbox stays exposed and is named after the row.
                slotProps={{ input: { 'aria-label': ariaLabel } }}
                sx={{ padding: '0px' }}
                onChange={(): void => onCheckboxChange?.(itemId, !checked)}
                onClick={(e): void => {
                    e.stopPropagation();
                }}
            />
        </Box>
    );
});
DataTreeCheckboxSlot.displayName = 'DataTreeCheckboxSlot';
