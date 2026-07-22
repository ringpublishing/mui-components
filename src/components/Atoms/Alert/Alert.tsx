import { Close } from '@mui/icons-material';
import {
    Alert as MuiAlert,
    AlertProps as MuiAlertProps,
    Box,
    Button,
    ButtonProps,
    IconButton,
    Stack,
    SxProps,
    Typography,
} from '@mui/material';
import { type Theme } from '@mui/material/styles';
import classNames from 'classnames';
import React from 'react';

import { CommonComponentProps } from '../../../helpers/commonTypes.js';
import { useRingDataTestId } from '../../../helpers/hooks/useRingDataTestId.js';

type AlertButtonProps = Omit<ButtonProps, 'children' | 'variant' | 'color' | 'size' | 'onClick' | 'href'> & {
    target?: React.AnchorHTMLAttributes<HTMLAnchorElement>['target'];
    rel?: React.AnchorHTMLAttributes<HTMLAnchorElement>['rel'];
};

type AlertActionBase = {
    label: string;
    buttonProps?: AlertButtonProps;
};

type AlertButtonAction = AlertActionBase & {
    onClick: React.MouseEventHandler<HTMLButtonElement>;
    href?: never;
};

type AlertLinkAction = AlertActionBase & {
    href: string;
    onClick?: never;
};

type AlertAction = AlertButtonAction | AlertLinkAction;

type AlertContentProps = {
    /** Main alert title shown above the description. */
    title?: React.ReactNode;
    /** Optional supporting text shown below the title. */
    description?: React.ReactNode;
};

type MuiAlertBaseProps = Omit<MuiAlertProps, 'action' | 'children' | 'color' | 'onClose' | 'title' | 'variant'>;

export interface AlertProps extends Omit<CommonComponentProps, 'children'>, MuiAlertBaseProps, AlertContentProps {
    /** Button rendered alongside the alert content. Use `onClick` for actions or `href` for navigation. */
    action?: AlertAction;
    /** Where to place the action button relative to the message. */
    actionsPlacement?: 'right' | 'bottom';
    /** Visual treatment of the alert frame. */
    layoutVariant?: 'outline' | 'inline';
    /** Fired when the close button is clicked. */
    onClose?: (event: React.SyntheticEvent) => void;
}

function getAlertBaseSx(theme: Theme, severity: NonNullable<AlertProps['severity']>): SxProps<Theme> {
    return {
        width: '100%',
        alignItems: 'flex-start',
        backgroundColor: theme.palette.components?.alert?.[severity]?.background ?? theme.palette.background.default,
        '& .MuiAlert-message': {
            width: '100%',
        },
    };
}

function getInlineLayoutSx(): SxProps<Theme> {
    return {
        borderRadius: 0,
        borderLeftWidth: 0,
        borderRightWidth: 0,
    };
}

export const Alert = React.forwardRef<HTMLDivElement, AlertProps>((props, ref) => {
    const {
        action,
        actionsPlacement = 'right',
        className,
        closeText = 'Close',
        dataTestIdSuffix,
        description,
        icon,
        layoutVariant = 'outline',
        onClose,
        severity = 'info',
        sx,
        title,
        ...otherProps
    } = props;

    const dataTestId = useRingDataTestId('Alert', dataTestIdSuffix);

    const renderCloseButton = (): React.JSX.Element | null => {
        if (!onClose) {
            return null;
        }

        return (
            <IconButton
                aria-label={closeText}
                color="inherit"
                data-testid={`${dataTestId}-close`}
                onClick={onClose}
                size="small"
                sx={{ alignSelf: 'flex-start' }}
            >
                <Close fontSize="small" />
            </IconButton>
        );
    };

    const renderActionButton = (): React.JSX.Element | null => {
        if (!action) {
            return null;
        }

        const { buttonProps, label } = action;
        const href = 'href' in action ? action.href : undefined;
        const onClick = 'onClick' in action ? action.onClick : undefined;
        const buttonSx = buttonProps
            ? Array.isArray(buttonProps.sx)
                ? buttonProps.sx
                : buttonProps.sx
                  ? [buttonProps.sx]
                  : []
            : [];

        return (
            <Button
                {...buttonProps}
                color="inherit"
                data-testid={`${dataTestId}-action`}
                href={href}
                onClick={onClick}
                size="small"
                sx={[{ textTransform: 'none' }, ...buttonSx]}
                type={href ? undefined : (buttonProps?.type ?? 'button')}
                variant="outlined"
            >
                {label}
            </Button>
        );
    };

    const renderText = (): React.JSX.Element => {
        const hasTitle = Boolean(title);
        const hasDescription = Boolean(description);
        const isInline = layoutVariant === 'inline';

        return (
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: isInline ? 'row' : 'column',
                    alignItems: isInline ? 'center' : 'flex-start',
                    gap: hasTitle && hasDescription ? (isInline ? 1 : 0.5) : 0,
                    minWidth: 0,
                }}
            >
                {hasTitle && (
                    <Typography
                        component="div"
                        variant="subtitle1"
                        sx={{ flexShrink: 0, fontWeight: 600, lineHeight: 1.25 }}
                    >
                        {title}
                    </Typography>
                )}
                {hasDescription && (
                    <Typography component="div" variant="body2" sx={isInline ? { minWidth: 0 } : undefined}>
                        {description}
                    </Typography>
                )}
            </Box>
        );
    };

    const renderRightActions = (): React.JSX.Element | null => {
        const actionButton = renderActionButton();
        const closeButton = renderCloseButton();

        if (!actionButton && !closeButton) {
            return null;
        }

        return (
            <Stack direction="row" spacing={1} alignItems="flex-start" sx={{ flexShrink: 0 }}>
                {actionButton}
                {closeButton}
            </Stack>
        );
    };

    const renderBottomActions = (): React.JSX.Element | null => {
        const actionButton = renderActionButton();

        if (!actionButton) {
            return null;
        }

        return <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>{actionButton}</Box>;
    };

    const renderContent = (): React.JSX.Element => {
        if (actionsPlacement === 'bottom') {
            return (
                <Stack spacing={1} sx={{ width: '100%' }}>
                    <Box
                        sx={{
                            display: 'flex',
                            alignItems: 'flex-start',
                            justifyContent: 'space-between',
                            gap: 2,
                            width: '100%',
                        }}
                    >
                        {renderText()}
                        {renderCloseButton()}
                    </Box>
                    {renderBottomActions()}
                </Stack>
            );
        }

        return (
            <Box
                sx={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    justifyContent: 'space-between',
                    gap: 2,
                    width: '100%',
                }}
            >
                {renderText()}
                {renderRightActions()}
            </Box>
        );
    };

    return (
        <MuiAlert
            ref={ref}
            className={classNames('ring-alert', className)}
            data-testid={dataTestId}
            icon={icon}
            severity={severity}
            variant="outlined"
            sx={[
                (theme: Theme): SxProps<Theme> => getAlertBaseSx(theme, severity),
                ...(layoutVariant === 'inline' ? [getInlineLayoutSx()] : []),
                ...(Array.isArray(sx) ? sx : sx ? [sx] : []),
            ]}
            {...otherProps}
        >
            {renderContent()}
        </MuiAlert>
    );
});

Alert.displayName = 'Alert';
