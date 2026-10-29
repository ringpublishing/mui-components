import { Action } from '../../../types.js';
import React from 'react';
import { usePickerContext, usePickerTranslations } from '@mui/x-date-pickers-pro';
import { IconButton } from '@mui/material';
import { EllipsisVertical, X } from 'lucide-react';
import { ActionBox } from '../ActionBox/ActionBox.js';
import { WithOwnerDataTestId } from '../../../helpers/dataTestId.js';
import { resolveMoreActionsAriaLabel } from '../../../helpers/moreActionsAriaLabel.js';

interface ActionsWithClearIconButtonProps extends WithOwnerDataTestId {
    actions: Action[];
    /** Accessible name of the button that opens the `actions` menu; blank or missing falls back to the default. */
    ariaLabel?: string;
    anchorRef: React.RefObject<HTMLButtonElement | null>;
}

export function ActionsWithClearIconButton({
    actions,
    ariaLabel,
    anchorRef,
    dataTestId,
}: ActionsWithClearIconButtonProps): React.JSX.Element {
    const pickerContext = usePickerContext();
    const translations = usePickerTranslations();

    return (
        <>
            <IconButton
                size="small"
                // Named like the picker's own clear button, so the app's picker localization covers it too.
                aria-label={translations.fieldClearLabel}
                disabled={pickerContext.disabled || pickerContext.readOnly}
                onClick={(): void => pickerContext.clearValue()}
                data-testid={`${dataTestId}-clear`}
            >
                <X fontSize="small" />
            </IconButton>
            <IconButton
                size="small"
                aria-label={resolveMoreActionsAriaLabel(ariaLabel)}
                ref={anchorRef}
                data-testid={`${dataTestId}-actions`}
            >
                <EllipsisVertical />
            </IconButton>
            <ActionBox
                actions={actions}
                anchorEl={anchorRef}
                dataTestId={`${dataTestId}-menu`}
                placement="bottom-end"
                tooltipPlacement="right"
            />
        </>
    );
}
