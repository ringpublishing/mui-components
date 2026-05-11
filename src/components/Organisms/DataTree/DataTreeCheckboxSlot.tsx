import { forwardRef } from 'react';
import { Box, Checkbox } from '@mui/material';

export interface DataTreeCheckboxSlotProps {
    hasCheckbox: boolean;
    checked: boolean;
    checkboxDisabled: boolean;
    itemId: string;
    onCheckboxChange?: (itemId: string, checked: boolean) => void;
    checkboxSetRef: (node: HTMLElement | null) => void;
}

/**
 * Module-scope checkbox slot for `DataTree`. MUI compares slot components by
 * reference; a fresh inline component on every render forces an unmount /
 * remount of the underlying input on every checkbox toggle, which loses
 * keyboard focus. Keeping this at module scope gives MUI a stable identity
 * and lets it just rerender the existing node.
 *
 * Used by both the static (`DataTreeItem`) and dynamic (`DataTreeItemDynamic`)
 * row components — they thread the per-row data through `slotProps.checkbox`.
 */
export const DataTreeCheckboxSlot = forwardRef<HTMLButtonElement, DataTreeCheckboxSlotProps>((props, ref) => {
    const { hasCheckbox, checked, checkboxDisabled, itemId, onCheckboxChange, checkboxSetRef } = props;

    if (!hasCheckbox) {
        return null;
    }

    return (
        <Box ref={checkboxSetRef} component="span" sx={{ display: 'inline-flex' }}>
            <Checkbox
                ref={ref}
                checked={checked}
                disabled={checkboxDisabled}
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
