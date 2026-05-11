import React, { RefObject, useCallback, useEffect, useState } from 'react';
import classNames from 'classnames';

import {
    Box,
    ClickAwayListener,
    Divider,
    Grow,
    MenuItem,
    MenuList,
    Paper,
    Popper,
    PopperPlacementType,
    PopperProps,
    Stack,
    SxProps,
    Theme,
    Tooltip,
    TooltipProps,
    useTheme,
} from '@mui/material';
import { Place } from '@mui/icons-material';

import { Action } from '../../../types.js';
import { CommonComponentProps } from '../../../helpers/commonTypes.js';
import { useRingDataTestId } from '../../../helpers/hooks/useRingDataTestId.js';

export interface ActionBoxItem extends Action {
    /**
     * If true, the Action Box will have a separator after the last action
     */
    hasSeparatorAfter?: boolean;
    /**
     * If true, the Action Box will have a separator before the first action
     */
    hasSeparatorBefore?: boolean;
    /**
     * Custom styles applied to the MenuItem element for this action
     */
    sx?: SxProps<Theme>;
}

export interface ActionBoxProps extends CommonComponentProps, Omit<PopperProps, 'open' | 'children' | 'anchorEl'> {
    /**
     * Actions list shown in Action Box
     */
    actions: ActionBoxItem[];
    /**
     * Ref to the anchor element. User should pass whole `ref` object, not only `ref.current`
     */
    anchorEl: RefObject<HTMLElement | null>;
    /**
     * 'Placement of the disabled reason for the action tooltip'
     * @default right
     */
    tooltipPlacement?: TooltipProps['placement'];
    hasScroll?: boolean;
    visibleActionsCount?: number;
    /**
     * Z-index of the Action Box
     */
    zIndex?: number;
}

export function ActionBox(props: ActionBoxProps): React.JSX.Element {
    const { dataTestIdSuffix } = props;
    const dataTestId = useRingDataTestId(ActionBox.name, dataTestIdSuffix);

    const theme = useTheme();

    const {
        actions,
        anchorEl,
        placement = 'bottom-end',
        tooltipPlacement = 'right',
        hasScroll = true,
        visibleActionsCount = actions.length,
        zIndex = theme.zIndex.modal,
        sx,
        className,
        ...otherProps
    } = props;

    const [open, setOpen] = useState(false);

    const toggleOpen = useCallback(() => {
        setOpen((n) => !n);
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

    const menuItemHeight = 42;
    // padding of MenuList plus height og MenuItem times visible actions (and 8 px to indicate existence of more items)
    const maxPaperHeight = 16 + menuItemHeight * visibleActionsCount + 8;

    // if there is at least one action with icon, extra space is needed for other actions
    const iconInOneOfActions = actions.some((action) => action.icon);
    const iconPlaceholder = <Place sx={{ visibility: 'hidden' }} />;

    return (
        <Popper
            className={classNames('ring-action-box', className)}
            data-testid={dataTestId}
            sx={{
                zIndex,
            }}
            transition={true}
            placement={placement}
            {...otherProps}
            open={open && Boolean(anchorEl.current)}
            anchorEl={anchorEl.current}
        >
            {({ TransitionProps }): React.JSX.Element => (
                <Grow
                    {...TransitionProps}
                    style={{
                        transformOrigin: determineTransformOriginFromPopperPlacement(placement),
                    }}
                >
                    <Paper
                        style={{
                            maxHeight: maxPaperHeight,
                            overflow: hasScroll ? 'auto' : 'hidden',
                        }}
                        sx={sx}
                    >
                        <ClickAwayListener onClickAway={(): void => setOpen(false)}>
                            <MenuList id="split-button-menu" autoFocusItem={true} sx={{ padding: 0 }}>
                                {actions.map((action) => (
                                    <React.Fragment key={action.label}>
                                        {action.hasSeparatorBefore && <Divider />}
                                        <Tooltip
                                            title={action.disabled ? action.disabledReason : ''}
                                            placement={tooltipPlacement}
                                        >
                                            <Box
                                                sx={{
                                                    display: 'block',
                                                    width: '100%',
                                                }}
                                            >
                                                <MenuItem
                                                    onClick={(e): void => {
                                                        e.stopPropagation();

                                                        if (action.onClick) {
                                                            action.onClick(e);
                                                        }

                                                        setOpen(false);
                                                    }}
                                                    disabled={action.disabled || false}
                                                    data-testid={`${dataTestId}-item-${action.label.toLowerCase()}`}
                                                    sx={[
                                                        action.disabled ? { pointerEvents: 'none' } : {},
                                                        ...(Array.isArray(action.sx)
                                                            ? action.sx
                                                            : action.sx
                                                              ? [action.sx]
                                                              : []),
                                                    ]}
                                                >
                                                    <Stack
                                                        direction="row"
                                                        spacing={1}
                                                        sx={{
                                                            justifyContent: 'center',
                                                            alignItems: 'center',
                                                        }}
                                                    >
                                                        <Box
                                                            sx={(theme): { color: string; display: string } => {
                                                                return {
                                                                    display: 'flex',
                                                                    color: theme.palette.action.active,
                                                                };
                                                            }}
                                                        >
                                                            {action.icon || (iconInOneOfActions && iconPlaceholder)}
                                                        </Box>
                                                        <Box>{action.label}</Box>
                                                    </Stack>
                                                </MenuItem>
                                            </Box>
                                        </Tooltip>
                                        {action.hasSeparatorAfter && <Divider />}
                                    </React.Fragment>
                                ))}
                            </MenuList>
                        </ClickAwayListener>
                    </Paper>
                </Grow>
            )}
        </Popper>
    );
}

export function determineTransformOriginFromPopperPlacement(placement: PopperPlacementType | undefined): string {
    switch (placement) {
        case 'bottom-end':
            return 'top right';
        case 'bottom-start':
            return 'top left';
        case 'top-end':
            return 'bottom right';
        case 'top-start':
            return 'bottom left';
        case 'left-end':
            return 'top right';
        case 'left-start':
            return 'top left';
        case 'right-end':
            return 'top left';
        case 'right-start':
            return 'top left';
        default:
            return 'top right';
    }
}
