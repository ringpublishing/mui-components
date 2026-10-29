import React, { useEffect, useRef, useState } from 'react';
import classNames from 'classnames';
import { Box, IconButton, IconButtonProps, Tooltip } from '@mui/material';
import { visuallyHidden } from '@mui/utils';
import { Check, Copy } from 'lucide-react';

import { CommonComponentProps } from '../../../helpers/commonTypes.js';
import { useRingDataTestId } from '../../../helpers/hooks/useRingDataTestId.js';

export interface CopyIconButtonProps
    extends
        CommonComponentProps,
        Omit<IconButtonProps, 'sx' | 'className' | 'children' | 'onClick' | 'onError' | 'color'> {
    /**
     * The text written to the clipboard.
     */
    value: string;
    /**
     * Labels for the tooltip and the accessible name: `copy` before the click, `copied` while the
     * confirmation shows. Defaults are English placeholders.
     */
    labels?: Partial<{
        copy: string;
        copied: string;
    }>;
    /**
     * Accessible names of the button when they should differ from the visible `labels`: `copy`
     * before the click, `copied` while the confirmation shows. Default to `labels`.
     */
    ariaLabels?: Partial<{
        copy: string;
        copied: string;
    }>;
    /**
     * How long the confirmation (check glyph, `copied` tooltip) stays before the button returns to
     * its copy state, in milliseconds.
     * @default 1500
     */
    copiedForMs?: number;
    /**
     * Called after the value has been written to the clipboard.
     */
    onCopied?: (value: string) => void;
    /**
     * Called when writing to the clipboard fails; the button then shows no confirmation.
     */
    onCopyError?: (error: unknown) => void;
}

const DEFAULT_LABELS = {
    copy: 'Copy',
    copied: 'Copied',
};

const DEFAULT_COPIED_FOR_MS = 1500;

/*
 * The async Clipboard API is refused in some embedding contexts (an iframe without
 * `clipboard-write`, older WebViews), so a hidden textarea with `execCommand('copy')` backs it up.
 */
async function writeToClipboard(value: string, button: HTMLElement): Promise<void> {
    if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
        try {
            await navigator.clipboard.writeText(value);

            return;
        } catch {
            // fall through to the textarea fallback
        }
    }

    // The textarea takes focus for the copy; the control that was activated gets it back.
    const previouslyFocused = document.activeElement;
    const textarea = document.createElement('textarea');

    textarea.value = value;
    textarea.setAttribute('readonly', '');
    textarea.setAttribute('aria-hidden', 'true');
    textarea.style.position = 'fixed';
    textarea.style.top = '0';
    textarea.style.left = '0';
    textarea.style.opacity = '0';
    // Next to the button, so a focus trap around it (Dialog, Drawer) lets the textarea keep focus.
    (button.parentElement ?? document.body).appendChild(textarea);

    let copied = false;

    try {
        textarea.focus({ preventScroll: true });
        textarea.select();
        // Once focus has left the textarea the selection is gone, yet `execCommand` still returns true.
        copied = document.activeElement === textarea && document.execCommand('copy');
    } finally {
        textarea.remove();

        if (previouslyFocused instanceof HTMLElement) {
            previouslyFocused.focus();
        }
    }

    if (!copied) {
        throw new Error('Copying to the clipboard is not available in this context');
    }
}

// The ref is forwarded explicitly: React 18 drops `ref` on a plain function component.
function CopyIconButtonWithoutRef(
    props: CopyIconButtonProps,
    ref: React.ForwardedRef<HTMLButtonElement>,
): React.JSX.Element {
    const {
        value,
        labels: labelsProp,
        ariaLabels: ariaLabelsProp,
        copiedForMs = DEFAULT_COPIED_FOR_MS,
        onCopied,
        onCopyError,
        className,
        sx,
        dataTestIdSuffix,
        disabled = false,
        ...otherProps
    } = props;

    const timerRef = useRef<number | null>(null);
    const [copied, setCopied] = useState(false);
    const [hovered, setHovered] = useState(false);

    const clearConfirmationTimer = (): void => {
        if (timerRef.current !== null) {
            window.clearTimeout(timerRef.current);
            timerRef.current = null;
        }
    };

    useEffect(
        () => (): void => {
            if (timerRef.current !== null) {
                window.clearTimeout(timerRef.current);
            }
        },
        [],
    );

    // Every copy restarts the confirmation, so a second click gets the full time.
    const showConfirmation = (): void => {
        clearConfirmationTimer();
        setCopied(true);
        timerRef.current = window.setTimeout(() => setCopied(false), copiedForMs);
    };

    const dataTestId = useRingDataTestId('CopyIconButton', dataTestIdSuffix);

    const labels = { ...DEFAULT_LABELS, ...labelsProp };
    const label = copied ? labels.copied : labels.copy;
    const ariaLabels = { ...labels, ...ariaLabelsProp };
    const ariaLabel = copied ? ariaLabels.copied : ariaLabels.copy;

    const handleClick = async (button: HTMLElement): Promise<void> => {
        try {
            await writeToClipboard(value, button);
            showConfirmation();
            onCopied?.(value);
        } catch (error) {
            clearConfirmationTimer();
            setCopied(false);
            onCopyError?.(error);
        }
    };

    const button = (
        <IconButton
            {...otherProps}
            ref={ref}
            disabled={disabled}
            className={classNames('ring-copyiconbutton', className)}
            data-testid={dataTestId}
            data-copied={copied ? 'true' : 'false'}
            aria-label={ariaLabel}
            onClick={(event): void => {
                void handleClick(event.currentTarget);
            }}
            sx={[
                // The copy affordance takes the action colour of every other icon; the
                // confirmation reads as success.
                (theme) => ({
                    color: copied ? theme.palette.success.main : theme.palette.action.active,
                }),
                ...(Array.isArray(sx) ? sx : sx ? [sx] : []),
            ]}
        >
            {copied ? <Check /> : <Copy />}
            <Box component="span" aria-live="polite" sx={visuallyHidden}>
                {copied ? labels.copied : ''}
            </Box>
        </IconButton>
    );

    // A disabled button fires no pointer events, so MUI's Tooltip could not open and warns about it.
    if (disabled) {
        return button;
    }

    return (
        <Tooltip
            title={label}
            open={hovered || copied}
            onOpen={(): void => setHovered(true)}
            onClose={(): void => setHovered(false)}
        >
            {button}
        </Tooltip>
    );
}

export const CopyIconButton = React.forwardRef<HTMLButtonElement, CopyIconButtonProps>(CopyIconButtonWithoutRef);

CopyIconButton.displayName = 'CopyIconButton';
