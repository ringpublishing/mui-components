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
    alpha,
} from '@mui/material';
import { ImageOff, EllipsisVertical, Image } from 'lucide-react';
import { CommonComponentProps } from '../../../helpers/commonTypes.js';
import { WithItemDataTestId, resolveRootDataTestId } from '../../../helpers/dataTestId.js';
import { Action } from '../../../types.js';
import { ActionBox } from '../../Molecules/ActionBox/ActionBox.js';
import { AspectRatio, AspectRatioOwnerStateProps } from '../../internal/AspectRatio.js';
import { FeaturedIcon } from '../../Atoms/FeaturedIcon/FeaturedIcon.js';
import { IMAGE_STATUS, useImageLoader } from '../../../helpers/hooks/useImageLoader.js';
import { Typography, OverflowTypographyProps } from '../../Atoms/Typography/Typography.js';
import { Tooltip } from '../../Atoms/Tooltip/Tooltip.js';
import { useRingDataTestId } from '../../../helpers/hooks/useRingDataTestId.js';
import { getLucideSizeFromFontSize } from '../../../helpers/lucideSize.js';
import { resolveMoreActionsAriaLabel } from '../../../helpers/moreActionsAriaLabel.js';
import { tv } from '../../../helpers/typographyMode.js';

export interface MediaCardFieldsItem extends OverflowTypographyProps {
    value: string;
}

export interface MediaCardProps extends CommonComponentProps, AspectRatioOwnerStateProps, WithItemDataTestId {
    /**
     * Title for the resource card.
     */
    title?: string;
    /**
     * Always show the title tooltip on hover, regardless of whether the title overflows.
     * @default false
     */
    alwaysShowTitleTooltip?: boolean;
    /**
     * Custom tooltip content for the title. When omitted, the title text is shown (on overflow).
     */
    titleTooltip?: React.ReactNode;
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
     * Accessible name of the icon button that opens the `actions` menu. A blank value counts as not provided.
     * @default 'More actions'
     */
    actionsAriaLabel?: string;
    /**
     * Icon for the placeholder.
     * @default Image
     */
    iconPlaceholder?: ReactNode;
    /**
     * URL of the image. When omitted, the frame shows `iconPlaceholder` on a `FeaturedIcon` plate.
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
         * Props applied to the root MUI `<Card>`, e.g. event handlers or extra DOM attributes.
         * Top-level MediaCardProps (`variant`, `square`, `onClick`, `tabIndex`, `className`, `sx`)
         * are merged on top of them.
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
        alwaysShowTitleTooltip,
        titleTooltip,
        variant = 'outlined',
        square = false,
        className,
        fields,
        actions,
        actionsAriaLabel,
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

    const generatedDataTestId = useRingDataTestId('MediaCard', dataTestIdSuffix);
    const dataTestId = resolveRootDataTestId(props, generatedDataTestId);

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
                    // Hover is a state, so it is computed rather than written. `action.active`
                    // supplies the ink and flips polarity with the mode — dark on light, light
                    // on dark — while the opacity comes from the selected rung rather than the
                    // hover one: this scrim covers an arbitrary photograph, not a surface whose
                    // colour the system already knows, so the hover rung reads as no change.
                    backgroundColor: (t: Theme): string =>
                        alpha(t.palette.action.active, t.palette.action.selectedOpacity),
                    pointerEvents: 'none',
                },
            },
        }),
        ...(active && {
            // The selected tint is computed from `primary.main` and `action.selectedOpacity`, so it
            // follows the palette in both colour modes.
            backgroundColor: (t: Theme): string => alpha(t.palette.primary.main, t.palette.action.selectedOpacity),
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
                                    color="overlay"
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
                                        // The plate is withdrawn while disabled; the variant owns
                                        // every other surface this control paints.
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
                    <MediaRenderer {...props} placeholderDataTestId={`${dataTestId}-placeholder-icon`} />
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
                                    alwaysShowTooltip={alwaysShowTitleTooltip}
                                    tooltipTitle={titleTooltip}
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
                                <Actions actions={actions} ariaLabel={actionsAriaLabel} dataTestId={dataTestId} />{' '}
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

function Actions(props: { actions: Action[]; ariaLabel?: string; dataTestId: string }): React.JSX.Element {
    const { actions, ariaLabel, dataTestId } = props;
    const ref = useRef<HTMLButtonElement>(null);

    return (
        <>
            <IconButton
                ref={ref}
                disableRipple={false}
                data-testid={`${dataTestId}-actions`}
                aria-label={resolveMoreActionsAriaLabel(ariaLabel)}
                onClick={(event): void => {
                    event.stopPropagation();
                }}
            >
                <EllipsisVertical size={getLucideSizeFromFontSize('small')} />
            </IconButton>
            <ActionBox
                actions={actions}
                anchorEl={ref}
                placement="bottom-end"
                tooltipPlacement="right"
                dataTestId={`${dataTestId}-menu`}
            />
        </>
    );
}

function MediaRenderer(props: MediaCardProps & { placeholderDataTestId: string }): React.JSX.Element {
    const { image, ratio, objectFit, iconPlaceholder = <Image />, slots, slotProps, placeholderDataTestId } = props;

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
        return (
            <ImageCard
                image={image}
                ratio={ratio}
                objectFit={objectFit}
                title={props.title}
                placeholderDataTestId={placeholderDataTestId}
            />
        );
    }

    return (
        <PlaceholderCard
            ratio={ratio}
            objectFit={objectFit}
            iconPlaceholder={iconPlaceholder}
            dataTestId={placeholderDataTestId}
        />
    );
}

interface IconRendererProps extends CommonComponentProps {
    icon: ReactNode;
}

const IconRenderer: React.FC<IconRendererProps> = ({ icon, sx }) => {
    return (
        <Box
            sx={[
                {
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    lineHeight: 0,
                    flexShrink: 0,
                    '& > *': {
                        fontSize: 'inherit !important',
                    },
                    '& svg': {
                        width: '1em',
                        height: '1em',
                        flexShrink: 0,
                        stroke: 'currentColor',
                    },
                },
                ...(Array.isArray(sx) ? sx : sx ? [sx] : []),
            ]}
        >
            {icon}
        </Box>
    );
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
     * Tooltip for the label, shown on hover with the arrow. Without it the label's own text
     * is the native title, so a truncated label can still be read.
     */
    tip?: string;
    sx?: SxProps;
};

// A status label is a label, not a control, so it renders as the chip's tag variant. `primary`, `secondary` and
// `default` have no tag colour and map to the grey `stone` tag, so every label is an opaque plate.
const STATUS_LABEL_TAG_COLOR: Partial<Record<NonNullable<ChipProps['color']>, ChipProps['color']>> = {
    primary: 'stone',
    secondary: 'stone',
    default: 'stone',
};

function StatusLabel(params: StatusLabelProps): React.JSX.Element {
    const { label, color = 'error', icon, showOnHover = false, tip = '', sx = {} } = params;

    const chip = (
        <Chip
            label={label}
            title={tip ? undefined : (label as string)}
            variant="tag"
            color={STATUS_LABEL_TAG_COLOR[color] ?? color}
            size="small"
            sx={{
                // The gap from the frame's edge and between labels: the scale's smallest step.
                marginTop: (theme: Theme): string => theme.getSpacing(0.5),
                marginLeft: (theme: Theme): string => theme.getSpacing(0.5),
                width: 'fit-content',
                maxWidth: '40%',
                // The card's label is 16px tall, below the tag's own 24px; the icon follows
                // the text size so it keeps a 2px margin inside the plate.
                maxHeight: 16,
                fontSize: tv('0.75rem'),
                '& .MuiChip-icon': {
                    fontSize: tv('0.75rem'),
                    flexShrink: 0,
                    // A 1px stroke on this 12px glyph, where the design system's 1.5px would be an
                    // eighth of the icon. It is set on the svg itself, because lucide writes
                    // `stroke-width` as an attribute, and pinned to the pixel with `vector-effect`.
                    '&, & svg': { strokeWidth: 1 },
                    '& *': { vectorEffect: 'non-scaling-stroke' },
                },
                // A label shown on hover parks behind the frame's edge: its own width back
                // leaves the margin's worth of plate showing — the chip's right inset, so no
                // text peeks — and it slides in when the card is hovered.
                ...(showOnHover
                    ? {
                          transform: 'translateX(-100%)',
                          transition: 'transform 0.2s ease',
                          '.MuiCard-root:hover &': { transform: 'translateX(0)' },
                      }
                    : {}),
                ...sx,
            }}
            icon={icon}
        />
    );

    return tip ? (
        <Tooltip title={tip} arrow={true}>
            {chip}
        </Tooltip>
    ) : (
        chip
    );
}

interface MediaImageProps extends AspectRatioOwnerStateProps {
    image: string;
    title?: string;
    placeholderDataTestId: string;
}

function ImageCard({ image, ratio, objectFit, title, placeholderDataTestId }: MediaImageProps): React.JSX.Element {
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
                    <PlaceholderCard
                        ratio={ratio}
                        objectFit={objectFit}
                        iconPlaceholder={<ImageOff />}
                        dataTestId={placeholderDataTestId}
                    />
                )}
            </AspectRatio>
        </>
    );
}

interface PlaceholderCardProps extends AspectRatioOwnerStateProps {
    iconPlaceholder?: ReactNode;
    dataTestId: string;
}

function PlaceholderCard({ ratio, objectFit, iconPlaceholder, dataTestId }: PlaceholderCardProps): React.JSX.Element {
    return (
        <AspectRatio ratio={ratio} objectFit={objectFit}>
            <div>
                {/* `null` or `false` leaves the frame empty; only `undefined` gets the default glyph. */}
                {iconPlaceholder ? (
                    <FeaturedIcon
                        size="inherit"
                        icon={<IconRenderer icon={iconPlaceholder} sx={{ fontSize: 'inherit' }} />}
                        dataTestId={dataTestId}
                    />
                ) : null}
            </div>
        </AspectRatio>
    );
}
