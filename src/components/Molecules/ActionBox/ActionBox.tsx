import React, { RefObject, useCallback, useEffect, useId, useLayoutEffect, useRef, useState } from 'react';
import { flushSync } from 'react-dom';
import classNames from 'classnames';

import {
    BackdropProps,
    Box,
    Divider,
    dividerClasses,
    MenuItem,
    menuItemClasses,
    Menu,
    MenuListProps,
    PopperPlacementType,
    MenuProps,
    Stack,
    SxProps,
    Theme,
    Tooltip,
    TooltipProps,
    useTheme,
    useMediaQuery,
} from '@mui/material';
import { MapPin } from 'lucide-react';

import { Action } from '../../../types.js';
import { CommonComponentProps } from '../../../helpers/commonTypes.js';
import { RingLucideIcon } from '../../../helpers/RingLucideIcon.js';
import {
    WithItemDataTestId,
    WithRootDataTestIdOverride,
    resolveItemDataTestId,
    resolveRootDataTestId,
} from '../../../helpers/dataTestId.js';
import { useRingDataTestId } from '../../../helpers/hooks/useRingDataTestId.js';
import { determinePopoverPositions } from './popoverPositions.js';

export interface ActionBoxItem extends Action, WithItemDataTestId {
    /**
     * If true, a separator is rendered after this action.
     */
    hasSeparatorAfter?: boolean;
    /**
     * If true, a separator is rendered before this action.
     */
    hasSeparatorBefore?: boolean;
    /**
     * Custom styles applied to the MenuItem element for this action
     */
    sx?: SxProps<Theme>;
}

export interface ActionBoxProps
    extends CommonComponentProps, WithRootDataTestIdOverride, Omit<MenuProps, 'open' | 'children' | 'anchorEl'> {
    /**
     * Actions shown in the menu.
     */
    actions: ActionBoxItem[];
    /**
     * Ref to the anchor element. User should pass whole `ref` object, not only `ref.current`
     */
    anchorEl: RefObject<HTMLElement | null>;
    /**
     * Placement of the menu, as a `PopperPlacementType`.
     */
    placement?: PopperPlacementType;
    /**
     * 'Placement of the disabled reason for the action tooltip'
     * @default right
     */
    tooltipPlacement?: TooltipProps['placement'];
    /**
     * Lets the actions beyond `visibleActionsCount` scroll; when false they are cut off. Without `visibleActionsCount`
     * it has no effect, and the menu scrolls when it is taller than the screen.
     * @default true
     */
    hasScroll?: boolean;
    /**
     * Number of actions the menu is tall enough for, counted as 36px items (48px on small screens), so taller items
     * show fewer. Without it the menu shows every action and scrolls only when it is taller than the screen.
     */
    visibleActionsCount?: number;

    /**
     * Z-index of the menu.
     */
    zIndex?: number;
    /** Called when the menu opens. */
    onOpen?: () => void;
    /** Called when the menu closes. */
    onClose?: () => void;
}

const MAX_MENU_WIDTH = 320;

// Beside a menu that fills a narrow screen neither side has room, and flipping only tries the opposite side. Above or
// below the item the tooltip can still slide sideways to stay on screen.
const TOOLTIP_SLOT_PROPS: TooltipProps['slotProps'] = {
    popper: {
        popperOptions: {
            modifiers: [{ name: 'flip', options: { fallbackPlacements: ['left', 'right', 'bottom', 'top'] } }],
        },
    },
};

export function ActionBox(props: ActionBoxProps): React.JSX.Element {
    const [anchorElState, setAnchorElState] = useState<HTMLElement | null>(null);

    const theme = useTheme();

    const {
        actions,
        anchorEl,
        placement,
        tooltipPlacement = 'right',
        // Both are destructured so neither reaches the DOM through the spread below.
        dataTestId: dataTestIdOverride,
        'data-testid': dataTestIdAttribute,
        visibleActionsCount,
        hasScroll = true,
        zIndex = theme.zIndex.modal,
        onOpen,
        onClose,
        sx,
        className,
        slotProps,
        ...otherProps
    } = props;

    useEffect(() => {
        if (placement && ['auto', 'auto-start', 'auto-end'].includes(placement)) {
            console.warn('Auto* placements uses default Menu placement');
        }
    }, [placement]);

    const generatedDataTestId = useRingDataTestId('ActionBox', props.dataTestIdSuffix);
    const dataTestId = resolveRootDataTestId(
        { dataTestId: dataTestIdOverride, 'data-testid': dataTestIdAttribute },
        generatedDataTestId,
    );

    const [open, setOpen] = useState(false);
    const generatedMenuListId = useId();

    const toggleOpen = useCallback(() => {
        setAnchorElState(anchorEl.current);
        setOpen((currentOpen) => !currentOpen);
    }, [anchorEl]);

    const closeActionBox = useCallback(() => {
        setAnchorElState(null);
        setOpen(false);
    }, []);

    const callbacksRef = useRef({ onOpen, onClose });
    callbacksRef.current = { onOpen, onClose };

    const previousOpen = useRef(open);

    useEffect(() => {
        if (open === previousOpen.current) {
            return;
        }

        previousOpen.current = open;

        if (open) {
            callbacksRef.current.onOpen?.();
        } else {
            callbacksRef.current.onClose?.();
        }
    }, [open]);

    useEffect(() => {
        return () => {
            if (previousOpen.current) {
                callbacksRef.current.onClose?.();
            }
        };
    }, []);

    useEffect(() => {
        const ref = anchorEl.current;

        if (ref) {
            ref.addEventListener('click', toggleOpen);
        }

        return () => {
            if (ref) {
                ref.removeEventListener('click', toggleOpen);
            }
        };
    }, [anchorEl, toggleOpen]);

    const listSlotProps = (typeof slotProps?.list === 'function' ? {} : (slotProps?.list ?? {})) as MenuListProps;
    const menuListId = listSlotProps.id ?? generatedMenuListId;

    // The caller renders the trigger, so its menu-button state is written onto `anchorEl` the same way the
    // click listener is attached. Only a button takes it: a plain element cannot carry these attributes.
    useEffect(() => {
        const trigger = anchorEl.current;

        if (!trigger || !(trigger instanceof HTMLButtonElement || trigger.getAttribute('role') === 'button')) {
            return;
        }

        trigger.setAttribute('aria-haspopup', 'menu');

        if (open) {
            trigger.setAttribute('aria-expanded', 'true');
            trigger.setAttribute('aria-controls', menuListId);
        }

        return () => {
            trigger.removeAttribute('aria-haspopup');
            trigger.removeAttribute('aria-expanded');
            trigger.removeAttribute('aria-controls');
        };
    }, [anchorEl, open, menuListId]);

    // On screens smaller than 600px a MenuItem is 48px high.
    const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));
    const menuItemHeight = isSmallScreen ? 48 : 36;
    const padding = Number.parseFloat(theme.spacing(1));
    // MenuList top and bottom padding (theme spacing 1) plus the height of the visible MenuItems, kept within the
    // screen by Menu's own limit, which an inline `maxHeight` would otherwise replace.
    const maxPaperHeight =
        visibleActionsCount === undefined
            ? undefined
            : `min(${2 * padding + menuItemHeight * visibleActionsCount}px, calc(100% - 96px))`;

    // if there is at least one action with icon, extra space is needed for other actions
    const iconInOneOfActions = actions.some((action) => action.icon);
    const iconPlaceholder = <RingLucideIcon icon={MapPin} sx={{ visibility: 'hidden' }} />;
    const paperSlotProps = (typeof slotProps?.paper === 'function' ? {} : (slotProps?.paper ?? {})) as {
        style?: React.CSSProperties;
        sx?: SxProps<Theme>;
    };

    return (
        <Menu
            id="split-button-menu"
            data-testid={dataTestId}
            open={open}
            anchorEl={anchorElState}
            className={classNames('ring-action-box', className)}
            {...(placement ? determinePopoverPositions(placement) : {})}
            {...otherProps}
            slotProps={{
                ...slotProps,
                // The backdrop is portalled, yet React bubbles its click to the ActionBox's ancestors: without this,
                // the click that dismisses the menu also reaches the card, row or list item the menu belongs to.
                backdrop: (ownerState): Partial<BackdropProps> => {
                    const backdropSlotProps =
                        typeof slotProps?.backdrop === 'function'
                            ? slotProps.backdrop(ownerState)
                            : slotProps?.backdrop;

                    return {
                        ...backdropSlotProps,
                        onClick: (event: React.MouseEvent<HTMLDivElement>): void => {
                            event.stopPropagation();
                            backdropSlotProps?.onClick?.(event);
                        },
                    };
                },
                // Arrow keys stop on a disabled action too, so its reason can be read before moving on.
                list: { disabledItemsFocusable: true, ...listSlotProps, id: menuListId },
                paper: {
                    ...paperSlotProps,
                    style: {
                        ...(maxPaperHeight && { maxHeight: maxPaperHeight, overflowY: hasScroll ? 'auto' : 'hidden' }),
                        ...paperSlotProps.style,
                    },
                    sx: [
                        // A long label ends in an ellipsis instead of widening the menu; the caller's `sx` may widen it.
                        { maxWidth: `min(${MAX_MENU_WIDTH}px, calc(100% - 32px))` },
                        ...(Array.isArray(paperSlotProps.sx)
                            ? paperSlotProps.sx
                            : paperSlotProps.sx
                              ? [paperSlotProps.sx]
                              : []),
                        ...(Array.isArray(sx) ? sx : sx ? [sx] : []),
                    ],
                },
            }}
            sx={{
                zIndex,
                // MenuItem gives a Divider right after it an 8px margin, which `maxPaperHeight` does not count.
                [`& .${menuItemClasses.root} + .${dividerClasses.root}`]: { marginY: 0 },
            }}
            onClose={closeActionBox}
            autoFocus={true}
        >
            {actions.flatMap((action, index) =>
                [
                    action.hasSeparatorBefore && <Divider key={`${action.label}-divider-before`} />,
                    <ActionBoxMenuItem
                        key={action.label}
                        action={action}
                        disabled={action.disabled ?? false}
                        icon={action.icon || (iconInOneOfActions && iconPlaceholder)}
                        tooltipPlacement={tooltipPlacement}
                        dataTestId={resolveItemDataTestId({
                            rootId: dataTestId,
                            index,
                            item: action,
                        })}
                        onSelect={closeActionBox}
                    />,
                    action.hasSeparatorAfter && <Divider key={`${action.label}-divider-after`} />,
                ].filter(Boolean),
            )}
        </Menu>
    );
}

interface ActionBoxMenuItemProps {
    action: ActionBoxItem;
    /** Also read by `MenuList`, which skips a disabled child when it picks the item to focus on open. */
    disabled: boolean;
    icon: React.ReactNode;
    tooltipPlacement: TooltipProps['placement'];
    dataTestId: string;
    onSelect: () => void;
    /** Injected by `MenuList` into the item it focuses on open. */
    autoFocus?: boolean;
    /** Injected by `MenuList` into the item it focuses on open. */
    tabIndex?: number;
}

function ActionBoxMenuItem(props: ActionBoxMenuItemProps): React.JSX.Element {
    const { action, disabled, icon, tooltipPlacement, dataTestId, onSelect, autoFocus, tabIndex } = props;

    const labelRef = useRef<HTMLDivElement>(null);
    const [isLabelTruncated, setIsLabelTruncated] = useState(false);

    useLayoutEffect(() => {
        const label = labelRef.current;

        if (label) {
            setIsLabelTruncated(label.scrollWidth > label.clientWidth);
        }
    }, [action.label]);

    const disabledReason = disabled ? action.disabledReason : undefined;
    // One tooltip per item: a disabled item with a reason shows the reason, any other shows a cut-off label in full.
    const showsFullLabel = !disabledReason && isLabelTruncated;

    const menuItem = (
        <MenuItem
            autoFocus={autoFocus}
            tabIndex={tabIndex}
            disabled={disabled}
            onClick={(e): void => {
                e.stopPropagation();

                // A disabled MenuItem ignores Enter and Space, but a click still reaches it: the item takes the
                // pointer while it has a reason to show, and a dispatched click ignores pointer-events anyway.
                if (disabled) {
                    return;
                }

                // The menu closes first and hands focus back to its trigger right away, so an action that moves
                // focus (into a field, a dialog) runs after that and keeps it instead of losing it to the trigger.
                flushSync(onSelect);

                if (action.onClick) {
                    action.onClick(e);
                }
            }}
            data-testid={dataTestId}
            // The full label is already the item's name, so the tooltip repeating it stays visual only: these
            // override what `describeChild` would add (a `title`, then `aria-describedby`).
            {...(showsFullLabel && { title: undefined, 'aria-describedby': undefined })}
            sx={[
                // ButtonBase drops the focus-visible state of a disabled item, yet the arrow keys stop on it.
                { [`&.${menuItemClasses.disabled}:focus-visible`]: { backgroundColor: 'action.focus' } },
                disabledReason
                    ? {
                          [`&.${menuItemClasses.disabled}`]: { pointerEvents: 'auto' },
                          [`&.${menuItemClasses.disabled}:hover`]: { backgroundColor: 'transparent' },
                      }
                    : {},
                ...(Array.isArray(action.sx) ? action.sx : action.sx ? [action.sx] : []),
            ]}
        >
            {' '}
            <Stack
                direction="row"
                spacing={1}
                sx={{
                    justifyContent: 'center',
                    alignItems: 'center',
                    minWidth: 0,
                }}
            >
                <Box
                    sx={(theme): { color: string; display: string; flexShrink: number } => {
                        return {
                            display: 'flex',
                            flexShrink: 0,
                            color: theme.palette.action.active,
                        };
                    }}
                >
                    {icon}
                </Box>
                <Box ref={labelRef} sx={{ minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {action.label}
                </Box>
            </Stack>
        </MenuItem>
    );

    if (!disabledReason && !showsFullLabel) {
        return menuItem;
    }

    // `describeChild`: the reason describes the item; by default Tooltip would make it the item's name.
    return (
        <Tooltip
            title={disabledReason ?? action.label}
            placement={tooltipPlacement}
            describeChild={true}
            slotProps={TOOLTIP_SLOT_PROPS}
        >
            {menuItem}
        </Tooltip>
    );
}
