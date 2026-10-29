import React, { ReactNode, useCallback, useEffect, useRef, useState } from 'react';
import {
    Box,
    Card,
    CardMedia,
    CardMediaProps,
    CardProps,
    Chip,
    ChipProps,
    IconButton,
    Stack,
    SxProps,
    Theme,
    Tooltip,
    Typography,
} from '@mui/material';
import { decomposeColor, getContrastRatio } from '@mui/material/styles';

import { FileMusic, Image, ImageOff, EllipsisVertical, Film, VideoOff, type LucideIcon } from 'lucide-react';

import { CommonComponentProps, WithDataTestIdSuffix } from '../../../helpers/commonTypes.js';
import { RingLucideIcon, resolvePaletteColor } from '../../../helpers/RingLucideIcon.js';
import { Action, Image as MediaImage } from '../../../types.js';
import { EditableText } from '../../Atoms/EditableText/EditableText.js';
import { resolveMoreActionsAriaLabel } from '../../../helpers/moreActionsAriaLabel.js';
import { isImage } from '../../../helpers/types.js';
import { LightBox } from '../../Organisms/LightBox/LightBox.js';
import { ActionBox } from '../../Molecules/ActionBox/ActionBox.js';
import { AspectRatio, AspectRatioOwnerStateProps } from '../../internal/AspectRatio.js';
import { FeaturedIcon } from '../../Atoms/FeaturedIcon/FeaturedIcon.js';
import { useRingDataTestId } from '../../../helpers/hooks/useRingDataTestId.js';

export interface MediaProps extends CommonComponentProps, AspectRatioOwnerStateProps {
    /**
     * Image URL, or an `Image` object with `src`, `thumbnailSrc` and `title`; when omitted, the frame shows an image
     * glyph on a `FeaturedIcon` plate. The alt text is `image.title`, then `title`, else empty (decorative).
     */
    image?: string | MediaImage;

    /**
     * Image title displayed in the bottom left corner. Also the image's alt text when `image`
     * carries no `title` of its own.
     */
    title?: string;

    /**
     * Description text displayed below the title.
     */
    description?: string;

    /**
     * Callback invoked when the title is submitted in edit mode.
     * When provided, the title becomes editable via EditableText.
     */
    onTitleSubmit?: (value: string) => Promise<boolean>;

    /**
     * Placeholder shown for the editable title when it is empty.
     * @default 'Enter title'
     */
    titlePlaceholder?: string;

    /**
     * Callback invoked when the description is submitted in edit mode.
     * When provided, the description becomes editable via EditableText.
     */
    onDescriptionSubmit?: (value: string) => Promise<boolean>;

    /**
     * Placeholder shown for the editable description when it is empty.
     * @default 'Enter description'
     */
    descriptionPlaceholder?: string;

    /**
     * Image type title displayed in the top left corner.
     */
    type?: string;

    /**
     * Collection of actions that can be triggered via action box. When no actions are provided, the context menu is not displayed.
     */
    actions?: Action[];

    /**
     * Accessible name of the icon button that opens the `actions` menu. A blank value counts as not provided.
     * @default 'More actions'
     */
    actionsAriaLabel?: string;

    /**
     * Collection of status labels that are displayed over the image in the left top corner.
     */
    statusLabels?: StatusLabelProps[];

    /**
     * Collection of tooltips that are displayed over the image in the bottom left corner.
     */
    bottomTooltips?: MediaBottomTooltipProps[];

    /**
     * Disables the full screen preview that opens when the image is clicked; the preview needs `image`. While it is
     * enabled, a still image is also a button that takes focus with `Tab` and opens it on `Enter` / `Space`.
     * @default false
     */
    disableFullScreenPreview?: boolean;

    /**
     * Accessible name of the image while it opens the full-screen preview. It replaces the alt
     * text as the name screen readers announce, so pass one naming the image when several `Media`
     * share a page.
     * @default 'Open full-screen preview'
     */
    fullScreenPreviewAriaLabel?: string;

    /**
     * Overridable component slots. `media` accepts any ReactNode and replaces the default
     * `<CardMedia>` (e.g. for a custom video player or interactive preview component).
     */
    slots?: MediaSlots;
    /**
     * The props used for each component slot.
     * @default {}
     */
    slotProps?: MediaSlotProps;

    /**
     * Height of the media area, as any CSS length; the caption renders below it and `objectFit` is
     * unchanged. When omitted, the height follows the container width and `ratio`.
     */
    height?: React.CSSProperties['height'];
}

export interface MediaSlotPropsBackgroundColor {
    backgroundColor: string;
}

export type MediaSlotMediaProps = CardMediaProps &
    React.AudioHTMLAttributes<HTMLAudioElement> &
    React.VideoHTMLAttributes<HTMLVideoElement> & {
        sx?: MediaSlotPropsBackgroundColor;
    };

export interface MediaSlots {
    /**
     * Custom node rendered in place of the default `<CardMedia>`, inside the `<AspectRatio>` box so
     * `ratio` and `objectFit` still apply. The built-in `<LightBox>` preview is disabled for it;
     * render your own viewer via `slotProps.card` event handlers.
     */
    media?: ReactNode;
}

export interface MediaSlotProps {
    /**
     * Props of the media element; an `onLoad` or `onError` runs alongside the component's own. A failing source shows
     * the placeholder unless your `onError` calls `event.preventDefault()`, which keeps the element for a fallback.
     */
    media?: MediaSlotMediaProps;
    /**
     * Props applied to the root MUI `<Card>`, e.g. event handlers or extra DOM attributes.
     * Top-level Media props (`sx`, internal classes, `data-testid`) are merged on top of them.
     */
    card?: Omit<CardProps, 'children' | 'variant' | 'square' | 'tabIndex' | 'elevation' | 'onClick'>;
}

/**
 * Media wraps an image element and provides a way to display images in a consistent way with additional elements overlaying the image.
 * Elements that presented over the image include labels, context menu, and tooltips.
 */
export function Media(props: MediaProps): React.JSX.Element {
    const {
        image,
        statusLabels,
        actions,
        actionsAriaLabel,
        bottomTooltips,
        title,
        description,
        onTitleSubmit,
        titlePlaceholder = 'Enter title',
        onDescriptionSubmit,
        descriptionPlaceholder = 'Enter description',
        type,
        disableFullScreenPreview = false,
        fullScreenPreviewAriaLabel = 'Open full-screen preview',
        ratio = '4/3',
        objectFit = 'contain',
        height,
        slots,
        slotProps = {},
        className,
        sx,
        dataTestIdSuffix,
    } = props;

    const dataTestId = useRingDataTestId('Media', dataTestIdSuffix);

    const mediaComponent = slotProps?.media?.component;
    const isAudio = mediaComponent === 'audio';
    const isImageElement = mediaComponent === undefined || mediaComponent === 'img';
    const isFullScreenPreviewEnabled = isImageElement && Boolean(image) && !disableFullScreenPreview;
    const imageAlt = (isImage(image) ? image.title : undefined) || title || '';
    const [imageFullScreenPreview, setImageFullScreenPreview] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isSuccessfullyLoaded, setSuccessfullyLoaded] = useState(true);

    // Video and audio take their source from `slotProps.media.src`; a failed one unmounts the element, so only a
    // new source can bring it back.
    const mediaSource = slotProps?.media?.src;

    useEffect(() => {
        setSuccessfullyLoaded(false);
        setIsLoading(true);
    }, [image, mediaSource, setSuccessfullyLoaded, setIsLoading]);

    const handleImageSuccessfullyLoaded = useCallback(() => {
        setIsLoading(false);
        setSuccessfullyLoaded(true);
    }, [setSuccessfullyLoaded, setIsLoading]);

    const handleImageLoadingError = useCallback(() => {
        setIsLoading(false);
        setSuccessfullyLoaded(false);
    }, [setSuccessfullyLoaded, setIsLoading]);

    const openImageFullScreenPreview = useCallback((): void => {
        if (!isFullScreenPreviewEnabled) {
            return;
        }

        setImageFullScreenPreview(true);
    }, [isFullScreenPreviewEnabled]);

    // Enter / Space dispatch a click, so an `onClick` passed through `slotProps.media` answers the
    // keyboard too, as it would on a native button.
    const handleImageKeyDown = useCallback((event: React.KeyboardEvent<HTMLElement>): void => {
        if (event.key !== 'Enter' && event.key !== ' ') {
            return;
        }

        event.preventDefault();
        event.currentTarget.click();
    }, []);

    const onLightBoxClose = useCallback((): void => {
        setImageFullScreenPreview(false);
    }, [setImageFullScreenPreview]);

    const { sx: cardSlotSx, className: cardSlotClassName, ...cardSlotRest } = slotProps?.card ?? {};

    const mergedClassName = [cardSlotClassName, className].filter(Boolean).join(' ') || undefined;

    type SxItem = boolean | Exclude<SxProps<Theme>, ReadonlyArray<unknown>>;
    const internalCardSx: Exclude<SxProps<Theme>, ReadonlyArray<unknown> | ((theme: Theme) => unknown)> = {
        width: '100%',
        height: 'auto',
        alignItems: 'center',
        position: 'relative',
        borderRadius: 0,
        ...(isAudio && { backgroundColor: slotProps?.media?.sx?.backgroundColor ?? 'transparent' }),
    };

    const sxArray: SxItem[] = [
        internalCardSx,
        ...(Array.isArray(cardSlotSx) ? cardSlotSx : cardSlotSx ? [cardSlotSx] : []),
        ...(Array.isArray(sx) ? sx : sx ? [sx] : []),
    ];

    const shouldRenderTitle = onTitleSubmit !== undefined || (title !== undefined && title !== '');
    const shouldRenderDescription =
        onDescriptionSubmit !== undefined || (description !== undefined && description !== '');
    const descriptionTypographySx: SxProps<Theme> = { color: 'text.secondary' };
    const hasMediaSource = Boolean(image || slotProps?.media?.src);

    type FlatSx = Exclude<SxProps<Theme>, ReadonlyArray<unknown> | ((theme: Theme) => unknown)>;
    interface RenderCardMediaProps {
        useAspectRatioWrapper: boolean;
        wrapperSx?: FlatSx;
        mediaSx?: FlatSx;
        mediaBackgroundColor?: string;
    }

    interface RenderCaptionFieldProps {
        shouldRender: boolean;
        value?: string;
        onSubmit?: (value: string) => Promise<boolean>;
        placeholder: string;
        fieldName: 'title' | 'description';
        typographySx?: SxProps<Theme>;
        editableTypographySx?: SxProps<Theme>;
    }

    const renderCardMedia = ({
        useAspectRatioWrapper,
        wrapperSx,
        mediaSx,
        mediaBackgroundColor,
    }: RenderCardMediaProps): React.JSX.Element => {
        if (!hasMediaSource || (!isLoading && !isSuccessfullyLoaded)) {
            return (
                <IconPlaceholder
                    ratio={ratio}
                    fixedHeight={!useAspectRatioWrapper}
                    component={(slotProps?.media?.component as MediaType) || 'img'}
                    failed={hasMediaSource}
                    dataTestIdSuffix={dataTestIdSuffix}
                />
            );
        }

        const previewTriggerProps = isFullScreenPreviewEnabled
            ? {
                  role: 'button',
                  tabIndex: 0,
                  'aria-label': fullScreenPreviewAriaLabel,
                  onKeyDown: handleImageKeyDown,
              }
            : {};

        const cardMedia = (
            <CardMedia
                component="img"
                src={isImage(image) ? image.src : image}
                alt={isImageElement ? imageAlt : undefined}
                title={title}
                draggable={false}
                data-testid={isImageElement ? `${dataTestId}-image` : undefined}
                // Without the preview the image carries no click handler: Chromium keeps an `alt=""` image that has
                // one in the accessibility tree, so the empty alt would not hide it.
                onClick={isFullScreenPreviewEnabled ? openImageFullScreenPreview : undefined}
                {...previewTriggerProps}
                {...slotProps.media}
                // After the spread, so a consumer's handler runs alongside these instead of replacing the
                // switch to the placeholder.
                onLoad={(event: React.SyntheticEvent<HTMLImageElement & HTMLVideoElement & HTMLAudioElement>): void => {
                    handleImageSuccessfullyLoaded();
                    slotProps.media?.onLoad?.(event);
                }}
                onError={(
                    event: React.SyntheticEvent<HTMLImageElement & HTMLVideoElement & HTMLAudioElement>,
                ): void => {
                    slotProps.media?.onError?.(event);

                    // A consumer that handles the failure itself, e.g. with a fallback source, keeps the element.
                    if (!event.isDefaultPrevented()) {
                        handleImageLoadingError();
                    }
                }}
                sx={{
                    ...(useAspectRatioWrapper ? {} : { width: '100%', height: '100%' }),
                    ':hover': {
                        cursor: disableFullScreenPreview ? 'auto' : 'pointer',
                    },
                    ...(isFullScreenPreviewEnabled && {
                        // The frame clips overflow, so the ring is drawn inside the image's edge.
                        '&:focus-visible': {
                            outline: '2px solid',
                            outlineColor: 'primary.main',
                            outlineOffset: '-2px',
                        },
                    }),
                    ...slotProps?.media?.sx,
                    ...mediaSx,
                    objectFit,
                    backgroundColor: mediaBackgroundColor,
                    // The browser draws the audio player, so its colour cannot be read: the player takes the
                    // frame's fill instead, with controls that read on it (WebKit and Blink paint the panel).
                    ...(isAudio && {
                        colorScheme: (theme: Theme) => playerColorScheme(theme, mediaBackgroundColor),
                        '&::-webkit-media-controls-enclosure, &::-webkit-media-controls-panel': {
                            backgroundColor: mediaBackgroundColor ?? 'transparent',
                        },
                    }),
                }}
            />
        );

        if (useAspectRatioWrapper) {
            return (
                <AspectRatio ratio={ratio} objectFit={objectFit} sx={wrapperSx}>
                    {cardMedia}
                </AspectRatio>
            );
        }

        return (
            <Box
                sx={{
                    height: '100%',
                    aspectRatio: ratio,
                    flexShrink: 0,
                    ...wrapperSx,
                }}
            >
                {cardMedia}
            </Box>
        );
    };

    const renderCaptionField = ({
        shouldRender,
        value,
        onSubmit,
        placeholder,
        fieldName,
        typographySx,
        editableTypographySx,
    }: RenderCaptionFieldProps): React.JSX.Element | null => {
        if (!shouldRender) {
            return null;
        }

        if (onSubmit) {
            return (
                <EditableText
                    text={value ?? ''}
                    placeholder={placeholder}
                    onSubmit={onSubmit}
                    sx={{ width: '100%' }}
                    dataTestIdSuffix={dataTestIdSuffix ? `${dataTestIdSuffix}-${fieldName}` : fieldName}
                    slotProps={{
                        typography: {
                            variant: 'body2',
                            ...(editableTypographySx ? { sx: editableTypographySx } : {}),
                        },
                    }}
                />
            );
        }

        return (
            <Typography variant="body2" sx={typographySx}>
                {value}
            </Typography>
        );
    };

    const renderMediaSlot = (useAspectRatioWrapper: boolean): React.JSX.Element => {
        const slottedMedia = (
            <AspectRatio ratio={ratio} objectFit={objectFit}>
                {slots?.media}
            </AspectRatio>
        );

        if (useAspectRatioWrapper) {
            return slottedMedia;
        }

        return (
            <Box
                sx={{
                    height: '100%',
                    aspectRatio: ratio,
                    flexShrink: 0,
                }}
            >
                {slottedMedia}
            </Box>
        );
    };

    return (
        <>
            <Card {...cardSlotRest} elevation={0} className={mergedClassName} sx={sxArray} data-testid={dataTestId}>
                <Box
                    component="figure"
                    margin={0}
                    sx={{
                        width: '100%',
                        ...(isAudio && { backgroundColor: slotProps?.media?.sx?.backgroundColor ?? 'transparent' }),
                    }}
                >
                    {type && <Typography variant="overline">{type}</Typography>}
                    <Box
                        sx={{
                            position: 'relative',
                            ...(height && {
                                height,
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                backgroundColor: 'components.media.backgroundFill',
                                overflow: 'hidden',
                            }),
                            ...(isAudio && {
                                backgroundColor: slotProps?.media?.sx?.backgroundColor ?? 'transparent',
                            }),
                        }}
                    >
                        {statusLabels !== undefined && Boolean(statusLabels.length) && (
                            <StatusLabelsStack statusLabels={statusLabels} />
                        )}
                        {actions?.length && (
                            <MediaActions
                                actions={actions}
                                ariaLabel={actionsAriaLabel}
                                dataTestIdSuffix={dataTestIdSuffix}
                            />
                        )}
                        {slots?.media
                            ? renderMediaSlot(!height)
                            : height
                              ? renderCardMedia({
                                    useAspectRatioWrapper: false,
                                    mediaBackgroundColor: isAudio
                                        ? (slotProps?.media?.sx?.backgroundColor ?? 'transparent')
                                        : undefined,
                                })
                              : renderCardMedia({
                                    useAspectRatioWrapper: true,
                                    wrapperSx: isAudio
                                        ? { backgroundColor: slotProps?.media?.sx?.backgroundColor ?? 'transparent' }
                                        : undefined,
                                    mediaBackgroundColor: isAudio
                                        ? (slotProps?.media?.sx?.backgroundColor ?? 'transparent')
                                        : 'components.media.backgroundFill',
                                })}
                        {bottomTooltips !== undefined && Boolean(bottomTooltips.length) && (
                            <BottomTooltipsStack bottomTooltips={bottomTooltips} />
                        )}
                    </Box>
                    {(shouldRenderTitle || shouldRenderDescription) && (
                        <figcaption>
                            <Stack direction="column" spacing="4px">
                                {renderCaptionField({
                                    shouldRender: shouldRenderTitle,
                                    value: title,
                                    onSubmit: onTitleSubmit,
                                    placeholder: titlePlaceholder,
                                    fieldName: 'title',
                                })}
                                {renderCaptionField({
                                    shouldRender: shouldRenderDescription,
                                    value: description,
                                    onSubmit: onDescriptionSubmit,
                                    placeholder: descriptionPlaceholder,
                                    fieldName: 'description',
                                    typographySx: descriptionTypographySx,
                                    editableTypographySx: descriptionTypographySx,
                                })}
                            </Stack>
                        </figcaption>
                    )}
                </Box>
            </Card>
            <Box sx={{ position: 'absolute' }}>
                {image && !slots?.media && (
                    <LightBox
                        onClose={onLightBoxClose}
                        dataTestIdSuffix={dataTestIdSuffix}
                        images={[isImage(image) ? image : { src: image, thumbnailSrc: image }]}
                        open={imageFullScreenPreview}
                    />
                )}
            </Box>
        </>
    );
}

type MediaType = 'img' | 'video' | 'audio';

type MediaIconsMap = {
    [key in MediaType]: LucideIcon;
};

const mediaIcons: MediaIconsMap = {
    img: Image,
    video: Film,
    audio: FileMusic,
};

// Audio has no crossed-out glyph, so a failed audio source keeps its media-type icon.
const failedMediaIcons: MediaIconsMap = {
    img: ImageOff,
    video: VideoOff,
    audio: FileMusic,
};

interface IconPlaceholderProps extends Pick<AspectRatioOwnerStateProps, 'ratio'>, WithDataTestIdSuffix {
    component: MediaType;
    /** Inside a `height` box, where an `AspectRatio` would shrink to nothing as a flex item without a width. */
    fixedHeight: boolean;
    /** The source was set but did not load: an image shows `ImageOff`, as in `MediaCard`, a video `VideoOff`. */
    failed: boolean;
}

function IconPlaceholder({
    ratio,
    component,
    failed,
    fixedHeight,
    dataTestIdSuffix,
}: IconPlaceholderProps): React.JSX.Element {
    const dataTestId = useRingDataTestId('Media', dataTestIdSuffix);
    const icon = (
        <FeaturedIcon
            size="inherit"
            icon={(failed ? failedMediaIcons[component] : mediaIcons[component]) || Image}
            dataTestId={`${dataTestId}-icon-placeholder`}
        />
    );

    if (fixedHeight) {
        // The same box an image takes in a `height` frame, which already has the frame fill.
        return <Box sx={{ height: '100%', aspectRatio: ratio, flexShrink: 0 }}>{icon}</Box>;
    }

    return (
        <AspectRatio ratio={ratio}>
            <div>{icon}</div>
        </AspectRatio>
    );
}

// A mostly opaque fill, literal or a palette path, gets the controls that contrast with it; a see-through one,
// such as the default `transparent`, leaves them on the theme's mode, like the page beneath.
function playerColorScheme(theme: Theme, fill: string | undefined): 'light' | 'dark' {
    if (fill) {
        const resolved = resolvePaletteColor(theme, fill);

        try {
            const { type, values } = decomposeColor(resolved);

            if (!type.endsWith('a') || Number(values[3]) >= 0.5) {
                return getContrastRatio(resolved, '#000') >= getContrastRatio(resolved, '#fff') ? 'light' : 'dark';
            }
        } catch {
            // Not a colour `decomposeColor` reads, such as `transparent` or a CSS variable.
        }
    }

    return theme.palette.mode;
}

interface MediaActionsProps extends WithDataTestIdSuffix {
    actions: Action[];
    ariaLabel?: string;
}

function MediaActions(props: MediaActionsProps): React.JSX.Element {
    const { actions, ariaLabel, dataTestIdSuffix } = props;
    const ref = useRef<HTMLButtonElement>(null);
    const dataTestId = useRingDataTestId('Media', dataTestIdSuffix);

    return (
        <>
            <IconButton
                ref={ref}
                color="overlay"
                disableRipple={false}
                aria-label={resolveMoreActionsAriaLabel(ariaLabel)}
                data-testid={`${dataTestId}-actions`}
                sx={{
                    position: 'absolute',
                    marginLeft: 'auto',
                    right: '0.5em',
                    top: '0.5em',
                    float: 'right',
                    zIndex: 1,
                }}
            >
                <RingLucideIcon icon={EllipsisVertical} fontSize="medium" />
            </IconButton>
            <ActionBox
                dataTestId={`${dataTestId}-menu`}
                actions={actions}
                anchorEl={ref}
                placement="bottom-end"
                tooltipPlacement="right"
            />
        </>
    );
}

function StatusLabelsStack(params: { statusLabels: StatusLabelProps[] }): React.JSX.Element {
    const { statusLabels } = params;

    return (
        <Stack
            direction="column"
            spacing={0}
            sx={{
                position: 'absolute',
                float: 'top',
                top: 0,
                left: 0,
                zIndex: 1,
            }}
        >
            {statusLabels.map((statusLabelParams): React.JSX.Element => (
                <StatusLabel key={statusLabelParams.label as string} {...statusLabelParams} />
            ))}
        </Stack>
    );
}

type StatusLabelProps = Pick<ChipProps, 'label' | 'color' | 'icon'>;

// A status label is a label, not a control: the chip's tag variant, at its own 24px. The
// solid `primary` / `secondary` plates and the translucent `default` one have no tag colour
// and become the grey `stone` tag, so every label is an opaque plate.
const STATUS_LABEL_TAG_COLOR: Partial<Record<NonNullable<ChipProps['color']>, ChipProps['color']>> = {
    primary: 'stone',
    secondary: 'stone',
    default: 'stone',
};

function StatusLabel(params: StatusLabelProps): React.JSX.Element {
    const { label, color = 'error', icon } = params;

    return (
        <Chip
            label={label}
            variant="tag"
            color={STATUS_LABEL_TAG_COLOR[color] ?? color}
            size="small"
            sx={{ maxWidth: 'fit-content' }}
            icon={icon}
        />
    );
}

function BottomTooltipsStack(params: { bottomTooltips: MediaBottomTooltipProps[] }): React.JSX.Element {
    const { bottomTooltips } = params;

    return (
        <Stack
            direction="row"
            spacing={0}
            sx={{
                position: 'absolute',
                left: 0,
                bottom: 0,
                zIndex: 1,
            }}
        >
            {bottomTooltips.map((tooltipParams): React.JSX.Element => (
                <BottomTooltip key={tooltipParams.title} {...tooltipParams} />
            ))}
        </Stack>
    );
}

export interface MediaBottomTooltipProps {
    title: string;
    icon: ReactNode;
}

function BottomTooltip(params: MediaBottomTooltipProps): React.JSX.Element {
    const { title, icon } = params;

    return (
        <Tooltip title={title}>
            <IconButton disableRipple={true}>{icon}</IconButton>
        </Tooltip>
    );
}
