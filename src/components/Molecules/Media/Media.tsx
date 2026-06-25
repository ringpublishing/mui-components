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

import { AudioFileRounded, ImageRounded, MoreVert, MovieRounded, SvgIconComponent } from '@mui/icons-material';

import { CommonComponentProps, WithDataTestIdSuffix } from '../../../helpers/commonTypes.js';
import { Action, Image } from '../../../types.js';
import { EditableText } from '../../Atoms/EditableText/EditableText.js';
import { isImage } from '../../../helpers/types.js';
import { LightBox } from '../../Organisms/LightBox/LightBox.js';
import { ActionBox } from '../ActionBox/ActionBox.js';
import { AspectRatio, AspectRatioOwnerStateProps } from '../../internal/AspectRatio.js';
import { useRingDataTestId } from '../../../helpers/hooks/useRingDataTestId.js';
import { tv } from '../../../helpers/typographyMode.js';

export interface MediaProps extends CommonComponentProps, AspectRatioOwnerStateProps {
    /**
     * URL of the image. When not provided, an empty image placeholder is displayed.
     * Alternatively Image object with src, thumbnailSrc and title can be provided.
     */
    image?: string | Image;

    /**
     * Image title displayed in the bottom left corner.
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
     * Collection of status labels that are displayed over the image in the left top corner.
     */
    statusLabels?: StatusLabelProps[];

    /**
     * Collection of tooltips that are displayed over the image in the bottom left corner.
     */
    bottomTooltips?: BottomTooltipProps[];

    /**
     * Disables the full screen preview when the image is clicked. Props `image` must be provide.
     * @default false
     */
    disableFullScreenPreview?: boolean;

    /**
     * Overridable component slots. `media` accepts any ReactNode and replaces the default
     * `<CardMedia>` (e.g. for a custom video player or interactive preview component).
     */
    slots?: Slots;
    /**
     * The props used for each component slot.
     * @default {}
     */
    slotProps?: SlotProps;

    /**
     * Height for the media area (image/background section). When provided, the visual media
     * region renders at this height while caption content (title/description) is rendered below it.
     * This prop does not change default `objectFit` behaviour.
     * Accepts any valid CSS length value (e.g. `'200px'`, `'50vh'`).
     *
     * When not provided, the component uses the default aspect-ratio behaviour where height
     * is derived from the container width and the `ratio` prop.
     */
    height?: React.CSSProperties['height'];
}

interface MediaSlotPropsBackgroundColor {
    backgroundColor: string;
}

type MediaSlotProps = CardMediaProps &
    React.AudioHTMLAttributes<HTMLAudioElement> &
    React.VideoHTMLAttributes<HTMLVideoElement> & {
        sx?: MediaSlotPropsBackgroundColor;
    };

interface Slots {
    /**
     * Custom React node rendered in place of the default `<CardMedia>`.
     * Wrapped in `<AspectRatio>` so `ratio` and `objectFit` still apply to the surrounding box.
     *
     * **Note:** when this slot is provided, the built-in `<LightBox>` full-screen preview is
     * suppressed (the slot replaces the default render and `<LightBox>` only handles still
     * images). To support a custom full-screen viewer (e.g. a video player), render your own
     * modal triggered via `slotProps.card` event handlers.
     */
    media?: ReactNode;
}

interface SlotProps {
    media?: MediaSlotProps;
    /**
     * Props applied to the root MUI `<Card>` element. Useful for attaching event handlers
     * (`onMouseEnter`, `onMouseLeave`, `onFocus`) or extra DOM attributes.
     *
     * Top-level Media props (`sx`, internal classes, `data-testid`) take precedence — they
     * are merged on top, not replaced.
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
        bottomTooltips,
        title,
        description,
        onTitleSubmit,
        titlePlaceholder = 'Enter title',
        onDescriptionSubmit,
        descriptionPlaceholder = 'Enter description',
        type,
        disableFullScreenPreview = false,
        ratio = '4/3',
        objectFit = 'contain',
        height,
        slots,
        slotProps = {},
        className,
        sx,
        dataTestIdSuffix,
    } = props;

    const dataTestId = useRingDataTestId(Media.name, dataTestIdSuffix);

    const isAudio = slotProps?.media?.component === 'audio';
    const [imageFullScreenPreview, setImageFullScreenPreview] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isSuccessfullyLoaded, setSuccessfullyLoaded] = useState(true);

    useEffect(() => {
        setSuccessfullyLoaded(false);
        setIsLoading(true);
    }, [image, setSuccessfullyLoaded, setIsLoading]);

    const handleImageSuccessfullyLoaded = useCallback(() => {
        setIsLoading(false);
        setSuccessfullyLoaded(true);
    }, [setSuccessfullyLoaded, setIsLoading]);

    const handleImageLoadingError = useCallback(() => {
        setIsLoading(false);
        setSuccessfullyLoaded(false);
    }, [setSuccessfullyLoaded, setIsLoading]);

    const openImageFullScreenPreview = useCallback((): void => {
        const component = slotProps?.media?.component;

        if (disableFullScreenPreview || (component !== undefined && component !== 'img')) {
            return;
        }

        setImageFullScreenPreview(true);
    }, [disableFullScreenPreview, slotProps?.media?.component]);

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
            return <IconPlaceholder ratio={ratio} component={(slotProps?.media?.component as MediaType) || 'img'} />;
        }

        const cardMedia = (
            <CardMedia
                component="img"
                src={isImage(image) ? image.src : image}
                title={title}
                draggable={false}
                onClick={openImageFullScreenPreview}
                onLoad={handleImageSuccessfullyLoaded}
                onError={handleImageLoadingError}
                {...slotProps.media}
                sx={{
                    ...(useAspectRatioWrapper ? {} : { width: '100%', height: '100%' }),
                    ':hover': {
                        cursor: disableFullScreenPreview ? 'auto' : 'pointer',
                    },
                    ...slotProps?.media?.sx,
                    ...mediaSx,
                    objectFit,
                    backgroundColor: mediaBackgroundColor,
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
                                backgroundColor: 'components.appBar.defaultFill',
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
                        {actions?.length && <MediaActions actions={actions} dataTestIdSuffix={dataTestIdSuffix} />}
                        {slots?.media ? (
                            renderMediaSlot(!height)
                        ) : height ? (
                            renderCardMedia({
                                useAspectRatioWrapper: false,
                                mediaBackgroundColor: isAudio
                                    ? (slotProps?.media?.sx?.backgroundColor ?? 'transparent')
                                    : undefined,
                            })
                        ) : (
                            renderCardMedia({
                                useAspectRatioWrapper: true,
                                wrapperSx: isAudio
                                    ? { backgroundColor: slotProps?.media?.sx?.backgroundColor ?? 'transparent' }
                                    : undefined,
                                mediaBackgroundColor: isAudio
                                    ? (slotProps?.media?.sx?.backgroundColor ?? 'transparent')
                                    : 'components.appBar.defaultFill',
                            })
                        )}
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
    [key in MediaType]: SvgIconComponent;
};

const mediaIcons: MediaIconsMap = {
    img: ImageRounded,
    video: MovieRounded,
    audio: AudioFileRounded,
};

type MediaIconProps = {
    type: MediaType;
};

const MediaIcon = ({ type }: MediaIconProps): ReactNode => {
    const Icon = mediaIcons[type] || ImageRounded;

    return <Icon color={'disabled'} sx={{ fontSize: tv('6.25rem') }} />;
};

interface IconPlaceholderProps extends Pick<AspectRatioOwnerStateProps, 'ratio'>, WithDataTestIdSuffix {
    component: MediaType;
}

function IconPlaceholder({ ratio, component, dataTestIdSuffix }: IconPlaceholderProps): React.JSX.Element {
    const dataTestId = useRingDataTestId('Media', dataTestIdSuffix);

    return (
        <AspectRatio ratio={ratio}>
            <div data-testid={`${dataTestId}-icon-placeholder`}>
                <MediaIcon type={component} />
            </div>
        </AspectRatio>
    );
}

interface MediaActionsProps extends WithDataTestIdSuffix {
    actions: Action[];
}

function MediaActions(props: MediaActionsProps): React.JSX.Element {
    const { actions, dataTestIdSuffix } = props;
    const ref = useRef<HTMLButtonElement>(null);
    const dataTestId = useRingDataTestId('Media', dataTestIdSuffix);

    return (
        <>
            <IconButton
                ref={ref}
                disableRipple={false}
                data-testid={`${dataTestId}-actions`}
                sx={{
                    position: 'absolute',
                    marginLeft: 'auto',
                    right: '0.5em',
                    top: '0.5em',
                    float: 'right',
                    zIndex: 1,
                    borderRadius: '50%',
                    backgroundColor: 'components.mediaImage.actions',
                    '&:hover': {
                        backgroundColor: 'components.mediaImage.focusable',
                    },
                }}
            >
                <MoreVert fontSize="medium" />
            </IconButton>
            <ActionBox
                dataTestIdSuffix={dataTestIdSuffix}
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
            {statusLabels.map(
                (statusLabelParams): React.JSX.Element => (
                    <StatusLabel key={statusLabelParams.label as string} {...statusLabelParams} />
                ),
            )}
        </Stack>
    );
}

type StatusLabelProps = Pick<ChipProps, 'label' | 'color' | 'icon'>;

function StatusLabel(params: StatusLabelProps): React.JSX.Element {
    const { label, color = 'error', icon } = params;

    return (
        <Chip
            label={label}
            color={color}
            size="small"
            sx={{
                borderRadius: '0 0 0 0',
                maxWidth: 'fit-content',
            }}
            icon={icon}
        />
    );
}

function BottomTooltipsStack(params: { bottomTooltips: BottomTooltipProps[] }): React.JSX.Element {
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
            {bottomTooltips.map(
                (tooltipParams): React.JSX.Element => (
                    <BottomTooltip key={tooltipParams.title} {...tooltipParams} />
                ),
            )}
        </Stack>
    );
}

interface BottomTooltipProps {
    title: string;
    icon: ReactNode;
}

function BottomTooltip(params: BottomTooltipProps): React.JSX.Element {
    const { title, icon } = params;

    return (
        <Tooltip title={title}>
            <IconButton disableRipple={true}>{icon}</IconButton>
        </Tooltip>
    );
}
