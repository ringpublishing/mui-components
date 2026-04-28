import React, { useEffect, useState, useCallback } from 'react';
import {
    Typography,
    Box,
    IconButton,
    CardContent,
    CardActions,
    Card,
    Button,
    CardMedia,
    Tooltip,
    TooltipProps,
} from '@mui/material';
import { Close } from '@mui/icons-material';
import { Action } from '../../../types.js';
import dayjs from 'dayjs';
import { useRingDataTestId } from '../../../helpers/hooks/useRingDataTestId.js';
import { CommonComponentProps } from '../../../helpers/commonTypes.js';

export interface FeatureTooltipAction extends Action {
    href?: string;
}

type ActionsType = [FeatureTooltipAction, FeatureTooltipAction] | [FeatureTooltipAction] | [] | undefined;

type FeatureTooltipPropsBase = Omit<TooltipProps, 'title' | 'arrow' | 'open'> &
    Pick<CommonComponentProps, 'dataTestIdSuffix'>;

export interface FeatureTooltipProps extends FeatureTooltipPropsBase {
    /**
     * Feature tooltip title
     */
    title: string;
    /**
     * Feature tooltip message
     * Not required if videoEmbed was passed
     */
    message: string;
    /**
     * Delay before showing tooltip in ms
     * @default 0
     */
    showDelay?: number;
    /**
     * After that date tooltip will not be shown
     * ISO date string
     */
    endDate: string;
    /**
     * Offset for tooltip
     * [x-offset, y-offset]
     */
    offset?: [number, number];
    /**
     * Actions for tooltip button
     * [Default action, Secondary action]
     */
    actions?: ActionsType;
    /**
     * Function called when showing tooltip
     */
    onShow?: () => void;
    /**
     * Function called when hiding tooltip by clicking 'X'
     */
    onClose?: () => void;
    /**
     * Unique id for tooltip
     * It is important when you want to show more than one tooltip in your app at the same time
     */
    id: string;
    /**
     * How many times tooltip can be shown
     * @default 1
     */
    capping?: number;
    /**
     * URL to video embed, while passing yt link ensure that URL contains '/embed/'
     * Not required if message was passed
     */
    videoEmbed?: string;
    /**
     * URL to image
     * Not required if message was passed. Won't be shown if videoEmbed was passed
     */
    image?: string;
}

type LocalStorageTooltip = {
    endDate: string;
    id: string;
    shown: number;
};

export function FeatureTooltip(props: FeatureTooltipProps): React.JSX.Element {
    const {
        title,
        showDelay = 0,
        endDate,
        offset,
        onShow,
        onClose,
        capping = 1,
        children,
        id,
        dataTestIdSuffix,
        ...otherProps
    } = props;
    const dataTestId = useRingDataTestId(FeatureTooltip.name, dataTestIdSuffix);

    const [isOpen, setIsOpen] = useState(false);
    const [currentFeatureTooltip, setCurrentFeatureTooltip] = useState<LocalStorageTooltip>({ endDate, id, shown: 0 });
    const [isReady, setIsReady] = useState(false);
    const actions = processFeatureTooltipActions(props.actions);

    const getLocalStorageTooltips = (): [] | null => {
        const localStorageValue = localStorage.getItem('FeatureTooltips');

        if (localStorageValue) {
            try {
                return JSON.parse(localStorageValue);
            } catch (error) {
                console.warn(error);

                return [];
            }
        }

        return [];
    };

    const isTooltipExpired = (expirationDate: string): boolean => {
        const expDate = dayjs(expirationDate);
        const currentDate = dayjs();

        return expDate.diff(currentDate) <= 0;
    };

    const closeButtonAction = (): void => {
        if (onClose) {
            onClose();
        }

        setIsOpen(false);
        setLocalStorageTooltips();
    };

    const isCappingReached = useCallback(
        (tooltipCapping: number): boolean => {
            return tooltipCapping >= capping;
        },
        [capping],
    );

    useEffect((): void => {
        const localStorageTooltips = getLocalStorageTooltips();

        if (localStorageTooltips) {
            const result = localStorageTooltips.find((tooltip: LocalStorageTooltip): boolean => tooltip.id === id);

            if (result) {
                setCurrentFeatureTooltip(result);
            }
        }

        setIsReady(true);
    }, [id]);

    useEffect((): void => {
        if (isReady) {
            if (!isTooltipExpired(currentFeatureTooltip.endDate) && !isCappingReached(currentFeatureTooltip.shown)) {
                setTimeout(() => {
                    setIsOpen(true);

                    if (onShow) {
                        onShow();
                    }
                }, showDelay);
                setCurrentFeatureTooltip({ ...currentFeatureTooltip, shown: currentFeatureTooltip.shown + 1 });
            }
        }
    }, [isReady]);

    const prepareDataToLocalStorage = (): LocalStorageTooltip[] => {
        const localStorageTooltips = getLocalStorageTooltips();

        if (localStorageTooltips) {
            const storageWithoutExpiredTooltips = localStorageTooltips.filter((tooltip: LocalStorageTooltip) => {
                const tooltipData = tooltip;

                return !isTooltipExpired(tooltipData.endDate);
            });

            const storageWithoutCurrentItem =
                storageWithoutExpiredTooltips.filter(
                    (tooltip: LocalStorageTooltip) => tooltip.id !== currentFeatureTooltip.id,
                ) || [];

            return [...storageWithoutCurrentItem, currentFeatureTooltip];
        } else {
            return [currentFeatureTooltip];
        }
    };

    const setLocalStorageTooltips = (): void => {
        try {
            localStorage.setItem('FeatureTooltips', JSON.stringify(prepareDataToLocalStorage()));
        } catch (error) {
            console.warn(error);
        }
    };

    const onClickAction = (withSave = false, action: Action, event: React.MouseEvent<Element, MouseEvent>): void => {
        if (withSave) {
            setLocalStorageTooltips();
        }

        setIsOpen(false);

        if (action.onClick) {
            action.onClick(event);
        }
    };

    const renderActions = (): React.JSX.Element | undefined => {
        if (!actions || actions.length === 0) {
            return;
        }

        return (
            <CardActions
                sx={{
                    justifyContent: 'end',
                    paddingRight: 2,
                    paddingBottom: 2,
                }}
            >
                {actions.length === 2 && (
                    <Button
                        data-testid={`${dataTestId}-button-secondary`}
                        size="small"
                        color="contrast"
                        {...actions[1]}
                        {...(actions[1].href ? { target: '_blank' } : {})}
                        onClick={(event): void => onClickAction(true, actions[1], event)}
                        sx={{ boxShadow: 'none' }}
                    >
                        {actions[1]?.icon} {actions[1].label}
                    </Button>
                )}

                <Button
                    data-testid={`${dataTestId}-button-primary`}
                    {...actions[0]}
                    {...(actions[0].href ? { target: '_blank' } : {})}
                    size="small"
                    variant="contained"
                    color="contrast"
                    onClick={(event): void => onClickAction(true, actions[0], event)}
                    sx={{ boxShadow: 'none' }}
                >
                    {actions[0]?.icon} {actions[0].label}
                </Button>
            </CardActions>
        );
    };

    return (
        <Tooltip
            {...otherProps}
            arrow={true}
            open={isOpen}
            {...(offset
                ? {
                      slotProps: {
                          popper: {
                              modifiers: [
                                  {
                                      name: 'offset',
                                      options: {
                                          offset,
                                      },
                                  },
                              ],
                          },
                      },
                  }
                : {})}
            componentsProps={{
                tooltip: {
                    sx: {
                        backgroundColor: (theme) => theme.palette.primary.main,
                        minWidth: props?.videoEmbed || props?.image ? '480px' : '320px',
                        minHeight: props?.videoEmbed ? (actions && actions?.length > 0 ? '410px' : '350px') : '144px',
                        padding: 0,
                        '& .MuiTooltip-arrow': {
                            color: (theme) => theme.palette.primary.main,
                            fontSize: 'large',
                        },
                    },
                },
            }}
            title={
                <Card
                    variant="outlined"
                    sx={{
                        backgroundColor: 'transparent',
                        border: 'none',
                    }}
                >
                    <CardContent>
                        <Box
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                            }}
                            mb={1}
                        >
                            <Typography
                                component="span"
                                variant="subtitle2"
                                sx={{ color: (theme) => theme.palette.contrast.main }}
                            >
                                {title}
                            </Typography>
                            <IconButton
                                data-testid={`${dataTestId}-close`}
                                color="contrast"
                                onClick={closeButtonAction}
                            >
                                <Close />
                            </IconButton>
                        </Box>
                        {props?.message && (
                            <Typography
                                component="div"
                                variant="caption"
                                sx={{ paddingBottom: 1, color: (theme) => theme.palette.contrast.main }}
                            >
                                {props?.message}
                            </Typography>
                        )}
                        {props?.videoEmbed && (
                            <CardMedia
                                sx={{ width: '448px', height: '268px', border: 'none', boxShadow: 'none' }}
                                component="iframe"
                                src={props?.videoEmbed}
                            />
                        )}
                        {props?.image && !props.videoEmbed && (
                            <CardMedia
                                sx={{ maxWidth: '448px', height: 'auto', objectFit: 'contain' }}
                                image={props?.image}
                                component="img"
                                alt="Tooltip image"
                            />
                        )}
                    </CardContent>
                    {renderActions()}
                </Card>
            }
        >
            {children}
        </Tooltip>
    );
}

const processFeatureTooltipActions = (actions: ActionsType): ActionsType => {
    return actions?.map((action, index) => {
        if (index <= 1 && action.href) {
            return {
                ...action,
                href: addUtmParamsToUrl(action.href),
            };
        }

        return action;
    }) as ActionsType;
};

const addUtmParamsToUrl = (url: string): string => {
    if (!url.startsWith('http')) {
        url = `https://${url}`;
    }

    try {
        const urlObj = new URL(url);
        const searchParams = urlObj.searchParams;

        if (!searchParams.get('utm_source') && !searchParams.get('utm_medium')) {
            urlObj.searchParams.set('utm_source', 'inapp');
            urlObj.searchParams.set('utm_medium', 'bubble');
            url = urlObj.toString();
        }
    } catch (e) {
        console.warn(e);
    }

    return url;
};
