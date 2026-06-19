import React, { ReactNode, useEffect, useRef } from 'react';
import {
    Box,
    Card,
    CardActions,
    CardActionsProps,
    CardContent,
    CardMedia,
    CardMediaProps,
    CardProps,
    Checkbox,
    CheckboxProps,
    Chip,
    ChipProps,
    IconButton,
    Skeleton,
    Stack,
    SxProps,
    Theme,
    TypographyProps,
} from '@mui/material';
import { BrokenImageOutlined, MoreVert, PhotoOutlined } from '@mui/icons-material';
import { CommonComponentProps } from '../../../helpers/commonTypes.js';
import { Action } from '../../../types.js';
import { ActionBox } from '../../Molecules/ActionBox/ActionBox.js';
import { AspectRatio, AspectRatioOwnerStateProps } from '../../internal/AspectRatio.js';
import { IMAGE_STATUS, useImageLoader } from '../../../helpers/hooks/useImageLoader.js';
import { Typography } from '../../Atoms/Typography/Typography.js';
import { useRingDataTestId } from '../../../helpers/hooks/useRingDataTestId.js';
import { tv } from '../../../helpers/typographyMode.js';

interface MediaCardFieldsItem extends TypographyProps {
    value: string;
}

export interface MediaCardProps extends CommonComponentProps, AspectRatioOwnerStateProps {
    /**
     * Title for the resource card.
     */
    title?: string;
    /**
     * The variant to use.
     * @default 'outlined'
     */
    variant?: 'outlined' | 'elevation';
    /**
     * If `true`, rounded corners are disabled.
     * @default false
     */
    square?: boolean;
    /**
     * Fields describing the card.
     */
    fields?: MediaCardFieldsItem[];
    /**
     * Actions list shown in Action Box
     */
    actions?: Action[];
    /**
     * Icon for the placeholder.
     * @default PhotoOutlined
     */
    iconPlaceholder?: ReactNode;
    /**
     * URL of the image. When not provided, an empty image placeholder is displayed.
     */
    image?: string;
    /**
     * Collection of status labels that are displayed over the image in the left top corner.
     */
    statusLabels?: StatusLabelProps[];

    /**
     * Specifies whether the component is hoverable.
     * @default false
     */
    hoverable?: boolean;
    /**
     * Specifies whether the component is active (visually highlighted).
     * @default false
     */
    active?: boolean;
    /**
     * Callback fired when the component is clicked.
     * @default undefined
     */
    onClick?: () => void | undefined;
    /**
     * HTML tabindex attribute for accessibility.
     */
    tabIndex?: number;
    /**
     * Overridable component slots.
     */
    slots?: {
        /**
         * Custom component to be used in place of the default MediaCard component.
         */
        mediaCard?: ReactNode;
        /**
         * Custom component to be used in place of the default footer.
         */
        footer?: ReactNode;
    };
    /**
     * Props applied to the slots inside the component.
     */
    slotProps?: {
        /**
         * Props applied to the root MUI `<Card>` element. Useful for attaching event
         * handlers (e.g. `onMouseEnter`, `onMouseLeave`, `onFocus`) or extra DOM
         * attributes that are not exposed as top-level MediaCardProps.
         *
         * Top-level MediaCardProps (`variant`, `square`, `onClick`, `tabIndex`,
         * `className`, `sx`) take precedence — they are merged on top, not replaced.
         */
        card?: Omit<CardProps, 'children' | 'variant' | 'square' | 'onClick' | 'tabIndex' | 'elevation'>;
        /**
         * Props applied to the CardMedia component (rendered as `<img>`).
         * The `component` prop is fixed to `"img"` and cannot be overridden here.
         */
        cardMedia?: Omit<CardMediaProps<'img'>, 'component'>;
        /**
         * Props applied to the Checkbox component.
         */
        checkbox?: CheckboxProps & { showOnHover?: boolean };
        /**
         * Props applied to the footer slot.
         */
        footer?: CardActionsProps;
    };
}

export function MediaCard(props: MediaCardProps): React.JSX.Element {
    const {
        title,
        variant = 'outlined',
        square = false,
        className,
        fields,
        actions,
        statusLabels,
        hoverable,
        active,
        onClick,
        sx,
        slots,
        slotProps,
        tabIndex,
        dataTestIdSuffix,
    } = props;

    const dataTestId = useRingDataTestId(MediaCard.name, dataTestIdSuffix);

    const { sx: cardSlotSx, className: cardSlotClassName, ...cardSlotRest } = slotProps?.card ?? {};

    const mergedClassName = [cardSlotClassName, className].filter(Boolean).join(' ') || undefined;

    type SxItem = boolean | Exclude<SxProps<Theme>, ReadonlyArray<unknown>>;
    const internalCardSx: Exclude<SxProps<Theme>, ReadonlyArray<unknown> | ((theme: Theme) => unknown)> = {
        display: 'flex',
        flexDirection: 'column',
        ...(hoverable && {
            transition: 'background-color 0.3s',
            cursor: 'pointer',
            position: 'relative',
            '&:hover': {
                '&::after': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0, 0, 0, 0.1)',
                    pointerEvents: 'none',
                },
            },
        }),
        ...(active && {
            backgroundColor: 'primary.focusVisible',
        }),
    };

    const sxArray: SxItem[] = [
        internalCardSx,
        ...(Array.isArray(cardSlotSx) ? cardSlotSx : cardSlotSx ? [cardSlotSx] : []),
        ...(Array.isArray(sx) ? sx : sx ? [sx] : []),
    ];

    return (
        <Card
            {...cardSlotRest}
            className={mergedClassName}
            variant={variant}
            square={square}
            tabIndex={tabIndex}
            onClick={onClick}
            sx={sxArray}
            data-testid={dataTestId}
        >
            <Box>
                <Box sx={{ position: 'relative' }}>
                    {statusLabels !== undefined && Boolean(statusLabels.length) && (
                        <StatusLabelsStack statusLabels={statusLabels} />
                    )}
                    {props.slotProps?.checkbox !== undefined &&
                        ((): React.JSX.Element => {
                            const { showOnHover, sx, ...checkboxProps } = props.slotProps?.checkbox || {};
                            const inputProps = {
                                'data-testid': `${dataTestId}-checkbox`,
                                ...(checkboxProps.slotProps?.input ?? {}),
                            };

                            return (
                                <Checkbox
                                    {...{
                                        ...checkboxProps,
                                        slotProps: { ...checkboxProps.slotProps, input: inputProps },
                                    }}
                                    sx={{
                                        position: 'absolute',
                                        zIndex: 1,
                                        top: 0,
                                        right: 0,
                                        margin: 1,
                                        backgroundColor: 'secondary.contrast',
                                        '&.Mui-checked': {
                                            backgroundColor: 'primary.selected',
                                        },
                                        '&.Mui-disabled': {
                                            backgroundColor: 'transparent',
                                        },
                                        '.MuiCard-root:hover &': {
                                            display: 'inline-flex',
                                        },
                                        display: showOnHover ? 'none' : 'inline-flex',
                                        ...sx,
                                    }}
                                />
                            );
                        })()}
                    <MediaRenderer {...props} />
                </Box>
                <CardContent sx={{ padding: 1, '&:last-child': { paddingBottom: 1 } }}>
                    <Box
                        sx={{
                            display: 'flex',
                            flexDirection: 'row',
                            justifyContent: 'space-between',
                            alignItems: 'flex-start',
                        }}
                    >
                        <Box
                            sx={{
                                flexGrow: 1,
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                            }}
                        >
                            {title && (
                                <Typography
                                    enableOverflow={true}
                                    color="text.primary"
                                    gutterBottom={true}
                                    variant="body2"
                                >
                                    {title}
                                </Typography>
                            )}
                            {fields?.map((field, index) => {
                                const { value, ...filteredField } = field;

                                return (
                                    <Typography
                                        key={index}
                                        enableOverflow={true}
                                        display="block"
                                        variant="caption"
                                        {...filteredField}
                                    >
                                        {value}
                                    </Typography>
                                );
                            })}
                        </Box>
                        {actions?.length ? (
                            <Box sx={{ flex: '0 0 auto' }}>
                                <Actions actions={actions} dataTestIdSuffix={dataTestIdSuffix} />{' '}
                            </Box>
                        ) : null}
                    </Box>
                </CardContent>
            </Box>
            {slots?.footer &&
                ((): React.JSX.Element => {
                    const { sx, ...otherProps } = slotProps?.footer || {};

                    return (
                        <CardActions
                            sx={{ padding: 1, mt: 'auto', height: (theme) => theme.spacing(4), ...sx }}
                            {...otherProps}
                            data-testid={`${dataTestId}-footer`}
                        >
                            {slots.footer}
                        </CardActions>
                    );
                })()}
        </Card>
    );
}

function Actions(props: { actions: Action[]; dataTestIdSuffix?: string }): React.JSX.Element {
    const { actions, dataTestIdSuffix } = props;
    const ref = useRef<HTMLButtonElement>(null);
    const dataTestId = useRingDataTestId(MediaCard.name, dataTestIdSuffix);

    return (
        <>
            <IconButton
                ref={ref}
                disableRipple={false}
                data-testid={`${dataTestId}-actions`}
                aria-label="More actions"
                onClick={(event): void => {
                    event.stopPropagation();
                }}
            >
                <MoreVert fontSize="small" />
            </IconButton>
            <ActionBox
                actions={actions}
                anchorEl={ref}
                placement="bottom-end"
                tooltipPlacement="right"
                dataTestIdSuffix={dataTestIdSuffix}
            />
        </>
    );
}

function MediaRenderer(props: MediaCardProps): React.JSX.Element {
    const { image, ratio, objectFit, iconPlaceholder = <PhotoOutlined />, slots, slotProps } = props;

    if (slots?.mediaCard) {
        return (
            <AspectRatio ratio={ratio} objectFit={objectFit}>
                {slots.mediaCard}
            </AspectRatio>
        );
    }

    if (slotProps?.cardMedia) {
        return (
            <AspectRatio ratio={ratio} objectFit={objectFit}>
                <CardMedia
                    component="img"
                    draggable={false}
                    src={image}
                    alt={props.title || ''}
                    {...slotProps.cardMedia}
                />
            </AspectRatio>
        );
    }

    if (image) {
        return <ImageCard image={image} ratio={ratio} objectFit={objectFit} title={props.title} />;
    }

    return <PlaceholderCard ratio={ratio} objectFit={objectFit} iconPlaceholder={iconPlaceholder} />;
}

interface IconRendererProps extends CommonComponentProps {
    icon: ReactNode;
}

const IconRenderer: React.FC<IconRendererProps> = ({ icon, sx }) => {
    const iconWithSx = React.isValidElement(icon)
        ? React.cloneElement(icon, { sx } as unknown as Record<string, string>)
        : icon;

    return <>{iconWithSx}</>;
};

function StatusLabelsStack(params: { statusLabels: StatusLabelProps[] }): React.JSX.Element {
    const { statusLabels } = params;

    return (
        <Stack
            direction="column"
            sx={{
                position: 'absolute',
                width: '100%',
                maxHeight: '60%',
                top: 0,
                left: 0,
                zIndex: 1,
            }}
        >
            {statusLabels.map((statusLabelParams, index): React.JSX.Element => {
                const { key, ...restProps } = statusLabelParams;

                return <StatusLabel key={key || index} {...restProps} />;
            })}
        </Stack>
    );
}

type StatusLabelProps = Pick<ChipProps, 'label' | 'color' | 'icon'> & {
    /**
     * Unique key for the label.
     */
    key?: string | number;
    /**
     * If `true`, the label is shown on hover.
     * @default false
     */
    showOnHover?: boolean;
    /**
     * Tooltip text for the label.
     */
    tip?: string;
    sx?: SxProps;
};

function StatusLabel(params: StatusLabelProps): React.JSX.Element {
    const { label, color = 'error', icon, showOnHover = false, tip = '', sx = {} } = params;

    return (
        <Chip
            label={label}
            title={tip || (label as string)}
            color={color}
            size="small"
            sx={{
                borderRadius: 1,
                // MUI v6 compatibility: using fixed px values instead of theme.spacing(0.25)
                marginTop: '2px',
                marginLeft: '2px',
                width: 'fit-content',
                maxWidth: '40%',
                maxHeight: 16,
                fontSize: tv('0.75rem'),
                '.MuiCard-root:hover &': {
                    transform: 'translateX(0)',
                    paddingRight: '0px',
                    transition: 'padding-right 0s ease 0s, transform 0.2s ease 0s',
                },
                transform: showOnHover ? 'translateX(-95%)' : 'translateX(0)',
                paddingRight: showOnHover ? '60%' : '0%',
                transition: 'padding-right 0s ease 0s, transform 0s ease 0s',
                ...sx,
            }}
            icon={icon}
        />
    );
}

interface MediaImageProps extends AspectRatioOwnerStateProps {
    image: string;
    title?: string;
}

function ImageCard({ image, ratio, objectFit, title }: MediaImageProps): React.JSX.Element {
    const { status, handleLoad, handleError, resetStatus } = useImageLoader();

    const imageRef = useRef<HTMLImageElement>(null);

    useEffect(() => {
        if (image) {
            resetStatus();
        }
    }, [image, resetStatus]);

    useEffect(() => {
        if (!image) {
            return;
        }

        const img = imageRef.current;

        if (img?.complete) {
            handleLoad();
        }
    }, [image, handleLoad]);

    return (
        <>
            {status === IMAGE_STATUS.LOADING && (
                <Skeleton
                    variant="rectangular"
                    width="100%"
                    height="100%"
                    animation="wave"
                    sx={{ position: 'absolute', top: 0, left: 0, zIndex: 1 }}
                />
            )}

            <AspectRatio ratio={ratio} objectFit={objectFit}>
                {status !== IMAGE_STATUS.ERROR ? (
                    <CardMedia
                        ref={imageRef}
                        component="img"
                        src={image}
                        alt={title || ''}
                        draggable={false}
                        onLoad={handleLoad}
                        onError={handleError}
                        loading="lazy"
                        sx={{
                            opacity: status === IMAGE_STATUS.LOADED ? 1 : 0,
                            transition: 'opacity 0.3s',
                            height: '100%',
                            width: '100%',
                        }}
                    />
                ) : (
                    <PlaceholderCard ratio={ratio} objectFit={objectFit} iconPlaceholder={<BrokenImageOutlined />} />
                )}
            </AspectRatio>
        </>
    );
}

interface PlaceholderCardProps extends AspectRatioOwnerStateProps {
    iconPlaceholder?: ReactNode;
}

function PlaceholderCard({ ratio, objectFit, iconPlaceholder }: PlaceholderCardProps): React.JSX.Element {
    return (
        <AspectRatio ratio={ratio} objectFit={objectFit}>
            <div>
                <IconRenderer
                    icon={iconPlaceholder}
                    sx={(theme): { fontSize: string; color: string } => ({
                        fontSize: tv('4rem')(theme),
                        color: theme.palette.action.active,
                    })}
                />
            </div>
        </AspectRatio>
    );
}
